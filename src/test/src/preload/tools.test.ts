import { expect, test } from '@jest/globals'
import * as fs from 'fs/promises'

async function listFiles(dirPath = '.'): Promise<string> {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true })
    const result = files
      .map((file) => {
        const type = file.isDirectory() ? 'Dir' : 'File'
        return `${type}: ${file.name}`
      })
      .join('\n')
    return result
  } catch (e: any) {
    return `Error listing files and directories: ${e.message}`
  }
}

test('tool', async () => {
  const files = await listFiles('/')
  console.log(files)
  expect(1).toBe(1)
  expect(2).toBe(2)
})
