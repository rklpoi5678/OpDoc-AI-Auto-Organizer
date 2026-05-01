import { Notice } from "obsidian";
import type { OpDocError } from "../types";

export class OpDocErrorException extends Error {
	public readonly opDocError: OpDocError;

	constructor(opDocError: OpDocError) {
		super(opDocError.message);
		this.name = "OpDocError";
		this.opDocError = opDocError;
	}
}

export function classifyError(error: unknown): OpDocErrorException {
	const msg = error instanceof Error ? error.message : String(error);
	let opDocError: OpDocError;

	if (msg.includes("ECONNREFUSED") || msg.includes("fetch failed") || msg.includes("abort")) {
		opDocError = {
			type: "ollama_down",
			message: msg,
			userMessage: "Ollama가 실행 중인지 확인하세요.",
			originalError: error,
		};
	} else if (msg.includes("401") || msg.includes("403")) {
		opDocError = {
			type: "invalid_api_key",
			message: msg,
			userMessage: "API Key가 올바르지 않습니다.",
			originalError: error,
		};
	} else if (msg.includes("429")) {
		opDocError = {
			type: "rate_limit",
			message: msg,
			userMessage: "API 호출 한도에 도달했습니다. 잠시 후 재시도합니다.",
			originalError: error,
		};
	} else if (msg.includes("JSON") || msg.includes("parse") || msg.includes("SyntaxError")) {
		opDocError = {
			type: "parse_failure",
			message: msg,
			userMessage: "AI 응답을 처리하지 못했습니다.",
			originalError: error,
		};
	} else if (msg.includes("network") || msg.includes("ENOTFOUND") || msg.includes("timeout")) {
		opDocError = {
			type: "network_error",
			message: msg,
			userMessage: "네트워크 연결을 확인하세요.",
			originalError: error,
		};
	} else {
		opDocError = {
			type: "unknown",
			message: msg,
			userMessage: `오류가 발생했습니다: ${msg}`,
			originalError: error,
		};
	}

	return new OpDocErrorException(opDocError);
}

export function showErrorNotice(error: OpDocErrorException): void {
	new Notice(`[OpDoc] ${error.opDocError.userMessage}`);
	console.error(`[OpDoc] ${error.opDocError.type}: ${error.opDocError.message}`);
}
