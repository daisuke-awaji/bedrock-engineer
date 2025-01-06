export const agent = {
  en: {
    'What is Amazon Bedrock': 'What is Amazon Bedrock',
    'What is Amazon Bedrock description':
      'Search for the latest information about Amazon Bedrock and summarize what it can do in a concise manner.',
    nameDescription:
      'Enter the display name of the agent (e.g., Programming Tutor, Technical Document Writer)',
    descriptionDescription: 'Briefly describe the role and characteristics of this agent.',
    systemPrompt: 'System Prompt',
    systemPromptPlaceholder: `Example: For this project ({{projectPath}}), I will provide support with the following approach:
- Understanding the project structure and providing appropriate advice
- Suggestions for improving code quality
- Guidance based on best practices`,
    systemPromptDescription:
      'Define how the agent should behave and respond. Describe in detail what role it should play and how it should respond.',
    placeholders: 'Available Placeholders:',
    projectPathPlaceholder: 'Current project directory path',
    allowedCommandsPlaceholder: 'Allowed commands',
    scenariosDescription:
      'Register commonly used interaction patterns as scenarios. Enter the title and specific content of the scenario.',
    scenarioTitle: 'Scenario title',
    scenarioTitlePlaceholder: 'e.g., Python Basic Lesson',
    scenarioContent: 'Scenario content',
    scenarioContentPlaceholder: 'e.g., Explain the basic syntax of Python',
    addNewAgent: 'Add New Agent',
    preview: 'Preview',
    hidePreview: 'Hide Preview',
    showPreview: 'Show Preview',
    previewResult: 'Placeholder replacement result:',
    copy: 'Copy',
    cancel: 'Cancel',
    save: 'Save',
    optional: '(Optional)',
    namePlaceholder: 'e.g., Programming Mentor',
    descriptionPlaceholder: 'e.g., AI mentor teaching programming from basics to advanced',
    noProjectPath: '(Project path is not set)',
    customAgents: 'Custom Agents',
    editAgent: 'Edit Agent',
    deleteAgent: 'Delete Agent',
    systemPromptInfo: `Enter the system prompt that defines the agent's behavior.Describe in detail what role it should play and how it should respond.`,
    'softwareAgent.description':
      'This AI assistant understands software project structures and creates files and folders.',
    'codeBuddy.description':
      'This AI mentor helps you with programming tasks and provides learning guidance.',
    'productDesigner.description':
      'This AI designer helps you with product design and UX/UI tasks.',
    pleaseEnterNameAndDescription: 'Please enter the agent name and description',
    generating: 'Generating...',
    autoGenerate: 'Auto-generate System Prompt',
    datePlaceholder: 'Today e.g., 2022-01-01'
  },
  ja: {
    'What is Amazon Bedrock': 'Amazon Bedrock とは',
    'What is Amazon Bedrock description':
      'Amazon Bedrock に関する最新情報を検索して、何ができるか簡潔にまとめてください。',
    nameDescription:
      'エージェントの表示名を入力してください（例：プログラミング講師、技術ドキュメント作成者）',
    descriptionDescription: 'このエージェントの役割や特徴を簡潔に説明してください。',
    systemPrompt: 'システムプロンプト',
    systemPromptPlaceholder: `例: このプロジェクト（{{projectPath}}）について分析を行い、以下の方針でサポートを行います：
- プロジェクトの構造を理解し、適切なアドバイスを提供
- コードの品質向上のための提案
- ベストプラクティスに基づいたガイダンス`,
    systemPromptDescription:
      'エージェントの振る舞いを定義するシステムプロンプトを入力してください。どのような役割を果たし、どのように応答するべきかを詳細に記述します。',
    placeholders: '利用可能なプレースホルダー:',
    projectPathPlaceholder: '現在のプロジェクトディレクトリのパス',
    allowedCommandsPlaceholder: '許可されたコマンド',
    scenariosDescription:
      'よく使用するやり取りのパターンをシナリオとして登録できます。シナリオのタイトルと具体的な内容を入力してください。',
    scenarioTitle: 'シナリオのタイトル',
    scenarioTitlePlaceholder: '例: Python基礎レッスン',
    scenarioContent: 'シナリオの内容',
    scenarioContentPlaceholder: '例: Pythonの基本文法について説明してください',
    addNewAgent: '新規エージェント追加',
    preview: 'プレビュー',
    hidePreview: 'プレビューを隠す',
    showPreview: 'プレビューを表示',
    previewResult: 'プレースホルダーを置換した結果:',
    copy: 'コピー',
    cancel: 'キャンセル',
    save: '保存',
    optional: '（オプション）',
    namePlaceholder: '例: プログラミングメンター',
    descriptionPlaceholder: '例: プログラミングの基礎から応用までを教えるAIメンター',
    noProjectPath: '（プロジェクトパスが設定されていません）',
    customAgents: 'カスタムエージェント',
    editAgent: 'エージェントを編集',
    deleteAgent: 'エージェントを削除',
    systemPromptInfo: `エージェントの振る舞いを定義するシステムプロンプトを入力してください。どのような役割を果たし、どのように応答するべきかを詳細に記述します。作業するプロジェクトのディレクトリパスを明確に指示することを推奨します。`,
    'softwareAgent.description':
      'ソフトウェアプロジェクトの構造を理解し、ファイルやフォルダを作成します。',
    'codeBuddy.description':
      '初心者に優しいプログラミングメンターとして、プログラミングタスクのサポートと学習ガイダンスを提供します。',
    'productDesigner.description':
      'ユーザーインターフェースとUXの専門家として、魅力的で使いやすいデザインを提案します。',
    pleaseEnterNameAndDescription: 'エージェント名と説明を入力してください',
    generating: '生成中...',
    autoGenerate: 'System Prompt を自動生成する',
    datePlaceholder: '本日日付 （例：2022-01-01）'
  }
}
