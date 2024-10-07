import { test, expect } from '@jest/globals'
import GitignoreLikeMatcher from './gitignore-like-matcher'

test('gitignore-like-matcher', () => {
  const ignoreFiles = ['node_modules', 'dist/**', '*.test.ts']
  const matcher = new GitignoreLikeMatcher(ignoreFiles)
  expect(matcher.isIgnored('node_modules/package.json')).toBe(true)
  expect(matcher.isIgnored('dist/index.js')).toBe(true)
  expect(matcher.isIgnored('src/index.test.ts')).toBe(true)
  expect(matcher.isIgnored('src/index.ts')).toBe(false)
})

test('gitignore-like-matcher fullpath', () => {
  const ignoreFiles = ['node_modules', 'dist/**', '*.test.ts']
  const matcher = new GitignoreLikeMatcher(ignoreFiles)
  expect(matcher.isIgnored('/Users/user/work/dir/node_modules/package.json')).toBe(true)
  expect(matcher.isIgnored('/Users/user/work/dir/dist/index.js')).toBe(true)
  expect(matcher.isIgnored('/Users/user/work/dir/src/index.test.ts')).toBe(true)
  expect(matcher.isIgnored('/Users/user/work/dir/src/index.ts')).toBe(false)
})
