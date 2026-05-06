import { TFile, type Vault } from "obsidian";
import type { ProcessingResult } from "../types";

const LOG_FILE_PATH = "OpDoc-Log.md";
const TABLE_HEADER =
	"| 원본 경로 | 이동 경로 | 상태 | 태그 | 처리 시간 | 에러 | 타임스탬프 |\n|-----------|----------|------|------|----------|------|-----------|";
const HEADER_LINE_COUNT = 4;

export class OpDocLogger {
	private vault: Vault;
	private maxEntries: number;

	constructor(vault: Vault, maxEntries: number = 200) {
		this.vault = vault;
		this.maxEntries = maxEntries;
	}

	async ensureLogFile(): Promise<void> {
		const existing = this.vault.getAbstractFileByPath(LOG_FILE_PATH);
		if (!existing) {
			await this.vault.create(LOG_FILE_PATH, `# OpDoc Activity Log\n\n${TABLE_HEADER}\n`);
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
