# リリース手順ガイド

このドキュメントでは、Bedrock Engineerのリリース方法について説明します。リリースプロセスには PR による確認ステップが含まれています。

## リリース手順

1. **バージョンアップ**:
   - `package.json`ファイルのバージョン番号を更新します：
     ```json
     {
       "name": "bedrock-engineer",
       "version": "X.Y.Z", // ここを更新
       ...
     }
     ```

2. **変更をコミット**:
   ```bash
   git add package.json
   git commit -m "chore: bump version to vX.Y.Z"
   ```

3. **タグを作成してプッシュ**:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

4. **リリース準備の監視**:
   - GitHub Actionsの進行状況を[Actionsタブ](https://github.com/daisuke-awaji/bedrock-engineer/actions)で確認します。
   - ワークフローが正常に完了すると、以下の処理が自動的に行われます:
     1. Mac版とWindows版のビルドが実行される
     2. ドラフトリリースが作成される
     3. リリース承認用のPRが作成される

5. **リリース承認**:
   - 作成されたPRを確認します
   - ビルド成果物が期待通りか確認します
   - リリースノートを確認します
   - 問題がなければ PR を承認してマージします

6. **リリース公開**:
   - PRがマージされると、自動的にリリースが公開されます
   - GitHub Releasesページで公開されたリリースを確認できます

## トラブルシューティング

### ビルドに失敗した場合:

1. GitHub Actionsのログを確認して問題を特定します
2. 問題を修正し、必要に応じてタグを削除して再度プッシュします：
   ```bash
   git tag -d vX.Y.Z
   git push --delete origin vX.Y.Z
   # 修正後
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

### リリース承認PRに問題がある場合:

1. PR を閉じます（マージせずに）
2. 問題を修正します
3. 必要に応じて手順3からやり直します

## バージョニング規則

[セマンティックバージョニング](https://semver.org/lang/ja/)に従います：

- **メジャーバージョン (X)**: 互換性のない変更
- **マイナーバージョン (Y)**: 後方互換性のある機能追加
- **パッチバージョン (Z)**: 後方互換性のあるバグ修正