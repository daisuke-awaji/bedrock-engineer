import { exec } from 'child_process'
import { CommandConfig, CommandExecutionResult, CommandPattern } from './types'

export class CommandService {
  private config: CommandConfig

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

  // コマンドを実行
  async executeCommand(command: string): Promise<CommandExecutionResult> {
    return new Promise((resolve, reject) => {
      if (!this.isCommandAllowed(command)) {
        reject(new Error(`Command not allowed: ${command}`))
        return
      }

      exec(command, (error, stdout, stderr) => {
        resolve({
          stdout: stdout,
          stderr: stderr,
          exitCode: error ? error.code || 1 : 0
        })
      })
    })
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
