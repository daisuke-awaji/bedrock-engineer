export interface ContentChunk {
  index: number
  total: number
  content: string
  metadata?: {
    url?: string
    timestamp: number
  }
}

export class ContentChunker {
  private static readonly MAX_CHUNK_SIZE = 50000 // 約50,000文字（Claude 3 Haikuの制限を考慮）

  static splitContent(content: string, metadata: { url?: string }): ContentChunk[] {
    const chunks: ContentChunk[] = []
    const timestamp = Date.now()

    // HTMLの場合、主要なコンテンツを抽出
    const cleanContent = metadata.url ? this.extractMainContent(content) : content

    // コンテンツを適切なサイズに分割
    const totalChunks = Math.ceil(cleanContent.length / this.MAX_CHUNK_SIZE)

    for (let i = 0; i < totalChunks; i++) {
      const start = i * this.MAX_CHUNK_SIZE
      const end = Math.min((i + 1) * this.MAX_CHUNK_SIZE, cleanContent.length)

      chunks.push({
        index: i + 1,
        total: totalChunks,
        content: cleanContent.slice(start, end),
        metadata: {
          ...metadata,
          timestamp
        }
      })
    }

    return chunks
  }

  private static extractMainContent(html: string): string {
    // 基本的なHTMLクリーニング
    const content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // スクリプトの削除
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // スタイルの削除
      .replace(/<[^>]+>/g, '\n') // タグを改行に変換
      .replace(/&nbsp;/g, ' ') // HTMLエンティティの変換
      .replace(/\s+/g, ' ') // 連続する空白の削除
      .trim()

    return content
  }
}
