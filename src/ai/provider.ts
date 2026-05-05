import { type AIAnalysisResult, AIProviderType, type OpDocSettings, EmbeddingProviderType } from "../types";
import { OllamaProvider } from "./ollama";
import { OpenAIProvider } from "./openai";

export interface AIProvider {
	analyzeFile(
		content: string,
		customInstructions: string,
		vaultContext: string,
	): Promise<AIAnalysisResult>;
}

export interface EmbeddingProvider {
	getEmbedding(text: string): Promise<number[]>;
}

export function createAIProvider(settings: OpDocSettings): AIProvider {
	if (settings.aiProvider === AIProviderType.OLLAMA) {
		return new OllamaProvider(settings);
	}
	return new OpenAIProvider(settings);
}

export function createEmbeddingProvider(settings: OpDocSettings): EmbeddingProvider {
	if (settings.embeddingProvider === EmbeddingProviderType.OLLAMA_LOCAL) {
		return new OllamaProvider(settings);
	}
	return new OpenAIProvider(settings);
}
