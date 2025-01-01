import { spawn } from 'child_process'
import {
  CommandConfig,
  CommandExecutionResult,
  CommandPattern,
  DetachedProcessInfo,
  ProcessInfo
} from './types'

export class CommandService {
  private config: CommandConfig
  private runningProcesses: Map<number, DetachedProcessInfo> = new Map()

  constructor(config: CommandConfig) {
    this.config = config
  }

  private parseCommandPattern(commandStr: string): CommandPattern {
    const parts = commandStr.split(' ')
    const hasWildcard = parts.some((part) => part === '*')

    return {
      command: parts[0],
      args: parts.slice(1),
      wildcard: hasWildcard
    }
  }

  private isCommandAllowed(commandToExecute: string): boolean {
    const executeParts = this.parseCommandPattern(commandToExecute)

    return this.config.allowedCommands.some((allowedCmd) => {
      const allowedParts = this.parseCommandPattern(allowedCmd)

      if (allowedParts.command !== executeParts.command) {
        return false
      }

      if (allowedParts.wildcard) {
        return true
      }

      if (allowedParts.args.length !== executeParts.args.length) {
        return false
      }

      return allowedParts.args.every((arg, index) => {
        if (arg === '*') {
          return true
        }
        return arg === executeParts.args[index]
      })
    })
  }

  async executeCommand(command: string, cwd: string): Promise<CommandExecutionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isCommandAllowed(command)) {
        reject(new Error(`Command not allowed: ${command}`))
        return
      }

      const [cmd, ...args] = command.split(' ')

      const process = spawn(cmd, args, {
        cwd,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      })

      if (typeof process.pid === 'undefined') {
        reject(new Error('Failed to start process: PID is undefined'))
        return
      }

      // プロセス情報を保存
      const processInfo: DetachedProcessInfo = {
        pid: process.pid,
        command,
        timestamp: Date.now()
      }
      this.runningProcesses.set(process.pid, processInfo)

      let stdout = ''
      let stderr = ''
      let errorOccurred = false
      let isCompleted = false
      // eslint-disable-next-line
      let startupTimeout: NodeJS.Timeout

      const cleanup = () => {
        if (process.pid) {
          this.runningProcesses.delete(process.pid)
        }
        if (startupTimeout) {
          clearTimeout(startupTimeout)
        }
      }

      const completeWithError = (error: string) => {
        if (!isCompleted) {
          isCompleted = true
          cleanup()
          reject(new Error(error))
        }
      }

      const completeWithSuccess = () => {
        if (!isCompleted) {
          isCompleted = true
          cleanup()
          const processInfo: ProcessInfo = {
            pid: process.pid!,
            command,
            detached: true
          }
          resolve({
            stdout,
            stderr,
            exitCode: 0,
            processInfo
          })
        }
      }

      process.stdout.on('data', (data) => {
        const chunk = data.toString()
        stdout += chunk

        // 成功パターンの検出
        if (
          chunk.includes('listening') ||
          chunk.includes('ready') ||
          chunk.includes('started') ||
          chunk.includes('running') ||
          chunk.includes('live') ||
          (chunk.includes('watching') && !errorOccurred) // errorOccurredフラグを確認
        ) {
          completeWithSuccess()
        }

        // エラーパターンの検出
        if (
          chunk.includes('EADDRINUSE') ||
          chunk.includes('Error:') ||
          chunk.includes('error:') ||
          chunk.includes('ERR!') ||
          chunk.includes('app crashed')
        ) {
          errorOccurred = true
          completeWithError(`Command failed: \n${stdout}\n${stderr}`)
        }
      })

      process.stderr.on('data', (data) => {
        const chunk = data.toString()
        stderr += chunk

        // エラーパターンの検出
        if (
          chunk.includes('EADDRINUSE') ||
          chunk.includes('Error:') ||
          chunk.includes('error:') ||
          chunk.includes('ERR!')
        ) {
          errorOccurred = true
          completeWithError(`Command failed: \n${stdout}\n${stderr}`)
        }
      })

      process.on('error', (error) => {
        completeWithError(
          `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      })

      process.on('exit', (code) => {
        // エラーが発生していない場合のみ、通常の終了として処理
        if (!errorOccurred && code === 0 && !isCompleted) {
          completeWithSuccess()
        } else if (!isCompleted) {
          completeWithError(`Process exited with code ${code}\n${stderr}`)
        }
      })

      // タイムアウトの設定
      startupTimeout = setTimeout(() => {
        if (!isCompleted) {
          if (errorOccurred) {
            completeWithError(`Command failed to start: \n${stderr}`)
          } else if (stdout.includes('waiting for file changes')) {
            completeWithSuccess() // nodemonの待機状態は成功として扱う
          } else {
            completeWithSuccess() // タイムアウト時は成功として扱う
          }
        }
      }, 5000) // 5秒のタイムアウト
    })
  }

  async stopProcess(pid: number): Promise<void> {
    const processInfo = this.runningProcesses.get(pid)
    if (processInfo) {
      try {
        process.kill(-pid) // プロセスグループ全体を終了
        this.runningProcesses.delete(pid)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        throw new Error(`Failed to stop process ${pid}: ${errorMessage}`)
      }
    }
  }

  getRunningProcesses(): DetachedProcessInfo[] {
    return Array.from(this.runningProcesses.values())
  }

  getAllowedCommands(): string[] {
    return [...this.config.allowedCommands]
  }

  updateConfig(newConfig: CommandConfig): void {
    this.config = newConfig
  }
}
