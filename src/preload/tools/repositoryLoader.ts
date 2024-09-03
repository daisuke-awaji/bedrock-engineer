import * as fs from 'fs'
import * as path from 'path'

function getIgnoreList(ignoreFilePath: string): string[] {
  try {
    const content = fs.readFileSync(ignoreFilePath, 'utf8')
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line !== '')
  } catch (error) {
    console.error(`Error reading ignore file: ${error}`)
    return []
  }
}

function shouldIgnore(filePath: string, ignoreList: string[]): boolean {
  return ignoreList.some((pattern) => {
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.')
    return new RegExp(`^${regexPattern}$`).test(filePath)
  })
}

function processRepository(
  repoPath: string,
  ignoreList: string[],
  outputFile: fs.WriteStream
): void {
  const processDirectory = (currentPath: string) => {
    const files = fs.readdirSync(currentPath)
    for (const file of files) {
      const filePath = path.join(currentPath, file)
      const stats = fs.statSync(filePath)

      if (stats.isDirectory()) {
        processDirectory(filePath)
      } else {
        const relativeFilePath = path.relative(repoPath, filePath)
        if (!shouldIgnore(relativeFilePath, ignoreList)) {
          try {
            const contents = fs.readFileSync(filePath, 'utf8')
            outputFile.write('-'.repeat(4) + '\n')
            outputFile.write(`${relativeFilePath}\n`)
            outputFile.write(`${contents}\n`)
          } catch (error) {
            console.error(`Error reading file ${filePath}: ${error}`)
          }
        }
      }
    }
  }

  processDirectory(repoPath)
}

export function loadRepository(repoPath: string, outputFilePath: string = 'output.txt'): void {
  const ignoreFilePath = path.join(repoPath, '.gptignore')
  let ignoreList: string[] = []

  if (fs.existsSync(ignoreFilePath)) {
    ignoreList = getIgnoreList(ignoreFilePath)
  }

  const outputFile = fs.createWriteStream(outputFilePath)

  processRepository(repoPath, ignoreList, outputFile)
  outputFile.write('--END--')
  outputFile.end()

  console.log(`Repository contents written to ${outputFilePath}.`)
}
