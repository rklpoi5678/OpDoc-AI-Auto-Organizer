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
		vaultContext: string,
	): Promise<AIAnalysisResult> {
		const systemPrompt = this.buildSystemPrompt(vaultContext, customInstructions);
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

	private buildSystemPrompt(vaultContext: string, customInstructions: string): string {
		const rules = customInstructions ? `\nUser rules: ${customInstructions}` : "";

		return `You are a document organizer for an Obsidian vault. Analyze the given markdown file and decide the best folder and tags.

${vaultContext}${rules}

Decision rules:
- ALWAYS prefer an existing folder from the vault structure above. Match by topic similarity.
- Only create a new folder when NO existing folder is a reasonable match.
- targetFolder must NOT start with "/". Use a simple relative path like "Tech/React".
- Preserve the original language of folder names (Korean, English, Chinese, etc.).
- Use underscores for multi-word folder names (e.g. "AI_Research").
- tags should be concise, lowercase, underscore-separated (e.g. "react", "job_search").
- confidence: 0.0-1.0 — how certain you are about the folder choice.

Respond in JSON only:
{ "targetFolder": "...", "tags": ["..."], "confidence": 0.0-1.0 }`;
	}
}
