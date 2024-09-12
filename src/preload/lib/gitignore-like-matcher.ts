import * as path from 'path'
import { minimatch } from 'minimatch'

class GitignoreLikeMatcher {
  private patterns: string[]

  constructor(patterns: string[]) {
    this.patterns = patterns
  }

  isIgnored(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath)

    for (const pattern of this.patterns) {
      if (pattern.startsWith('!')) {
        // Negation pattern
        if (minimatch(normalizedPath, pattern.slice(1))) {
          return false
        }
      } else {
        // Normal pattern
        if (minimatch(normalizedPath, pattern)) {
          return true
        }
      }
    }

    return false
  }
}

export default GitignoreLikeMatcher
