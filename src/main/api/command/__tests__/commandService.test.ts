import { describe, beforeEach, it, expect } from '@jest/globals'
import { CommandService } from '../commandService'
import { CommandConfig } from '../types'

describe('CommandService', () => {
  let commandService: CommandService

  beforeEach(() => {
    const config: CommandConfig = {
      allowedCommands: ['ls *', 'pwd', 'aws ec2 describe-instances --output table']
    }
    commandService = new CommandService(config)
  })

  describe('executeCommand', () => {
    it('should execute allowed command', async () => {
      const result = await commandService.executeCommand('pwd')
      expect(result).toHaveProperty('stdout')
      expect(result).toHaveProperty('stderr')
      expect(result).toHaveProperty('exitCode')
    })

    it('should execute command with wildcard', async () => {
      const result = await commandService.executeCommand('ls -l')
      expect(result).toHaveProperty('stdout')
      expect(result).toHaveProperty('stderr')
      expect(result).toHaveProperty('exitCode')
    })

    it('should reject disallowed command', async () => {
      await expect(commandService.executeCommand('cat /etc/passwd')).rejects.toThrow(
        'Command not allowed'
      )
    })
  })

  describe('getAllowedCommands', () => {
    it('should return list of allowed commands', () => {
      const allowed = commandService.getAllowedCommands()
      expect(allowed).toEqual(['ls *', 'pwd', 'aws ec2 describe-instances --output table'])
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
