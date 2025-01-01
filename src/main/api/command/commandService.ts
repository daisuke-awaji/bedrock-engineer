import { exec, spawn } from 'child_process'
import { CommandConfig, CommandExecutionResult, CommandPattern, DetachedProcessInfo } from './types'

export class CommandService {
  private config: CommandConfig
  private runningProcesses: Map<number, DetachedProcessInfo> = new Map()

  constructor(config: CommandConfig) {
    this.config = config
  }

  // コマンド文字列をパターンに分解
  private parseCommandPattern(commandStr: string): CommandPattern {
    const parts = commandStr.split(' ')
    const hasWildcard = parts.some((part) => part === '*')

    return {
      command: parts[0],
      args: parts.slice(1),
      wildcard: hasWildcard
    }
  }

  // 実行しようとするコマンドが許可されているかチェック
  private isCommandAllowed(commandToExecute: string): boolean {
    const executeParts = this.parseCommandPattern(commandToExecute)

    return this.config.allowedCommands.some((allowedCmd) => {
      const allowedParts = this.parseCommandPattern(allowedCmd)

      // コマンド名が一致しない場合はfalse
      if (allowedParts.command !== executeParts.command) {
        return false
      }

      // ワイルドカードが使用されている場合は、コマンド名の一致だけで許可
      if (allowedParts.wildcard) {
        return true
      }

      // 引数の数が一致しない場合はfalse
      if (allowedParts.args.length !== executeParts.args.length) {
        return false
      }

      // 各引数を比較
      return allowedParts.args.every((arg, index) => {
        if (arg === '*') {
          return true // ワイルドカードは任意の引数にマッチ
        }
        return arg === executeParts.args[index]
      })
    })
  }

  // 常駐プロセス系のコマンドかどうかを判定
  private isLongRunningCommand(command: string): boolean {
    const longRunningPatterns = [
      'npm run dev',
      'npm start',
      'yarn dev',
      'yarn start',
      'vue-cli-service serve',
      'next dev',
      'nuxt dev'
    ]
    return longRunningPatterns.some((pattern) => command.startsWith(pattern))
  }

  // コマンドを実行
  async executeCommand(command: string, cwd: string): Promise<CommandExecutionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isCommandAllowed(command)) {
        reject(new Error(`Command not allowed: ${command}`))
        return
      }

      // 開発サーバー系のコマンドの場合
      if (this.isLongRunningCommand(command)) {
        const [cmd, ...args] = command.split(' ')

        const process = spawn(cmd, args, {
          cwd,
          detached: true,
          stdio: ['ignore', 'pipe', 'pipe']
        })

        // process.pid が undefined の場合はエラー
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

        // 初期化ログを収集
        let initialLogs = ''
        let errorLogs = ''
        const initializationTimeout = 5000 // 5秒
        const startTime = Date.now()
        let resolved = false

        // タイムアウトハンドラー
        const timeoutHandler = setTimeout(() => {
          if (!resolved) {
            resolved = true
            // エラーログがある場合はエラーとして扱う
            if (errorLogs.length > 0) {
              this.cleanupProcess(process)
              reject(new Error(`Command failed to start: \n${errorLogs}`))
            } else {
              resolve({
                stdout: initialLogs,
                stderr: '',
                exitCode: 0,
                processInfo: {
                  pid: process.pid!,
                  command,
                  detached: true
                }
              })
            }
          }
        }, initializationTimeout)

        process.stdout.on('data', (data) => {
          const chunk = data.toString()
          initialLogs += chunk
          console.log('Server output:', chunk) // デバッグ用

          // エラーを示す可能性のある文字列をチェック
          if (
            chunk.includes('EADDRINUSE') ||
            chunk.includes('Error:') ||
            chunk.includes('error:')
          ) {
            errorLogs += chunk
          }

          // クラッシュ状態を示す文字列をチェック
          if (chunk.includes('app crashed') || chunk.includes('waiting for file changes')) {
            if (!resolved) {
              resolved = true
              clearTimeout(timeoutHandler)
              this.cleanupProcess(process)
              reject(new Error(`Application crashed: \n${initialLogs}\n${errorLogs}`))
            }
            return
          }

          // 正常な起動を示すキーワード
          if (
            !resolved &&
            (chunk.includes('listening') ||
              chunk.includes('ready') ||
              chunk.includes('started') ||
              chunk.includes('running') ||
              chunk.includes('live') ||
              chunk.includes('compiled') ||
              chunk.includes('successfully') ||
              chunk.includes('development server'))
          ) {
            resolved = true
            clearTimeout(timeoutHandler)
            resolve({
              stdout: initialLogs,
              stderr: errorLogs,
              exitCode: 0,
              processInfo: {
                pid: process.pid!,
                command,
                detached: true
              }
            })
          }
        })

        // エラー出力の収集
        process.stderr.on('data', (data) => {
          const chunk = data.toString()
          errorLogs += chunk
          console.log('Server error:', chunk) // デバッグ用

          // 重大なエラーの場合は即座に失敗として扱う
          if (
            chunk.includes('EADDRINUSE') ||
            chunk.includes('Error:') ||
            chunk.includes('error:')
          ) {
            if (!resolved) {
              resolved = true
              clearTimeout(timeoutHandler)
              this.cleanupProcess(process)
              reject(new Error(`Command failed: \n${errorLogs}`))
            }
          }
        })

        // エラーハンドリング
        process.on('error', (error) => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeoutHandler)
            this.cleanupProcess(process)
            reject(
              new Error(
                `Command execution failed: ${error instanceof Error ? error.message : 'Unknown error'}\n${errorLogs}`
              )
            )
          }
        })

        // 予期せぬ終了のハンドリング
        process.on('exit', (code) => {
          clearTimeout(timeoutHandler)
          if (code !== 0 && !resolved) {
            this.cleanupProcess(process)
            reject(new Error(`Process exited with code ${code}\n${errorLogs}`))
          }
        })
      } else {
        // 通常のコマンドの場合
        exec(command, { cwd }, (error, stdout, stderr) => {
          resolve({
            stdout,
            stderr,
            exitCode: error ? error.code || 1 : 0
          })
        })
      }
    })
  }

  // プロセスのクリーンアップ
  private cleanupProcess(process: any): void {
    if (process.pid) {
      this.runningProcesses.delete(process.pid)
      try {
        process.kill()
      } catch (error) {
        console.error('Failed to kill process:', error)
      }
    }
  }

  // 実行中のプロセスを停止
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

  // 実行中のプロセス一覧を取得
  getRunningProcesses(): DetachedProcessInfo[] {
    return Array.from(this.runningProcesses.values())
  }

  // 許可されているコマンドの一覧を取得
  getAllowedCommands(): string[] {
    return [...this.config.allowedCommands]
  }

  // 設定を更新
  updateConfig(newConfig: CommandConfig): void {
    this.config = newConfig
  }
}
