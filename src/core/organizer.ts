import type { App, TFile } from "obsidian";
import type { OpDocSettings, ProcessingResult } from "../types";
import { createAIProvider, createEmbeddingProvider } from "../ai/provider";
import { FolderEmbeddingCache } from "./cache";
import { ensureFolder, resolveNameCollision } from "../utils/helpers";
import { OpDocLogger } from "../utils/logger";
import { classifyError, showErrorNotice } from "../utils/error";

export class FileOrganizer {
	readonly app: App;
	private settings: OpDocSettings;
	private cache: FolderEmbeddingCache;

	constructor(app: App, settings: OpDocSettings, cache: FolderEmbeddingCache) {
		this.app = app;
		this.settings = settings;
		this.cache = cache;
	}

	async processFile(file: TFile): Promise<ProcessingResult> {
		const startTime = Date.now();
		const timestamp = new Date().toISOString();

		try {
			const content = await this.app.vault.read(file);

			const aiProvider = createAIProvider(this.settings);
			const knownFolders = this.cache.getKnownFolders();

			const analysis = await aiProvider.analyzeFile(
				content,
				this.settings.customInstructions,
				knownFolders,
			);

			const embeddingProvider = createEmbeddingProvider(this.settings);
			const queryVector = await embeddingProvider.getEmbedding(content.slice(0, 2000));

			let targetFolder = analysis.targetFolder;

			const suggestion = this.cache.suggestFolder(queryVector);
			if (suggestion && suggestion.similarity > analysis.confidence) {
				targetFolder = suggestion.folder;
			}

			await this.app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
				const rawTags = fm.tags;
					const existing: string[] = Array.isArray(rawTags) ? rawTags as string[] : [];
				const newTags = analysis.tags.filter((t) => !existing.includes(t));
				fm.tags = [...existing, ...newTags];
			});

			await ensureFolder(this.app.vault, targetFolder);
			const targetPath = await resolveNameCollision(
				this.app.vault,
				`${targetFolder}/${file.name}`,
			);

			await this.app.fileManager.renameFile(file, targetPath);

			void this.cache.updateFolderEmbedding(targetFolder);

			const result: ProcessingResult = {
				originalPath: file.path,
				targetPath,
				status: "done",
				tags: analysis.tags,
				processingTime: (Date.now() - startTime) / 1000,
				error: null,
				timestamp,
			};

			if (this.settings.activityLogging) {
				const logger = new OpDocLogger(this.app.vault);
				void logger.logEntry(result);
			}

			return result;
		} catch (error) {
			const classified = classifyError(error);
			showErrorNotice(classified);

			const result: ProcessingResult = {
				originalPath: file.path,
				targetPath: null,
				status: "fail",
				tags: [],
				processingTime: (Date.now() - startTime) / 1000,
				error: classified.opDocError.userMessage,
				timestamp,
			};

			if (this.settings.activityLogging) {
				const logger = new OpDocLogger(this.app.vault);
				void logger.logEntry(result);
			}

			return result;
		}
	}
}
