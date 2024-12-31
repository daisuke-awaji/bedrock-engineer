import { agent } from './agent'
import { examples } from './examples'
import { messages } from './messages'
import { history } from './history'

export const chatPage = {
  en: {
    ...agent.en,
    ...examples.en,
    ...messages.en,
    ...history.en,
    ...{
      textarea: {
        placeholder: 'Type message or add images ({{modifier}}+V / drop)',
        imageValidation: {
          tooLarge: 'Image is too large (max: 3.75MB)',
          dimensionTooLarge: 'Image dimensions are too large (max: 8000px)',
          tooManyImages: 'Maximum 20 images allowed',
          unsupportedFormat: 'Unsupported image format: {{format}}'
        },
        aria: {
          removeImage: 'Remove image',
          sendMessage: 'Send message',
          sending: 'Sending...'
        }
      }
    }
  },
  ja: {
    ...agent.ja,
    ...examples.ja,
    ...messages.ja,
    ...history.ja,
    ...{
      textarea: {
        placeholder: 'メッセージを入力、または画像を追加 ({{modifier}}+V / ドロップ)',
        imageValidation: {
          tooLarge: '画像が大きすぎます (上限: 3.75MB)',
          dimensionTooLarge: '画像サイズが大きすぎます (上限: 8000px)',
          tooManyImages: '画像は最大20枚までです',
          unsupportedFormat: '未対応の画像形式です: {{format}}'
        },
        aria: {
          removeImage: '画像を削除',
          sendMessage: 'メッセージを送信',
          sending: '送信中...'
        }
      }
    }
  }
}
