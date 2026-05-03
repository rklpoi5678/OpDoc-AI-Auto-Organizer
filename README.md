# OpDoc AI Auto Organizer

Automatically organize your Obsidian vault with AI. OpDoc watches your inbox folder, analyzes new markdown files using AI (Ollama or OpenAI), assigns tags via frontmatter, and moves them to the right folder.

## How It Works

1. Drop a `.md` file into your **Inbox** folder
2. OpDoc reads the content and sends it to your configured AI provider
3. AI determines the best target folder and relevant tags
4. OpDoc writes tags into frontmatter and moves the file
5. Every action is logged to `OpDoc-Log.md`

## Features

- **Dual AI backend** — Ollama (local, free) or OpenAI (cloud, API key required)
- **Embedding-based folder matching** — uses vector similarity to match new files against existing folder content
- **6-step onboarding wizard** — guided setup on first launch
- **Automatic + manual processing** — processes on file creation, periodic scan every 5 minutes, and a manual command
- **Tag injection via frontmatter** — uses `processFrontMatter` API, no regex hacks
- **Retry with backoff** — up to 3 retries with exponential backoff on failure
- **Catch-up on startup** — processes any files left in inbox after restart
- **Activity log** — `OpDoc-Log.md` table with original path, target path, status, tags, processing time, errors
- **Error classification** — Korean user-facing error messages for common failures (Ollama down, invalid API key, rate limit, network errors)
- **File collision resolution** — appends `_1` through `_100`, then timestamp fallback

## Setup

### Requirements

- Obsidian v1.5.0+
- **For local AI:** [Ollama](https://ollama.ai) running locally (e.g., `llama3.2` for analysis, `nomic-embed-text` for embeddings)
- **For cloud AI:** OpenAI API key

### Install

1. Copy `main.js`, `styles.css`, `manifest.json` into your vault's `.obsidian/plugins/opdoc-ai-auto-organizer/` directory
2. Enable the plugin in Obsidian Settings → Community Plugins
3. The onboarding wizard will launch automatically on first activation

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

OpDoc never sends data to any third-party server. All processing goes directly from your Obsidian client to your configured AI provider (local Ollama or your own OpenAI API key). No telemetry, no analytics, no phone-home.

## Development

```bash
npm install
npm run dev        # watch mode
npm run build      # production build
npm run lint       # ESLint check
```

## Releasing

- Update `manifest.json` with the new version number and minimum Obsidian version
- Update `versions.json` with `"new-version": "minimum-obsidian-version"` so older Obsidian builds can download a compatible version
- Create a GitHub release using the version number as the tag (no `v` prefix)
- Upload `manifest.json`, `main.js`, `styles.css` as release assets

> Run `npm version patch|minor|major` after updating `minAppVersion` in `manifest.json` to bump version across all files.

## Submitting to the Community Plugin List

- Review the [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- Publish an initial release with `README.md` in the repo root
- Open a pull request at [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases) adding your plugin to `community-plugins.json`:

```json
{
    "id": "opdoc-ai-auto-organizer",
    "name": "OpDoc AI Auto Organizer",
    "author": "hey_yoon",
    "description": "Auto-organize markdown files using AI analysis. Tags and moves files from inbox to appropriate folders.",
    "repo": "<your-github-username>/OpDoc-AI-Auto-Organizer"
}
```

- Once admitted, announce in the [Obsidian forum showcase](https://forum.obsidian.md) and the `#updates` channel on [Discord](https://discord.gg/obsidianmd) (requires developer role)
