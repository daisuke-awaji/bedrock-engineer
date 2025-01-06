export type Agent = {
  id: string
  title: string
  tags: string[]
  systemPrompt: string
  author: {
    name: string
    url: string
    avatar: string
  }
}
