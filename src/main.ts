import { Notice, Plugin, TAbstractFile } from "obsidian";
import { DEFAULT_SETTINGS, type OpDocSettings } from "./types";
import { OpDocSettingTab } from "./settings";
import { OnboardingModal } from "./ui/onboarding";
import { FolderEmbeddingCache } from "./core/cache";
import { FileOrganizer } from "./core/organizer";
import { FileProcessor } from "./core/processor";
import { VaultIndexer } from "./core/indexer";
import { isMarkdownFile } from "./utils/helpers";

export default class OpDocPlugin extends Plugin {
	settings!: OpDocSettings;
	private cache!: FolderEmbeddingCache;
	private indexer!: VaultIndexer;
	private organizer!: FileOrganizer;
	private processor!: FileProcessor;

	public rebuildEmbeddingCache?: () => Promise<void>;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new OpDocSettingTab(this.app, this));

		if (!this.settings.onboardingComplete) {
			this.openOnboarding();
			return;
		}

		this.initCore();
	}

	onunload() {
		console.debug("[OpDoc] plugin unloaded");
	}

	public openOnboarding(): void {
		const modal = new OnboardingModal(this.app, this);
		modal.open();
	}

	initCore(): void {
		this.cache = new FolderEmbeddingCache(this, this.settings);
		this.indexer = new VaultIndexer(this, this.settings.inboxFolder);
		this.organizer = new FileOrganizer(this.app, this.settings, this.cache, this.indexer);
		this.processor = new FileProcessor(this.organizer, this.settings);

		void this.cache.load().then(() => {
			void this.cache.rebuildAll();
		});

		void this.indexer.load().then(() => {
			void this.indexer.buildFull();
		});

		this.rebuildEmbeddingCache = async () => {
			await this.cache.rebuildAll();
			await this.indexer.buildFull();
			new Notice("[OpDoc] cache and index rebuilt");
		};

		this.registerEvent(
			this.app.vault.on("create", (file: TAbstractFile) => {
				if (isMarkdownFile(file)) {
					this.processor.enqueue(file);
				}
			}),
		);

		this.processor.catchUp();

		this.registerInterval(
			window.setInterval(() => {
				this.processor.scanInbox(this.app.vault);
			}, 5 * 60 * 1000),
		);

		this.addCommand({
			id: "process-inbox-now",
			name: "Process inbox now",
			callback: () => {
				this.processor.scanInbox(this.app.vault);
				new Notice("[OpDoc] manual inbox processing triggered");
			},
		});

		this.addCommand({
			id: "rebuild-embedding-cache",
			name: "Rebuild vault index",
			callback: () => {
				void this.rebuildEmbeddingCache?.();
			},
		});
	}

	async loadSettings(): Promise<void> {
		const data = await this.loadData() as Partial<OpDocSettings> | null;
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data ?? {});
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
