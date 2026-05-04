import { requestUrl } from "obsidian";
import type { AIAnalysisResult, OpDocSettings } from "../types";
import type { AIProvider, EmbeddingProvider } from "./provider";
import { classifyError } from "../utils/error";

export class OpenAIProvider implements AIProvider, EmbeddingProvider {
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
				url: `${this.settings.openaiEndpoint}/chat/completions`,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.settings.openaiApiKey}`,
				},
				body: JSON.stringify({
					model: this.settings.aiModel,
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: truncatedContent },
					],
					response_format: { type: "json_object" },
				}),
			});

			const data = resp.json as { choices?: Array<{ message?: { content?: string } }> };
			const raw = data.choices?.[0]?.message?.content ?? "{}";
			const parsed = JSON.parse(raw) as AIAnalysisResult;

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
				url: `${this.settings.openaiEndpoint}/embeddings`,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.settings.openaiApiKey}`,
				},
				body: JSON.stringify({
					model: this.settings.embeddingModel,
					input: text,
				}),
			});

			const data = resp.json as { data?: Array<{ embedding?: number[] }> };
			return data.data?.[0]?.embedding ?? [];
		} catch (error) {
			throw classifyError(error);
		}
	}

	private buildSystemPrompt(folderList: string[], customInstructions: string): string {
		const folders = folderList.join(", ");
		const rules = customInstructions ? `\nUser rules: ${customInstructions}` : "";

		return `You are a document organizer. Analyze this markdown file and determine the best folder and tags.
Available folders: ${folders}${rules}

Rules:
- targetFolder must NOT start with "/"
- Preserve the original language of folder names (Korean, English, Chinese, etc.)
- If no existing folder matches, create a concise new folder name
- Use underscores for multi-word folder names (e.g. "AI_Research")

Respond in JSON: { "targetFolder": "...", "tags": ["..."], "confidence": 0.0-1.0 }`;
	}
}
