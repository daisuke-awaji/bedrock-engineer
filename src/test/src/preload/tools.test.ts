import { expect, test } from '@jest/globals'
import * as fs from 'fs/promises'
import { applyPatch } from 'diff'

export async function applyPatchToFile(filePath: string, patch: string): Promise<string> {
  try {
    // ファイルの内容を読み込む
    const originalContent = await fs.readFile(filePath, 'utf-8')

    // パッチを適用
    const patchedContent = applyPatch(originalContent, patch, { fuzzFactor: 2 })
    console.log(patchedContent)
    if (typeof patchedContent === 'string') {
      // 変更された内容をファイルに書き込む
      await fs.writeFile(filePath, patchedContent, 'utf-8')
      return `Successfully applied patch to ${filePath}`
    } else {
      throw new Error(`Failed to apply patch. ${JSON.stringify(patchedContent)}`)
    }
  } catch (e: any) {
    console.log(e)
    return `Error applying patch to ${filePath}: ${e.message}`
  }
}

test('applyPatchToFile', async () => {
  const patch = `--- a/greeting.ts
+++ b/greeting.ts
@@ -1,3 +1,3 @@
 function greeting(name: string) {
-   console.log("Hello, " + name);
+   console.log("Hello, " + n);
 }
`

  const res = await applyPatchToFile('/Users/geeawa/work/electron/bedrock-engineer/aaa.js', patch)
  console.log(res)
  expect(1).toBe(1)
})
