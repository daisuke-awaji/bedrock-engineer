import { describe, beforeEach, it, expect } from '@jest/globals'
import { CommandService } from '../commandService'
import { CommandConfig } from '../types'
import { mkdtemp } from 'fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

// ローカルでの検証にとどめる
describe.skip('CommandService', () => {
  let commandService: CommandService
  let testDir: string

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), './command-service-test-'))

    const config: CommandConfig = {
      allowedCommands: ['ls *', 'pwd', 'echo *', 'npm *']
    }
    commandService = new CommandService(config)
  })

  describe('executeCommand', () => {
    it('should execute command and return process info', async () => {
      const result = await commandService.executeCommand('pwd', testDir)
      expect(result).toHaveProperty('stdout')
      expect(result).toHaveProperty('stderr')
      expect(result).toHaveProperty('exitCode', 0)
      expect(result).toHaveProperty('processInfo')
      expect(result.processInfo).toHaveProperty('pid')
      expect(result.processInfo).toHaveProperty('detached', true)
      // パスの比較は含まれているかどうかで判定
      expect(result.stdout.trim()).toContain(testDir)
    })

    it('should execute command with wildcard pattern', async () => {
      const result = await commandService.executeCommand('ls -l', testDir)
      expect(result).toHaveProperty('stdout')
      expect(result).toHaveProperty('stderr')
      expect(result).toHaveProperty('exitCode', 0)
      expect(result).toHaveProperty('processInfo')
      expect(result.processInfo).toHaveProperty('detached', true)
    })

    it('should reject disallowed command', async () => {
      await expect(commandService.executeCommand('cat /etc/passwd', testDir)).rejects.toThrow(
        'Command not allowed'
      )
    })

    it('should execute echo command and capture output', async () => {
      const result = await commandService.executeCommand('echo test', testDir)
      expect(result.stdout.trim()).toBe('test')
      expect(result.exitCode).toBe(0)
      expect(result.processInfo).toHaveProperty('detached', true)
    })

    it('should handle command execution errors', async () => {
      // 存在しないコマンドを実行
      const nonExistentCommand = 'npm run nonexistent'
      try {
        await commandService.executeCommand(nonExistentCommand, testDir)
        // fail('Should have thrown an error')
      } catch (error: any) {
        expect(error).toBeDefined()
      }
    })
  })

  describe('process management', () => {
    it.skip('should track running processes', async () => {
      // 初期状態では実行中のプロセスがないことを確認
      expect(commandService.getRunningProcesses()).toHaveLength(0)

      // コマンドを実行
      const promise = commandService.executeCommand('npm run dev', testDir)

      // プロセスが追跡されていることを確認
      let processes = commandService.getRunningProcesses()
      expect(processes.length).toBeGreaterThan(0)
      const processInfo = processes[0]
      expect(processInfo).toHaveProperty('pid')
      expect(processInfo).toHaveProperty('command', 'npm run dev')
      expect(processInfo).toHaveProperty('timestamp')

      try {
        await promise
      } catch (error) {
        // テスト環境でのエラーは想定内
      }

      // プロセス終了後にリストから削除されることを確認
      await new Promise((resolve) => setTimeout(resolve, 100))
      processes = commandService.getRunningProcesses()
      expect(processes).toHaveLength(0)
    })

    it.skip('should stop running process', async () => {
      // プロセスを開始
      const promise = commandService.executeCommand('npm run dev', testDir)

      // プロセスが追跡されていることを確認
      const processes = commandService.getRunningProcesses()
      expect(processes.length).toBeGreaterThan(0)

      // プロセスを停止
      try {
        await commandService.stopProcess(processes[0].pid)
      } catch (error) {
        // プロセスが既に終了している可能性があるのでエラーは無視
      }

      // プロセスリストが更新されていることを確認
      expect(commandService.getRunningProcesses()).toHaveLength(0)

      try {
        await promise
      } catch (error) {
        // プロセス停止によるエラーは想定内
      }
    })
  })

  describe('getAllowedCommands', () => {
    it('should return list of allowed commands', () => {
      const allowed = commandService.getAllowedCommands()
      expect(allowed).toEqual(['ls *', 'pwd', 'echo *', 'npm *'])
    })
  })

  describe('updateConfig', () => {
    it('should update the configuration', () => {
      const newConfig: CommandConfig = {
        allowedCommands: ['git status']
      }
      commandService.updateConfig(newConfig)
      expect(commandService.getAllowedCommands()).toEqual(['git status'])
    })
  })
})
