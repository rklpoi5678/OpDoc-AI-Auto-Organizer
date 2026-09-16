# OpDoc AI Auto Organizer

[English](README.md) | [한국어](README.ko.md) | [日本語](README.ja.md)

Automatically organize your Obsidian vault with AI. OpDoc watches your inbox folder, analyzes new Markdown files with Ollama or OpenAI, adds tags to their frontmatter, and moves them to the appropriate folder.

## How It Works

1. Drop a `.md` file into your **Inbox** folder.
2. OpDoc reads the content and sends it to your configured AI provider.
3. The AI determines the best target folder and relevant tags.
4. OpDoc writes the tags to the frontmatter and moves the file.
5. Every action is logged to `OpDoc-Log.md`.

## Features

- **Two AI backends** — Ollama (local and free) or OpenAI (cloud, API key required)
- **Embedding-based folder matching** — uses vector similarity to match new files with existing folder content
- **6-step onboarding wizard** — guides you through the initial setup
- **Automatic and manual processing** — processes files when they are created, scans every 5 minutes, or runs on command
- **Frontmatter tags** — uses the `processFrontMatter` API instead of regular expressions
- **Retry with backoff** — retries failed operations up to 3 times with exponential backoff
- **Startup catch-up** — processes files left in the inbox after a restart
- **Activity log** — records the original path, target path, status, tags, processing time, and errors in `OpDoc-Log.md`
- **Error classification** — provides Korean messages for common failures, including unavailable Ollama, invalid API keys, rate limits, and network errors
- **File collision handling** — appends `_1` through `_100`, then falls back to a timestamp

## Setup

### Requirements

- Obsidian v1.5.0+
- **For local AI:** [Ollama](https://ollama.ai) running locally (for example, `llama3.2` for analysis and `nomic-embed-text` for embeddings)
- **For cloud AI:** OpenAI API key

### Install

1. Copy `main.js`, `styles.css`, and `manifest.json` into your vault's `.obsidian/plugins/opdoc-ai-auto-organizer/` directory.
2. Enable the plugin under **Obsidian Settings → Community plugins**.
3. The onboarding wizard opens automatically when you first enable the plugin.

### Ollama Setup

```bash
# Install Ollama (https://ollama.ai)
ollama pull llama3.2
ollama pull nomic-embed-text
ollama serve
```

OpDoc will auto-detect Ollama at `http://localhost:11434` during onboarding.

## Commands

| Command | Description |
|---------|-------------|
| `Process inbox now` | Manually trigger inbox scan and processing |
| `Rebuild embedding cache` | Rebuild folder embeddings for similarity matching |

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Inbox folder | `Inbox` | Source folder for unprocessed files |
| Processing delay | Immediate | Delay before processing new files |
| AI provider | Ollama | `ollama` or `openai` |
| AI model | `llama3.2` | Chat model for file analysis |
| Embedding provider | Ollama Local | `ollama_local` or `openai_cloud` |
| Embedding model | `nomic-embed-text` | Model for vector embeddings |
| Similarity threshold | `0.6` | Minimum cosine similarity for folder suggestion |
| Custom instructions | (empty) | Additional instructions for AI analysis |
| Activity logging | Enabled | Write processing results to `OpDoc-Log.md` |

## Privacy

OpDoc includes no telemetry, analytics, or other tracking. With Ollama, note content is sent only to your configured Ollama endpoint. With OpenAI, note content is sent directly to your configured OpenAI-compatible endpoint for processing. Your API key is stored locally by Obsidian. Review your AI provider's privacy policy before using a cloud service.

## Feedback and contributions

Issues and pull requests are welcome in any language. Read [CONTRIBUTING.md](CONTRIBUTING.md) before contributing, then [report a bug or request a feature](https://github.com/rklpoi5678/OpDoc-AI-Auto-Organizer/issues/new/choose). Pull requests should be focused and explain how the change was verified.

## Development

```bash
npm install
npm run dev        # watch mode
npm run build      # production build
npm run lint       # ESLint check
```

## Releasing

- Update `manifest.json` with the new version number and minimum Obsidian version.
- Update `versions.json` with `"new-version": "minimum-obsidian-version"` so older Obsidian versions can download a compatible release.
- Create a GitHub release using the version number as the tag, without a `v` prefix.
- Upload `manifest.json`, `main.js`, and `styles.css` as release assets.

> Run `npm version patch|minor|major` after updating `minAppVersion` in `manifest.json` to bump version across all files.

## Submitting to the Community Plugin List

- Review the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines).
- Publish an initial release with `README.md` in the repository root.
- Open a pull request at [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases) adding your plugin to `community-plugins.json`:

```json
{
    "id": "opdoc-ai-auto-organizer",
    "name": "OpDoc AI Auto Organizer",
    "author": "hey_yoon",
    "description": "Auto-organize markdown files using AI analysis. Tags and moves files from inbox to appropriate folders.",
    "repo": "rklpoi5678/OpDoc-AI-Auto-Organizer"
}
```

- Once admitted, announce it in the [Obsidian forum showcase](https://forum.obsidian.md) and the `#updates` channel on [Discord](https://discord.gg/obsidianmd) (developer role required).
