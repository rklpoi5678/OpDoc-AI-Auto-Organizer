# OpDoc AI Auto Organizer

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

AIを活用してObsidianの保管庫を自動整理します。OpDocは受信トレイフォルダーを監視し、新しいMarkdownファイルをOllamaまたはOpenAIで分析して、フロントマターにタグを追加したうえで適切なフォルダーへ移動します。

## 動作の仕組み

1. `.md`ファイルを**Inbox**フォルダーに入れます。
2. OpDocが内容を読み取り、設定されたAIプロバイダーへ送信します。
3. AIが最適な移動先フォルダーと関連タグを決定します。
4. OpDocがフロントマターにタグを書き込み、ファイルを移動します。
5. すべての処理は`OpDoc-Log.md`に記録されます。

## 機能

- **2種類のAIバックエンド** — ローカルで無料利用できるOllama、またはAPIキーが必要なクラウドベースのOpenAI
- **埋め込みによるフォルダー照合** — ベクトル類似度を使って新しいファイルと既存フォルダーの内容を照合
- **6ステップのセットアップウィザード** — 初回起動時の設定を案内
- **自動処理と手動処理** — ファイル作成時の自動処理、5分ごとのスキャン、手動コマンドに対応
- **フロントマターへのタグ追加** — 正規表現ではなく`processFrontMatter` APIを使用
- **バックオフ付き再試行** — 失敗時に指数バックオフで最大3回再試行
- **起動時の未処理ファイル確認** — 再起動後に受信トレイへ残っているファイルを自動処理
- **アクティビティログ** — 元のパス、移動先、状態、タグ、処理時間、エラーを`OpDoc-Log.md`に記録
- **エラー分類** — Ollamaへの接続失敗、無効なAPIキー、レート制限、ネットワークエラーなどを韓国語で表示
- **ファイル名の競合回避** — `_1`から`_100`までの接尾辞を追加し、その後はタイムスタンプを使用

## インストールと設定

### 必要条件

- Obsidian v1.5.0以降
- **ローカルAI：** ローカルで実行中の[Ollama](https://ollama.ai)（例：分析用の`llama3.2`、埋め込み用の`nomic-embed-text`）
- **クラウドAI：** OpenAI APIキー

### インストール

1. `main.js`、`styles.css`、`manifest.json`を保管庫の`.obsidian/plugins/opdoc-ai-auto-organizer/`ディレクトリへコピーします。
2. **Obsidian設定 → コミュニティプラグイン**でプラグインを有効にします。
3. 初めて有効にすると、セットアップウィザードが自動的に開きます。

### Ollamaの設定

```bash
# Ollamaをインストール（https://ollama.ai）
ollama pull llama3.2
ollama pull nomic-embed-text
ollama serve
```

セットアップ中に`http://localhost:11434`で動作しているOllamaを自動検出します。

## コマンド

| コマンド | 説明 |
|---------|------|
| `Process inbox now` | 受信トレイを手動でスキャンして処理 |
| `Rebuild embedding cache` | 類似度照合に使うフォルダーの埋め込みを再構築 |

## 設定項目

| 項目 | 初期値 | 説明 |
|------|--------|------|
| Inbox folder | `Inbox` | 未処理ファイルを置くフォルダー |
| Processing delay | Immediate | 新しいファイルを処理するまでの待機時間 |
| AI provider | Ollama | `ollama`または`openai` |
| AI model | `llama3.2` | ファイル分析に使うチャットモデル |
| Embedding provider | Ollama Local | `ollama_local`または`openai_cloud` |
| Embedding model | `nomic-embed-text` | ベクトル埋め込みに使うモデル |
| Similarity threshold | `0.6` | フォルダー候補を決める最小コサイン類似度 |
| Custom instructions | (empty) | AI分析に追加する指示 |
| Activity logging | Enabled | 処理結果を`OpDoc-Log.md`に記録 |

## プライバシー

OpDocにはテレメトリー、利用状況分析、その他の追跡機能はありません。Ollamaを使用する場合、ノートの内容は設定されたOllamaエンドポイントにのみ送信されます。OpenAIを使用する場合、処理のためにノートの内容が設定されたOpenAI互換エンドポイントへ直接送信されます。APIキーはObsidianによってローカルに保存されます。クラウドサービスを利用する前に、AIプロバイダーのプライバシーポリシーを確認してください。

## フィードバックと貢献

IssueとPull Requestはどの言語で書いてもかまいません。貢献する前に[CONTRIBUTING.md](CONTRIBUTING.md)を読み、[バグ報告または機能提案](https://github.com/rklpoi5678/OpDoc-AI-Auto-Organizer/issues/new/choose)を送ってください。Pull Requestでは変更内容を一つに絞り、確認方法を説明してください。

## 開発

```bash
npm install
npm run dev        # 監視モード
npm run build      # 本番ビルド
npm run lint       # ESLintチェック
```

## リリース

- `manifest.json`のバージョン番号と最低Obsidianバージョンを更新します。
- 古いObsidianでも互換性のあるリリースを取得できるよう、`versions.json`に`"new-version": "minimum-obsidian-version"`を追加します。
- バージョン番号をタグとしてGitHub Releaseを作成します。`v`接頭辞は付けません。
- `manifest.json`、`main.js`、`styles.css`をリリースファイルとしてアップロードします。

> `manifest.json`の`minAppVersion`を更新した後、`npm version patch|minor|major`を実行すると、すべてのファイルのバージョンをまとめて更新できます。

## コミュニティプラグイン一覧への登録

- [プラグインガイドライン](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)を確認します。
- リポジトリのルートに`README.md`を含めて最初のリリースを公開します。
- [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)へPull Requestを作成し、`community-plugins.json`にプラグインを追加します。

```json
{
    "id": "opdoc-ai-auto-organizer",
    "name": "OpDoc AI Auto Organizer",
    "author": "hey_yoon",
    "description": "AI分析でMarkdownファイルを自動整理します。タグを追加し、受信トレイのファイルを適切なフォルダーへ移動します。",
    "repo": "rklpoi5678/OpDoc-AI-Auto-Organizer"
}
```

- 承認後、[ObsidianフォーラムのShowcase](https://forum.obsidian.md)と[Discord](https://discord.gg/obsidianmd)の`#updates`チャンネルで告知します。Discordでは開発者ロールが必要です。
