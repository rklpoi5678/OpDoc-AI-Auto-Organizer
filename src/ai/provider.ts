import { type AIAnalysisResult, AIProviderType, type OpDocSettings, EmbeddingProviderType, OrganizingMethodology } from "../types";
import { OllamaProvider } from "./ollama";
import { OpenAIProvider } from "./openai";

export interface AIProvider {
	analyzeFile(
		content: string,
		customInstructions: string,
		vaultContext: string,
		candidates?: string[],
	): Promise<AIAnalysisResult>;
}

export function getMethodologyRules(methodology: OrganizingMethodology): string {
	if (methodology === OrganizingMethodology.PARA) {
		return `Organization method: PARA System
- Projects: Active tasks with deadlines or specific goals (e.g. "Launch SaaS MVP", "Job search 2026").
- Areas: Ongoing responsibilities with no end date (e.g. "Health", "Finance", "Career").
- Resources: Reference material, learning notes, research (e.g. "React patterns", "Korean tax law").
- Archives: Inactive items from any category above.
- Rule: If a file relates to an active goal with a deadline → Projects. If ongoing responsibility → Areas. If reference → Resources. If outdated → Archives.
- Folder naming: Use "Projects/X", "Areas/X", "Resources/X", "Archives/X" structure.`;
	}

	if (methodology === OrganizingMethodology.MECE) {
		return `Organization method: MECE (Mutually Exclusive, Collectively Exhaustive)
- Classify files into non-overlapping categories that fully cover the topic space.
- First determine the top-level domain (e.g. Work, Personal, Learning, Resources).
- Then subdivide within that domain (e.g. Work/Clients, Work/Internal, Learning/Frontend, Learning/DevOps).
- Rule: Each file must belong to exactly ONE category. No file should fit into two folders equally.
- Rule: Prefer depth over breadth — subdivide rather than create broad catch-all folders.
- Folder naming: Use hierarchical paths with clear boundaries (e.g. "Work/ClientProjects", "Learning/AI_ML").`;
	}

	if (methodology === OrganizingMethodology.JOHNNY_DECIMAL) {
		return `Organization method: Johnny.Decimal
- Organize files using a numbered category system (10-19, 20-29, 30-39, ...).
- Each "ten" represents a broad area. Each unit within is a specific topic.
- Example: 10-19 Personal (11 Health, 12 Finance), 20-29 Work (21 Projects, 22 Clients), 30-39 Learning (31 Frontend, 32 DevOps).
- Rule: Assign files to the most specific numbered category available.
- Rule: If no existing category fits, suggest a new number in the appropriate ten-range.
- Folder naming: Use numeric prefixes (e.g. "11_Health", "21_Projects", "31_Frontend").`;
	}

	return "";
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
