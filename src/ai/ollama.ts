import { requestUrl } from "obsidian";
import type { AIAnalysisResult, OpDocSettings } from "../types";
import type { AIProvider, EmbeddingProvider } from "./provider";
import { classifyError } from "../utils/error";

export class OllamaProvider implements AIProvider, EmbeddingProvider {
	private settings: OpDocSettings;

	constructor(settings: OpDocSettings) {
		this.settings = settings;
	}

	async analyzeFile(
		content: string,
		customInstructions: string,
		folderList: string[],
	): Promise<AIAnalysisResult> {
		const systemPrompt = this.buildSystemPrompt(folderList, customInstructions);
		const truncatedContent = content.substring(0, 4000);

		try {
			const resp = await requestUrl({
				url: `${this.settings.ollamaEndpoint}/api/chat`,
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: this.settings.aiModel,
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: truncatedContent },
					],
					stream: false,
					format: "json",
				}),
			});

			const data = resp.json as { message?: { content?: string } };
			const parsed = JSON.parse(data.message?.content ?? "{}") as AIAnalysisResult;

			return {
				targetFolder: parsed.targetFolder ?? "Uncategorized",
				tags: parsed.tags ?? [],
				confidence: parsed.confidence ?? 0.5,
			};
		} catch (error) {
			throw classifyError(error);
		}
	}

	async getEmbedding(text: string): Promise<number[]> {
		try {
			const resp = await requestUrl({
				url: `${this.settings.ollamaEndpoint}/api/embed`,
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					model: this.settings.embeddingModel,
					input: text,
				}),
			});

			const data = resp.json as { embeddings?: number[][] };
			return data.embeddings?.[0] ?? [];
		} catch (error) {
			throw classifyError(error);
		}
	}

	private buildSystemPrompt(folderList: string[], customInstructions: string): string {
		const folders = folderList.join(", ");
		const rules = customInstructions ? `\nUser rules: ${customInstructions}` : "";

		return `You are a document organizer. Analyze this markdown file and determine the best folder and tags.
Available folders: ${folders}${rules}

Respond in JSON: { "targetFolder": "...", "tags": ["..."], "confidence": 0.0-1.0 }`;
	}
}
