import type { TFile } from "obsidian";
import type { OpDocSettings, QueueItem } from "../types";
import { FileProcessingState } from "../types";
import { FileOrganizer } from "./organizer";
import { isMarkdownFile, isInboxFile, getFilesInFolder } from "../utils/helpers";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

export class FileProcessor {
	private queue: QueueItem[] = [];
	private processing = false;
	private organizer: FileOrganizer;
	private settings: OpDocSettings;
	private inboxPath: string;

	constructor(organizer: FileOrganizer, settings: OpDocSettings) {
		this.organizer = organizer;
		this.settings = settings;
		this.inboxPath = settings.inboxFolder;
	}

	enqueue(file: TFile): void {
		if (!isMarkdownFile(file) || !isInboxFile(file, this.inboxPath)) return;

		const alreadyQueued = this.queue.some(
			(item) => item.file.path === file.path && item.state !== FileProcessingState.COMPLETED,
		);
		if (alreadyQueued) return;

		this.queue.push({
			file,
			state: FileProcessingState.PENDING,
			retryCount: 0,
			addedAt: Date.now(),
			lastAttemptAt: null,
			error: null,
		});

		void this.processNext();
	}

	catchUp(): void {
		const files = getFilesInFolder(this.organizer.app.vault, this.inboxPath);
		for (const file of files) {
			this.enqueue(file);
		}
	}

	private async processNext(): Promise<void> {
		if (this.processing) return;

		const item = this.queue.find((i) => i.state === FileProcessingState.PENDING);
		if (!item) return;

		this.processing = true;
		item.state = FileProcessingState.PROCESSING;
		item.lastAttemptAt = Date.now();

		try {
			await this.organizer.processFile(item.file);
			item.state = FileProcessingState.COMPLETED;
		} catch {
			item.retryCount++;
			item.state = FileProcessingState.PENDING;

			if (item.retryCount >= MAX_RETRIES) {
				item.state = FileProcessingState.FAILED;
			} else {
				const delay = BASE_DELAY_MS * Math.pow(2, item.retryCount - 1);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}

		this.processing = false;

		this.queue = this.queue.filter(
			(i) => i.state === FileProcessingState.PENDING,
		);

		void this.processNext();
	}

	scanInbox(vault: import("obsidian").Vault): void {
		const files = getFilesInFolder(vault, this.inboxPath);
		for (const file of files) {
			this.enqueue(file);
		}
	}
}
