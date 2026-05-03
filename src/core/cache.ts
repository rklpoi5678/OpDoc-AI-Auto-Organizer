import { type Plugin, TFolder, type Vault } from "obsidian";
import type { FolderEmbeddings } from "../types";
import { EmbeddingService } from "../ai/embedding";
import { createEmbeddingProvider } from "../ai/provider";
import { cosineSimilarity } from "../utils/similarity";
import type { OpDocSettings } from "../types";

const CACHE_KEY = "folderEmbeddings";

export class FolderEmbeddingCache {
	private plugin: Plugin;
	private vault: Vault;
	private settings: OpDocSettings;
	private cache: FolderEmbeddings = {};

	constructor(plugin: Plugin, settings: OpDocSettings) {
		this.plugin = plugin;
		this.vault = plugin.app.vault;
		this.settings = settings;
	}

	getAll(): FolderEmbeddings {
		return this.cache;
	}

	async load(): Promise<void> {
		const raw = await this.plugin.loadData() as Record<string, FolderEmbeddings> | null;
		const cached = raw?.[CACHE_KEY];
		this.cache = cached ?? {};
	}

	private async save(): Promise<void> {
		const raw = (await this.plugin.loadData() as Record<string, unknown> | null) ?? {};
		raw[CACHE_KEY] = this.cache;
		await this.plugin.saveData(raw);
	}

	async rebuildAll(): Promise<void> {
		const folders = this.vault.getAllLoadedFiles().filter((f): f is TFolder => {
			const path = f.path;
			return f instanceof TFolder && path !== this.settings.inboxFolder && !path.startsWith(".");
		});

		const embeddingProvider = createEmbeddingProvider(this.settings);
		const service = new EmbeddingService(embeddingProvider, this.vault);

		this.cache = {};
		for (const folder of folders) {
			try {
				const vector = await service.embedFolder(folder.path);
				this.cache[folder.path] = {
					vector,
					fileCount: folder.children.length,
					lastUpdated: new Date().toISOString(),
				};
			} catch {
				console.debug(`[OpDoc] skip folder embedding: ${folder.path}`);
			}
		}

		await this.save();
		console.debug(`[OpDoc] embedding cache rebuilt: ${Object.keys(this.cache).length} folders`);
	}

	async updateFolderEmbedding(folderPath: string): Promise<void> {
		const embeddingProvider = createEmbeddingProvider(this.settings);
		const service = new EmbeddingService(embeddingProvider, this.vault);

		try {
			const vector = await service.embedFolder(folderPath);
			const folder = this.vault.getAbstractFileByPath(folderPath);
			const fileCount = folder instanceof TFolder ? folder.children.length : 0;

			this.cache[folderPath] = {
				vector,
				fileCount,
				lastUpdated: new Date().toISOString(),
			};
			await this.save();
		} catch (error) {
			console.debug(`[OpDoc] failed to update embedding for ${folderPath}`, error);
		}
	}

	findBestMatch(queryVector: number[]): { folder: string; similarity: number } | null {
		let bestFolder: string | null = null;
		let bestSim = -1;

		for (const [folder, embedding] of Object.entries(this.cache)) {
			const sim = cosineSimilarity(queryVector, embedding.vector);
			if (sim > bestSim) {
				bestSim = sim;
				bestFolder = folder;
			}
		}

		if (!bestFolder) return null;
		return { folder: bestFolder, similarity: bestSim };
	}

	suggestFolder(queryVector: number[]): { folder: string; similarity: number } | null {
		const match = this.findBestMatch(queryVector);
		if (!match) return null;

		if (match.similarity >= this.settings.similarityThreshold) {
			return match;
		}
		return null;
	}

	getKnownFolders(): string[] {
		return Object.keys(this.cache);
	}
}
