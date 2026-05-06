import type { TFile } from "obsidian";

// ── Enums ──

export enum ProcessingDelay {
	IMMEDIATE = "immediate",
	ONE_HOUR = "1h",
	ONE_DAY = "1d",
}

export enum AIProviderType {
	OLLAMA = "ollama",
	OPENAI = "openai",
}

export enum EmbeddingProviderType {
	OLLAMA_LOCAL = "ollama_local",
	OPENAI_CLOUD = "openai_cloud",
}

export enum FileProcessingState {
	PENDING = "pending",
	PROCESSING = "processing",
	COMPLETED = "completed",
	FAILED = "failed",
}

export enum OrganizingMethodology {
	NONE = "none",
	PARA = "para",
	MECE = "mece",
	JOHNNY_DECIMAL = "johnny_decimal",
}

// ── Settings ──

export interface OpDocSettings {
	inboxFolder: string;
	processingDelay: ProcessingDelay;
	aiProvider: AIProviderType;
	ollamaEndpoint: string;
	openaiApiKey: string;
	openaiEndpoint: string;
	aiModel: string;
	embeddingProvider: EmbeddingProviderType;
	embeddingModel: string;
	customInstructions: string;
	activityLogging: boolean;
	onboardingComplete: boolean;
	similarityThreshold: number;
	methodology: OrganizingMethodology;
	maxLogEntries: number;
	language: string;
}

export const DEFAULT_SETTINGS: OpDocSettings = {
	inboxFolder: "Inbox",
	processingDelay: ProcessingDelay.IMMEDIATE,
	aiProvider: AIProviderType.OLLAMA,
	ollamaEndpoint: "http://localhost:11434",
	openaiApiKey: "",
	openaiEndpoint: "https://api.openai.com/v1",
	aiModel: "llama3.2",
	embeddingProvider: EmbeddingProviderType.OLLAMA_LOCAL,
	embeddingModel: "nomic-embed-text",
	customInstructions: "",
	activityLogging: true,
	onboardingComplete: false,
	similarityThreshold: 0.6,
	methodology: OrganizingMethodology.NONE,
	maxLogEntries: 200,
	language: "ko",
};

// ── Processing Queue ──

export interface QueueItem {
	file: TFile;
	state: FileProcessingState;
	retryCount: number;
	addedAt: number;
	lastAttemptAt: number | null;
	error: string | null;
}

// ── Embedding Cache ──

export interface FolderEmbedding {
	vector: number[];
	fileCount: number;
	lastUpdated: string;
}

export type FolderEmbeddings = Record<string, FolderEmbedding>;

// ── AI Results ──

export interface AIAnalysisResult {
	targetFolder: string;
	tags: string[];
	confidence: number;
}

export interface ProcessingResult {
	originalPath: string;
	targetPath: string | null;
	status: "done" | "fail";
	tags: string[];
	processingTime: number;
	error: string | null;
	timestamp: string;
}

// ── Error ──

export type OpDocErrorType =
	| "ollama_down"
	| "invalid_api_key"
	| "rate_limit"
	| "network_error"
	| "parse_failure"
	| "unknown";

export interface OpDocError {
	type: OpDocErrorType;
	message: string;
	userMessage: string;
	originalError: unknown;
}
