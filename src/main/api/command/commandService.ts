import { spawn } from 'child_process'
import { CommandConfig, CommandExecutionResult, CommandPattern, DetachedProcessInfo, ProcessInfo } from './types'

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
      let isCompleted = false

      const cleanup = () => {
        if (process.pid) {
          this.runningProcesses.delete(process.pid)
        }
      }

      process.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      process.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      // プロセスのエラーハンドリング
      process.on('error', (error) => {
        if (!isCompleted) {
          isCompleted = true
          cleanup()
          reject(new Error(`Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      })

      // プロセスの終了ハンドリング
      process.on('exit', (code) => {
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
            exitCode: code || 0,
            processInfo
          })
        }
      })
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