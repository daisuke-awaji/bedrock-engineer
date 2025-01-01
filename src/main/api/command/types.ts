export interface CommandConfig {
  // 許可するコマンドのパターン配列
  allowedCommands: string[]
}

export interface DetachedProcessInfo {
  pid: number
  command: string
  timestamp: number
}

export interface CommandExecutionResult {
  stdout: string
  stderr: string
  exitCode: number
  processInfo?: {
    pid: number
    command: string
    detached: boolean
  }
}

// コマンドマッチングのための型
export interface CommandPattern {
  command: string
  args: string[]
  wildcard: boolean
}

// Store用の設定型
export interface CommandSettings {
  allowedCommands: string[]
}
