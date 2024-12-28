import { agent } from './agent'
import { examples } from './examples'
import { messages } from './messages'

export const chatPage = {
  en: {
    ...agent.en,
    ...examples.en,
    ...messages.en
  },
  ja: {
    ...agent.ja,
    ...examples.ja,
    ...messages.ja
  }
}