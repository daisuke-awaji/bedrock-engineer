import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const defaultLaunguage = window.store.get('language')

const resources = {
  en: {
    translation: {
      'Welcome to Bedrock Engineer': 'Welcome to Bedrock Engineer',
      'This is AI assistant of software development tasks':
        'This is AI assistant of software development tasks',
      'Start by the menu on the left or': 'Start by the menu on the left or',
      Setting: 'Setting',
      'Project Setting': 'Project Setting',
      'Agent Chat': 'Agent Chat',
      'Tavily Search API Key': 'Tavily Search API Key',
      'Amazon Bedrock': 'Amazon Bedrock',
      'LLM (Large Language Model)': 'LLM (Large Language Model)',
      'Inference Parameters': 'Inference Parameters',
      'Max Tokens': 'Max Tokens',
      Temperature: 'Temperature',
      topP: 'topP',
      Figma: 'Figma',
      'Connect to Figma': 'Connect to Figma',
      'Personal access token': 'Personal access token',
      'Figma personal access token': 'Figma personal access token',
      'Advanced Setting': 'Advanced Setting',
      'When writing a message, press': 'When writing a message, press',
      to: 'to',
      'Send the message': 'Send the message',
      'Start a new line (use': 'Start a new line (use',
      'to send)': 'to send)',
      'Invalid model': 'Invalid model',
      // StepFunctionsGeneratorPage
      'What kind of step functions will you create?':
        'What kind of step functions will you create?',
      'Order processing workflow': 'Order processing workflow',
      '7 types of State': '7 types of State',
      'Nested Workflow': 'Nested Workflow',
      'User registration process': 'User registration process',
      'Distributed Map to process CSV in S3': 'Distributed Map to process CSV in S3',
      'Create order processing workflow': 'Create order processing workflow',
      'Please implement a workflow that combines the following seven types':
        'Please implement a workflow that combines the following seven types',
      'Create Nested Workflow example': 'Create Nested Workflow example',
      'Implement the workflow for user registration processing': `Implement the workflow for user registration processing
        First, use Lambda to verify the input contents.

Next, if there is no problem with the input content, save the information to Dynamodb.
Finally, send an email. The email uses AMAAON SNS.

If Lambda's input content fails, dynamodb will not save information and will notify the user by e -mail.

When using dynamodb or SNS, do not use Lambda and weigh AWS native integration.
`,
      'Use the distributed map to repeat the row of the CSV file generated in S3': `Use the distributed map to repeat the row of the CSV file generated in S3
Each line has orders and shipping information.
The distributed map processor repeats the batch of these rows and uses the Lambda function to detect the delayed order.
After that, send a message to the SQS queue for each delayed order.`
    }
  },
  ja: {
    translation: {
      'Welcome to Bedrock Engineer': 'Bedrock Engineer にようこそ',
      'This is AI assistant of software development tasks':
        '私は、ソフトウェア開発タスクに特化したAIアシスタントです',
      'Start by the menu on the left or':
        '左のメニューから開始するか、次のショートカットが利用できます',
      Setting: '設定',
      'Project Setting': 'プロジェクト設定',
      'Agent Chat': 'エージェントチャット',
      'Tavily Search API Key': 'Tavily 検索 API キー',
      'Amazon Bedrock': 'Amazon Bedrock',
      'LLM (Large Language Model)': 'LLM（大規模言語モデル）',
      'Inference Parameters': '推論パラメータ',
      'Max Tokens': '最大トークン数',
      Temperature: '温度',
      topP: 'トップP',
      Figma: 'Figma',
      'Connect to Figma': 'Figmaに接続',
      'Personal access token': '個人アクセストークン',
      'Figma personal access token': 'Figma個人アクセストークン',
      'Advanced Setting': '詳細設定',
      'When writing a message, press': 'メッセージを書いているとき、',
      to: 'を押すと',
      'Send the message': 'メッセージを送信',
      'Start a new line (use': '改行（',
      'to send)': 'で送信）',
      'Invalid model': '無効なモデル',
      // StepFunctionsGeneratorPage

      'What kind of step functions will you create?': 'どのようなステップ関数を作成しますか？',
      'Order processing workflow': '注文処理ワークフロー',
      '7 types of State': '7つの状態タイプ',
      'Nested Workflow': 'ネストされたワークフロー',
      'User registration process': 'ユーザー登録プロセス',
      'Distributed Map to process CSV in S3': 'S3のCSVを処理する分散マップ',
      'Create order processing workflow': '注文処理ワークフローを作成する',
      'Please implement a workflow that combines the following seven types':
        '以下の7つのタイプを組み合わせたワークフローを実装してください',
      'Create Nested Workflow example': 'ネストされたワークフローの例を作成する',
      'Implement the workflow for user registration processing': `ユーザー登録処理のワークフローを実装する

まず、Lambda を使って入力内容を確認します。
次に、入力内容に問題がなければ、情報を Dynamodb に保存します。
最後に、メールを送信します。メールは AMAAON SNS を使用します。
Lambda の入力内容が失敗した場合、dynamodb は情報を保存せず、ユーザーにメールで通知します。
dynamodb または SNS を使用する場合は、Lambda を使用せず、AWS ネイティブ統合を検討してください。
`,
      'Use the distributed map to repeat the row of the CSV file generated in S3': `S3で生成されたCSVファイルの行を繰り返すために分散マップを使用する
各行には注文と配送情報があります。
分散マッププロセッサはこれらの行のバッチを繰り返し、Lambda 関数を使用して遅延注文を検出します。
その後、遅延注文ごとに SQS キューにメッセージを送信します。`
    }
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLaunguage,
  interpolation: {
    escapeValue: false
  }
})

export default i18n
