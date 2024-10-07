import * as path from 'path'

class GitignoreLikeMatcher {
  private patterns: { pattern: string; isNegation: boolean }[]
  constructor(patterns: string[]) {
    this.patterns = patterns.map((pattern) => ({
      pattern: pattern.startsWith('!') ? pattern.slice(1) : pattern,
      isNegation: pattern.startsWith('!')
    }))
  }

  isIgnored(filePath: string): boolean {
    const normalizedPath = path.normalize(filePath).replace(/\\/g, '/')
    let ignored = false

    for (const { pattern, isNegation } of this.patterns) {
      const match = this.matchPattern(normalizedPath, pattern)

      if (match) {
        if (isNegation) {
          // Negation pattern
          if (!this.isParentIgnored(normalizedPath)) {
            ignored = false
          }
        } else {
          // Normal pattern
          ignored = true
        }
      }
    }

    return ignored
  }

  private matchPattern(filePath: string, pattern: string): boolean {
    // Handle directory-only patterns
    if (pattern.endsWith('/') && !filePath.endsWith('/')) {
      filePath += '/'
    }

    // Convert gitignore pattern to RegExp
    const regex = this.convertGitignorePatternToRegExp(pattern)

    // Test the file path against the regex
    return regex.test(filePath)
  }

  private isParentIgnored(filePath: string): boolean {
    const parentDir = path.dirname(filePath)
    if (parentDir === '.' || parentDir === '/') {
      return false
    }
    return this.isIgnored(parentDir)
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  private convertGitignorePatternToRegExp(pattern: string): RegExp {
    let regexPattern = ''

    if (pattern.startsWith('/')) {
      regexPattern = '^'
      pattern = pattern.slice(1)
    } else {
      regexPattern = '(^|/)'
    }

    const parts = pattern.split('/')

    for (let i = 0; i < parts.length; i++) {
      let part = parts[i]
      if (i > 0) regexPattern += '/'

      if (part === '**') {
        regexPattern += '.*'
      } else {
        part = this.escapeRegExp(part)
        part = part.replace(/\\\*/g, '[^/]*')
        part = part.replace(/\\\?/g, '[^/]')
        regexPattern += part
      }
    }

    if (!pattern.endsWith('/')) {
      regexPattern += '($|/)'
    }

    return new RegExp(regexPattern)
  }
}

export default GitignoreLikeMatcher
