import { TFile, type Vault } from "obsidian";
import type { ProcessingResult } from "../types";

const LOG_FILE_PATH = "OpDoc-Log.md";
const HEADER_LINE_COUNT = 4;

const LOG_HEADERS: Record<string, { title: string; columns: string; separator: string }> = {
	ko: {
		title: "# OpDoc 활동 로그",
		columns: "| 원본 경로 | 이동 경로 | 상태 | 태그 | 처리 시간 | 에러 | 타임스탬프 |",
		separator: "|-----------|----------|------|------|----------|------|-----------|",
	},
	en: {
		title: "# OpDoc Activity Log",
		columns: "| Source Path | Target Path | Status | Tags | Processing Time | Error | Timestamp |",
		separator: "|-------------|-------------|--------|------|----------------|-------|-----------|",
	},
	zh: {
		title: "# OpDoc 活动日志",
		columns: "| 原始路径 | 目标路径 | 状态 | 标签 | 处理时间 | 错误 | 时间戳 |",
		separator: "|---------|---------|------|------|---------|------|--------|",
	},
};

function getLogHeader(lang: string): string {
	const header = LOG_HEADERS[lang] ?? LOG_HEADERS["ko"]!;
	return `${header.title}\n\n${header.columns}\n${header.separator}\n`;
}

export class OpDocLogger {
	private vault: Vault;
	private maxEntries: number;
	private lang: string;

	constructor(vault: Vault, maxEntries: number = 200, lang: string = "ko") {
		this.vault = vault;
		this.maxEntries = maxEntries;
		this.lang = lang;
	}

	async ensureLogFile(): Promise<void> {
		const existing = this.vault.getAbstractFileByPath(LOG_FILE_PATH);
		if (!existing) {
			await this.vault.create(LOG_FILE_PATH, getLogHeader(this.lang));
		}
	}

	async logEntry(result: ProcessingResult): Promise<void> {
		await this.ensureLogFile();

		const file = this.vault.getAbstractFileByPath(LOG_FILE_PATH);
		if (!(file instanceof TFile)) return;

		const statusIcon = result.status === "done" ? "✅ Done" : "❌ Fail";
		const tags = result.tags.join(", ") || "-";
		const row = `| ${result.originalPath} | ${result.targetPath ?? "-"} | ${statusIcon} | ${tags} | ${result.processingTime.toFixed(1)}s | ${result.error ?? "-"} | ${result.timestamp} |`;

		const content = await this.vault.read(file);
		const lines = content.split("\n");
		const dataLines = lines.slice(HEADER_LINE_COUNT);
		dataLines.push(row);

		while (dataLines.length > this.maxEntries) {
			dataLines.shift();
		}

		const header = lines.slice(0, HEADER_LINE_COUNT).join("\n");
		const updated = header + "\n" + dataLines.join("\n");
		await this.vault.modify(file, updated);
	}
}
