export interface CommandPatternConfig {
  pattern: string;
  description: string;
}

export interface CommandConfig {
  allowedCommands: CommandPatternConfig[]
}

export interface ProcessInfo {
  pid: number
  command: string
  detached: boolean
}

export interface DetachedProcessInfo {
  pid: number
  command: string
  timestamp: number
}

export interface CommandInput {
  command: string
  cwd: string
}

export interface CommandStdinInput {
  pid: number
  stdin: string
}

export interface CommandExecutionResult {
  stdout: string
  stderr: string
  exitCode: number
  processInfo?: ProcessInfo
  requiresInput?: boolean
  prompt?: string
}

export interface CommandPattern {
  command: string
  args: string[]
  wildcard: boolean
}

export interface CommandSettings {
  allowedCommands: CommandPatternConfig[]
}

export interface ProcessOutput {
  stdout: string
  stderr: string
  code: number | null
}

export interface ProcessState {
  isRunning: boolean
  hasError: boolean
  output: ProcessOutput
  process?: any // childProcess instance
}

export interface InputDetectionPattern {
  pattern: string | RegExp
  promptExtractor?: (output: string) => string
}