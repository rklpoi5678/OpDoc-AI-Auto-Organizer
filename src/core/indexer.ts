import { type Plugin, TFile, TFolder, type Vault } from "obsidian";
import { isMarkdownFile } from "../utils/helpers";

const INDEX_KEY = "vaultIndex";
const MAX_SAMPLE_FILES = 3;
const MAX_PREVIEW_LINES = 5;
const MAX_SUMMARY_CHARS = 12000;

export interface FolderIndex {
	fileCount: number;
	samples: Array<{ name: string; tags: string[]; preview: string }>;
	lastUpdated: string;
}

export type VaultIndex = Record<string, FolderIndex>;

export class VaultIndexer {
	private plugin: Plugin;
	private vault: Vault;
	private index: VaultIndex = {};
	private inboxPath: string;

	constructor(plugin: Plugin, inboxPath: string) {
		this.plugin = plugin;
		this.vault = plugin.app.vault;
		this.inboxPath = inboxPath;
	}

	async load(): Promise<void> {
		const raw = await this.plugin.loadData() as Record<string, VaultIndex> | null;
		this.index = raw?.[INDEX_KEY] ?? {};
	}

	private async save(): Promise<void> {
		const raw = (await this.plugin.loadData() as Record<string, unknown> | null) ?? {};
		raw[INDEX_KEY] = this.index;
		await this.plugin.saveData(raw);
	}

	async buildFull(): Promise<void> {
		this.index = {};
		const root = this.vault.getRoot();

		await this.indexFolder(root);

		await this.save();
		console.debug(`[OpDoc] vault index built: ${Object.keys(this.index).length} folders`);
	}

	private async indexFolder(folder: TFolder): Promise<void> {
		for (const child of folder.children) {
			if (!(child instanceof TFolder)) continue;

			const path = child.path;
			if (path === this.inboxPath || path.startsWith(".")) continue;

			const mdFiles: TFile[] = child.children.filter(isMarkdownFile);
			if (mdFiles.length === 0) {
				this.index[path] = { fileCount: 0, samples: [], lastUpdated: new Date().toISOString() };
				await this.indexFolder(child);
				continue;
			}

			const samples = await this.collectSamples(mdFiles);
			this.index[path] = {
				fileCount: mdFiles.length,
				samples,
				lastUpdated: new Date().toISOString(),
			};

			await this.indexFolder(child);
		}
	}

	private async collectSamples(files: TFile[]): Promise<FolderIndex["samples"]> {
		const samples: FolderIndex["samples"] = [];
		const candidates = files.slice(0, MAX_SAMPLE_FILES);

		for (const file of candidates) {
			try {
				const content = await this.vault.read(file);
				const tags = this.extractTags(content);
				const lines = content.split("\n").filter((l) => l.trim().length > 0);
				const preview = lines.slice(0, MAX_PREVIEW_LINES).join(" ").substring(0, 200);

				samples.push({ name: file.basename, tags, preview });
			} catch {
				samples.push({ name: file.basename, tags: [], preview: "" });
			}
		}

		return samples;
	}

	private extractTags(content: string): string[] {
		const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
		if (!fmMatch?.[1]) return [];

		const tagsLine = fmMatch[1].match(/tags:\s*\[(.*?)\]/);
		if (tagsLine?.[1]) {
			return tagsLine[1].split(",").map((t) => t.trim()).filter(Boolean);
		}

		const yamlTags = fmMatch[1].match(/tags:\s*\n((?:\s*-\s+.+\n?)+)/);
		if (yamlTags?.[1]) {
			return yamlTags[1].match(/-\s+(.+)/g)?.map((t) => t.replace(/-\s+/, "").trim()) ?? [];
		}

		return [];
	}

	async updateFolder(folderPath: string): Promise<void> {
		const folder = this.vault.getAbstractFileByPath(folderPath);
		if (!(folder instanceof TFolder)) return;

		const mdFiles: TFile[] = folder.children.filter(isMarkdownFile);
		const samples = await this.collectSamples(mdFiles);

		this.index[folderPath] = {
			fileCount: mdFiles.length,
			samples,
			lastUpdated: new Date().toISOString(),
		};

		await this.save();
	}

	buildContextText(): string {
		const lines: string[] = ["## Current Vault Structure"];

		const sortedPaths = Object.keys(this.index).sort();
		for (const path of sortedPaths) {
			const entry = this.index[path];
			if (!entry || entry.fileCount === 0) continue;

			lines.push(`- ${path}/ (${entry.fileCount} files)`);
			for (const sample of entry.samples) {
				const tagStr = sample.tags.length > 0 ? ` [${sample.tags.join(", ")}]` : "";
				const preview = sample.preview ? ` — "${sample.preview}"` : "";
				lines.push(`    - ${sample.name}${tagStr}${preview}`);
			}
		}

		const result = lines.join("\n");

		if (result.length > MAX_SUMMARY_CHARS) {
			return result.substring(0, MAX_SUMMARY_CHARS) + "\n... (truncated)";
		}
		return result;
	}

	getKnownFolders(): string[] {
		return Object.keys(this.index).filter((p) => (this.index[p]?.fileCount ?? 0) > 0);
	}
}
