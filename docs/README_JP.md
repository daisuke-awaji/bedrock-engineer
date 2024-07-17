# 🧙 Bedrock エンジニア

Bedrock エンジニアは、ソフトウェア開発タスクを支援するためのインタラクティブなコマンドラインインターフェース（CLI）です。このツールは、大規模言語モデルの機能と実用的なファイルシステム操作、Web検索機能、AWSクラウドリソースのビルド/デプロイ機能を組み合わせています。

このアプリケーションは、超クールな[Claude-Enginner](https://github.com/Doriandarko/claude-engineer)のソースコードをベースにnode.jsで実装されており、様々な[Amazon Bedrock](https://aws.amazon.com/jp/bedrock/)モデルをサポートしています。Bedrockの[Converse API](https://docs.aws.amazon.com/bedrock/latest/APIReference/API_runtime_Converse.html)を使用しています。

## 💻 デモ

https://github.com/daisuke-awaji/bedrock-engineer/assets/20736455/b206ba1c-8f73-4021-90d3-f2ab6c5e1363

## ✨ 機能

- 💬 Anthropic Claude 3モデルとのインタラクティブなチャットインターフェース
- 📁 ファイルシステム操作（フォルダ作成、ファイル作成、読み書き）
- 🔍 Tavily APIを使用したWeb検索機能
- 🏗️ プロジェクト構造の作成と管理
- 🧐 コード分析と改善提案
- 🚀 自律的なタスク完了のための自動モード
- 🔄 自動モードでの反復追跡
- ☁️ アプリケーションとインフラストラクチャのAWSクラウドへのビルドとデプロイ
- 💻 CLIコマンドの実行（毎回ユーザー確認が必要）
- 🖼️ [pexels](https://www.pexels.com/)からの画像取得

今後の実装予定

- 🌈 コードスニペットのシンタックスハイライト
- 🖼️ ターミナルでの画像のドラッグアンドドロップによるビジョン機能サポート
- 🤖 サポートモデル：Mistral AIとCohere Command R/R+

## 🛠️ インストール

1. このリポジトリをクローンします：

   ```bash
   git clone https://github.com/daisuke-awaji/bedrock-engineer
   cd bedrock-engineer
   ```

2. 必要な依存関係をインストールします：

   ```bash
   npm install
   ```

3. （オプション）APIキーを設定します：

   .envファイルの先頭にTavily APIキーを追加します：

   ```.env
   TAVILY_API_KEY=tvly-xxxxxxxxxxxxx
   ```

## 🐳 Dockerセットアップ

Dockerを使用してBedrock Engineerを実行することもできます。このセットアップにより、異なるマシン間で一貫した環境を確保できます。

1. システムにDockerとDocker Composeがインストールされていることを確認します。

2. Dockerコンテナをビルドして起動します：

   ```bash
   docker-compose up --build
   ```

   このコマンドは、`docker-compose.yml`ファイルの仕様に基づいてDockerイメージをビルドし、コンテナを起動します。

3. コンテナが実行されたら、その中でコマンドを実行できます。Bedrock Engineerインターフェースを起動するには：

   ```bash
   docker-compose exec bedrock-engineer /bin/bash
   npm run start
   ```

   これにより、実行中のコンテナ内でbashシェルが開き、Bedrock Engineerアプリケーションが起動します。

### Docker Compose設定

`docker-compose.yml`ファイルはサービス設定を定義しています：

```yaml
version: '3.8'

services:
  bedrock-engineer:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    tty: true
    env_file:
      - .env
```

この設定は：
- カレントディレクトリのDockerfileを使用してDockerイメージをビルドします。
- カレントディレクトリをコンテナ内の`/app`にマウントします。
- インストールされた依存関係を保持するために`node_modules`の名前付きボリュームを作成します。
- コンテナのポート3000をホストにマッピングします。
- Node環境を本番環境に設定します。
- `.env`ファイルから環境変数を読み込みます。

このDockerセットアップを使用することで、異なるシステム間でBedrock Engineerを実行するための一貫した環境を確保できます。

## 🚀 使用方法

メインスクリプトを実行してBedrock Engineerインターフェースを起動します：

```bash
npm run start
```

## 🤖 自動モード

自動モードでは、Bedrockが複雑なタスクを自律的に処理できます。自動モードでは：

1. Bedrockはあなたのリクエストに基づいて、明確で達成可能な目標を設定します。
2. 必要に応じて利用可能なツールを使用しながら、これらの目標を一つずつ処理します。
3. Bedrockは進捗状況を定期的に更新します。
4. 目標が完了するまで自動モードが続きます。

自動モードを使用するには：

1. 入力を求められたら「automode」と入力します。
2. プロンプトが表示されたらリクエストを入力します。
3. Bedrockは自律的に作業を行い、各反復後に更新を提供します。

## スター履歴

[![Star History Chart](https://api.star-history.com/svg?repos=daisuke-awaji/bedrock-engineer&type=Date)](https://star-history.com/#daisuke-awaji/bedrock-engineer&Date)
