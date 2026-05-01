import { Notice, Plugin, TAbstractFile } from "obsidian";
import { DEFAULT_SETTINGS, type OpDocSettings } from "./types";
import { OpDocSettingTab } from "./settings";
import { OnboardingModal } from "./ui/onboarding";

export default class OpDocPlugin extends Plugin {
	settings!: OpDocSettings;

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
		this.registerEvent(
			this.app.vault.on("create", (file: TAbstractFile) => {
				console.debug("[OpDoc] file created:", file.path);
			}),
		);

		this.registerInterval(
			window.setInterval(() => {
				console.debug("[OpDoc] periodic inbox scan");
			}, 5 * 60 * 1000),
		);

		this.addCommand({
			id: "process-inbox-now",
			name: "process inbox now",
			callback: () => {
				new Notice("[OpDoc] manual inbox processing triggered");
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
