const HomePage = {
  'set your aws credential':
    'Bedrock に接続する設定をします。設定画面から AWS Credentials（リージョン、アクセスキー、シークレットアクセスキー）を入力してください。',
  'Welcome to Bedrock Engineer': 'Bedrock Engineer にようこそ',
  'This is AI assistant of software development tasks':
    '私は、ソフトウェア開発タスクに特化したAIアシスタントです',
  'Start by the menu on the left or': '左のメニューから開始するか、次のショートカットが利用できます'
}

const SettingPage = {
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
  'Advanced Setting': '詳細設定',
  'When writing a message, press': 'メッセージを書いているとき、',
  to: 'を押すと',
  'Send the message': 'メッセージを送信',
  'Start a new line (use': '改行（',
  'to send)': 'で送信）',
  'Invalid model': '無効なモデル'
}

const StepFunctionsGeneratorPage = {
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
次に、入力内容に問題がなければ、情報を DynamoDB に保存します。
最後に、メールを送信します。メールの送信は Amazon SNS を使用します。
Lambda の入力内容が失敗した場合、DynamoDB は情報を保存せず、ユーザーにメールで通知します。
DynamoDB または SNS を使用する場合は、Lambda を使用せず、AWS ネイティブ統合を検討してください。
`,
  'Use the distributed map to repeat the row of the CSV file generated in S3': `S3で生成されたCSVファイルの行を繰り返すために分散マップを使用する
各行には注文と配送情報があります。
分散マッププロセッサはこれらの行のバッチを繰り返し、Lambda 関数を使用して注文を検出します。
その後、注文ごとに SQS キューにメッセージを送信します。`
}

const ChatPage = {
  'request error':
    'Bedrock との通信でエラーが発生しました。しばらく待ってからもう一度お試しください。',
  'This AI agent understands software project structures and creates files and folders.':
    'ソフトウェアプロジェクトの構造を理解し、ファイルとフォルダーを作成します',
  'Latest News in this week': '今週のニュース',
  'What news happened in the world this week ({{date}})':
    '今週 {{date}}〜 の日本のニュースは何がありましたか？',
  'Simple website': 'シンプルなウェブサイト',
  'Create a cool website for an IT company using HTML, CSS, and JavaScript.':
    'HTML、CSS、JavaScriptを使用してIT企業向けのクールなウェブサイトを作成してください。',
  'Organizing folders': 'フォルダの整理',
  'Extract only the png files contained in the {{projectPath}} folder and copy them to the {{imagePath}} folder.':
    '{{projectPath}}フォルダに含まれるpngファイルのみを抽出し、{{imagePath}}フォルダにコピーしてください。',
  'Simple Web API': 'シンプルなAPI',
  simpleWebAPIContent:
    'Node.jsとExpressを使用して、ユーザーが"users"リソースに対してCRUD操作を実行できるシンプルなRESTful APIを作成してください。\nこのAPIはデータをメモリに保存します（このサンプルではデータベースは不要です）。',
  'CDK Project': 'CDKプロジェクト',
  cdkProjectContent:
    'Lambda関数とAPI Gatewayをデプロイする新しい AWS CDK のプロジェクトを作成してください。Lambda関数は、API Gatewayを通じて呼び出されたときに単純な"Hello, World!"メッセージを返すようにしてください。',
  'Understanding the source code': 'ソースコードの説明',
  'Understanding the source code content':
    '{{projectPath}} に含まれているアプリケーションのソースコードを理解して、図解しながら説明してください。',
  Refactoring: 'リファクタリング',
  RefactoringContent: `{{projectPath}} に含まれているアプリケーションのソースコードを理解して、リファクタリングの案を提示してください。
  ソースコードの量が多い場合、どのソースコードや機能に対してリファクタリングするべきか、ユーザーに質問しながらステップを進めます。
  リファクタリングの案を提示した後、ユーザーからのフィードバックを受け付け、リファクタリングを実行することを推奨します。
  `,
  Testcode: 'テストコード',
  TestcodeContent: `{{projectPath}} に含まれているアプリケーションのソースコードを理解して、テストコードの案を提示してください。
ソースコードの量が多い場合、どのソースコードや機能に対してテストコードを作成するべきか、ユーザーに質問しながらステップを進めます。
テストコードの案を提示した後、ユーザーからのフィードバックを受け付け、作成することを推奨します。
`
}

const WebsiteGeneratorPage = {
  addRecommend: 'おすすめの追加機能を考え中',
  ecSiteTitle: '観葉植物のECサイト',
  ecSiteValue: `次の条件で、鉢植えの植物に特化した EC ウェブサイトの基本構造とレイアウトを作成してください。
<Conditions>
- レイアウトは Amazon.com のようなものにする。
- EC ウェブサイトの名前は "Green Village" とする。
- グリーンの配色テーマを使用する。
- 植物をカード形式で表示するセクションを追加する。
- ショッピングカートに追加する機能を作成する。
- 現在のショッピングカートの中身を確認し、合計金額を計算する機能を作成する。
</Conditions>
`,
  ecSiteAdminTitle: 'ECサイトの管理画面',
  ecSiteAdminValue: `以下の条件で、観葉植物を専門に取り扱うECサイトの管理画面を作ってください。
<条件>
- EC サイトの名前は「Green Village」です。
- グリーン系のカラーテーマにしてください。
- 直近の注文を表示するテーブルがあり、発注などのステータスを管理できます
- ダミーデータを表示してください
</条件>
前の出力に続けて、サイドバーナビゲーションを追加してください`,
  healthFitnessSiteTitle: 'フィットネスサイト',
  healthFitnessSiteValue: `次の条件で、健康とフィットネスのウェブサイトの基本構造とレイアウトを作成してください。
<Conditions>
- レイアウトは Amazon.com のようなものにする。
- ウェブサイトの名前は "FitLife" とする。
- 赤い配色テーマを使用する。
- 健康とフィットネスのブログを表示するセクションを追加する。
- キーワードで健康とフィットネスのコンテンツを検索する機能を作成する。
- ブログにコメントを追加する機能を作成する。
- 記事にはサムネイル画像をつける
</Conditions>
`,
  drawingGraphTitle: 'グラフの描画',
  drawingGraphValue: `ウェブサイト上で、次のデータをグラフで可視化してください。

購入データ CSV ファイル
customer_id,product_id,purchase_date,purchase_amount
C001,P001,2023-04-01,50.00
C002,P002,2023-04-02,75.00
C003,P003,2023-04-03,100.00
C001,P002,2023-04-04,60.00
C002,P001,2023-04-05,40.00
C003,P003,2023-04-06,90.00
C001,P001,2023-04-07,30.00
C002,P002,2023-04-08,80.00
C003,P001,2023-04-09,45.00
C001,P003,2023-04-10,120.00

このCSVファイルには以下の情報が含まれています。
- 'customer_id': 顧客 ID
- 'product_id': 製品 ID
- 'purchase_date': 購入日
- 'purchase_amount': 購入金額`,
  todoAppTitle: 'Todoアプリ',
  todoAppValue: 'シンプルな Todo アプリのウェブサイトを作成してください。',
  codeTransformTitle: 'コード変換',
  codeTransformValue: `以下のコードを変換してください。

using Android.App;
using Android.OS;
using Android.Support.V7.App;
using Android.Runtime;
using Android.Widget;
using System.Data.SQLite;
using System;
using Xamarin.Essentials;
using System.Linq;
namespace App2
{
[Activity(Label = "@string/app_name", Theme = "@style/AppTheme", MainLauncher = true)]
public class MainActivity : AppCompatActivity
{
protected override void OnCreate(Bundle savedInstanceState)
{
base.OnCreate(savedInstanceState);
Xamarin.Essentials.Platform.Init(this, savedInstanceState);
SetContentView(Resource.Layout.activity_main);
EditText input1 = FindViewById<EditText>(Resource.Id.Input1);
EditText input2 = FindViewById<EditText>(Resource.Id.Input2);
TextView total = FindViewById<TextView>(Resource.Id.Total);
Button totalButton = FindViewById<Button>(Resource.Id.TotalButton);
totalButton.Click += (sender, e) =>
{
total.Text = (int.Parse(input1.Text) + int.Parse(input2.Text)).ToString("#,0");
}
}
public override void OnRequestPermissionsResult(int requestCode, string[] permissions,
[GeneratedEnum] Android.Content.PM.Permission[] grantResults)
{
Xamarin.Essentials.Platform.OnRequestPermissionsResult(requestCode, permissions, grantResults);
base.OnRequestPermissionsResult(requestCode, permissions, grantResults);
}
}
}`
}

const ja = {
  ...HomePage,
  ...SettingPage,
  ...StepFunctionsGeneratorPage,
  ...ChatPage,
  ...WebsiteGeneratorPage
}

export default ja
