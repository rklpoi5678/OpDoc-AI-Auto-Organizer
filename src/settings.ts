import { type App, PluginSettingTab, Setting } from "obsidian";
import type OpDocPlugin from "./main";
import {
	AIProviderType,
	EmbeddingProviderType,
	OrganizingMethodology,
	ProcessingDelay,
} from "./types";

export class OpDocSettingTab extends PluginSettingTab {
	plugin: OpDocPlugin;

	constructor(app: App, plugin: OpDocPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		this.renderInboxSection(containerEl);
		this.renderProcessingSection(containerEl);
		this.renderLanguageSection(containerEl);
		this.renderMethodologySection(containerEl);
		this.renderAIProviderSection(containerEl);
		this.renderEmbeddingSection(containerEl);
		this.renderCustomInstructionsSection(containerEl);
		this.renderLoggingSection(containerEl);
		this.renderCacheSection(containerEl);
		this.renderOnboardingSection(containerEl);
		this.renderFundingSection(containerEl);
	}

	private renderInboxSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Target inbox folder")
			.setDesc("Folder to monitor for new markdown files")
			.addText((text) =>
				text
					.setPlaceholder("Inbox")
					.setValue(this.plugin.settings.inboxFolder)
					.onChange(async (value) => {
						this.plugin.settings.inboxFolder = value;
						await this.plugin.saveSettings();
					}),
			);
	}

	private renderProcessingSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Processing delay")
			.setDesc("Wait before processing newly created files")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						[ProcessingDelay.IMMEDIATE]: "Immediate",
						[ProcessingDelay.ONE_HOUR]: "1 hour",
						[ProcessingDelay.ONE_DAY]: "1 day",
					})
					.setValue(this.plugin.settings.processingDelay)
					.onChange(async (value) => {
						this.plugin.settings.processingDelay =
							value as ProcessingDelay;
						await this.plugin.saveSettings();
					}),
			);
	}

	private renderLanguageSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Language / 언어")
			.setDesc("Affects log file header language")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						"ko": "한국어",
						"en": "English",
						"zh": "中文",
					})
					.setValue(this.plugin.settings.language)
					.onChange(async (value) => {
						this.plugin.settings.language = value;
						await this.plugin.saveSettings();
					}),
			);
	}

	private renderMethodologySection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Organizing methodology")
			.setDesc(
				"Choose a file organization philosophy for the AI to follow",
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						[OrganizingMethodology.NONE]:
							"None (AI decides freely)",
						[OrganizingMethodology.PARA]:
							"PARA — Projects, Areas, Resources, Archives",
						[OrganizingMethodology.MECE]:
							"MECE — Mutually Exclusive, Collectively Exhaustive",
						[OrganizingMethodology.JOHNNY_DECIMAL]:
							"Johnny.Decimal — Numbered index system",
					})
					.setValue(this.plugin.settings.methodology)
					.onChange(async (value) => {
						this.plugin.settings.methodology =
							value as OrganizingMethodology;
						await this.plugin.saveSettings();
					}),
			);
	}

	private renderAIProviderSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("AI provider")
			.setDesc("Choose AI service for file analysis")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						[AIProviderType.OLLAMA]: "Local (Ollama)",
						[AIProviderType.OPENAI]: "Cloud (OpenAI)",
					})
					.setValue(this.plugin.settings.aiProvider)
					.onChange(async (value) => {
						this.plugin.settings.aiProvider =
							value as AIProviderType;
						await this.plugin.saveSettings();
						this.display();
					}),
			);

		if (this.plugin.settings.aiProvider === AIProviderType.OLLAMA) {
			new Setting(containerEl)
				.setName("Ollama endpoint")
				.setDesc("Url of your local Ollama server")
				.addText((text) =>
					text
						.setPlaceholder("http://localhost:11434")
						.setValue(this.plugin.settings.ollamaEndpoint)
						.onChange(async (value) => {
							this.plugin.settings.ollamaEndpoint = value;
							await this.plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName("AI model")
				.setDesc(
					"Ollama model for file analysis (e.g. llama3.2, mistral)",
				)
				.addText((text) =>
					text
						.setPlaceholder("llama3.2")
						.setValue(this.plugin.settings.aiModel)
						.onChange(async (value) => {
							this.plugin.settings.aiModel = value;
							await this.plugin.saveSettings();
						}),
				);
		}

		if (this.plugin.settings.aiProvider === AIProviderType.OPENAI) {
			new Setting(containerEl)
				.setName("OpenAI API key")
				.setDesc("Your OpenAI API key (stored locally only)")
				.addText((text) => {
					text.inputEl.type = "password";
					text.setPlaceholder("sk-...")
						.setValue(this.plugin.settings.openaiApiKey)
						.onChange(async (value) => {
							this.plugin.settings.openaiApiKey = value;
							await this.plugin.saveSettings();
						});
				});

			new Setting(containerEl)
				.setName("OpenAI endpoint")
				.setDesc("Api base URL (change for compatible providers)")
				.addText((text) =>
					text
						.setPlaceholder("https://api.openai.com/v1")
						.setValue(this.plugin.settings.openaiEndpoint)
						.onChange(async (value) => {
							this.plugin.settings.openaiEndpoint = value;
							await this.plugin.saveSettings();
						}),
				);

			new Setting(containerEl)
				.setName("AI model")
				.setDesc("Openai model for file analysis (e.g. gpt-4o-mini)")
				.addText((text) =>
					text
						.setPlaceholder("gpt-4o-mini")
						.setValue(this.plugin.settings.aiModel)
						.onChange(async (value) => {
							this.plugin.settings.aiModel = value;
							await this.plugin.saveSettings();
						}),
				);
		}
	}

	private renderEmbeddingSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Embedding provider")
			.setDesc("Model for folder similarity matching")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						[EmbeddingProviderType.OLLAMA_LOCAL]:
							"Free (local Ollama)",
						[EmbeddingProviderType.OPENAI_CLOUD]:
							"Paid (OpenAI cloud)",
					})
					.setValue(this.plugin.settings.embeddingProvider)
					.onChange(async (value) => {
						this.plugin.settings.embeddingProvider =
							value as EmbeddingProviderType;
						await this.plugin.saveSettings();
						this.display();
					}),
			);

		if (
			this.plugin.settings.embeddingProvider ===
			EmbeddingProviderType.OLLAMA_LOCAL
		) {
			new Setting(containerEl)
				.setName("Embedding model")
				.setDesc(
					"Local embedding model (run 'ollama pull nomic-embed-text')",
				)
				.addText((text) =>
					text
						.setPlaceholder("nomic-embed-text")
						.setValue(this.plugin.settings.embeddingModel)
						.onChange(async (value) => {
							this.plugin.settings.embeddingModel = value;
							await this.plugin.saveSettings();
						}),
				);
		}

		if (
			this.plugin.settings.embeddingProvider ===
			EmbeddingProviderType.OPENAI_CLOUD
		) {
			new Setting(containerEl)
				.setName("Embedding model")
				.setDesc("Openai embedding model")
				.addDropdown((dropdown) =>
					dropdown
						.addOptions({
							"text-embedding-3-small":
								"text-embedding-3-small (cheaper)",
							"text-embedding-3-large":
								"text-embedding-3-large (better)",
						})
						.setValue(this.plugin.settings.embeddingModel)
						.onChange(async (value) => {
							this.plugin.settings.embeddingModel = value;
							await this.plugin.saveSettings();
						}),
				);
		}

		new Setting(containerEl)
			.setName("Similarity threshold")
			.setDesc(
				"Minimum similarity to match existing folder (0.0-1.0). Lower = more new folders.",
			)
			.addSlider((slider) =>
				slider
					.setLimits(0.1, 1.0, 0.05)
					.setValue(this.plugin.settings.similarityThreshold)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.similarityThreshold = value;
						await this.plugin.saveSettings();
					}),
			);
	}

	private renderCustomInstructionsSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Custom instructions")
			.setDesc("Rules for AI to follow when organizing files")
			.addTextArea((text) => {
				text.setPlaceholder(
					"e.g. programming notes → Tech, diary → Daily",
				)
					.setValue(this.plugin.settings.customInstructions)
					.onChange(async (value) => {
						this.plugin.settings.customInstructions = value;
						await this.plugin.saveSettings();
					});
				text.inputEl.classList.add("opdoc-textarea");
			});
	}

	private renderLoggingSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Activity logging")
			.setDesc("Record processing history in OpDoc-Log.md")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.activityLogging)
					.onChange(async (value) => {
						this.plugin.settings.activityLogging = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Max log entries")
			.setDesc("Oldest entries are auto-trimmed when limit is exceeded")
			.addSlider((slider) =>
				slider
					.setLimits(50, 1000, 50)
					.setValue(this.plugin.settings.maxLogEntries)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.maxLogEntries = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Clear log")
			.setDesc("Delete all OpDoc-Log.md entries")
			.addButton((button) =>
				button.setButtonText("Clear log").onClick(async () => {
					const file =
						this.app.vault.getAbstractFileByPath("OpDoc-Log.md");
					if (file) {
						await this.app.fileManager.trashFile(file);
					}
				}),
			);
	}

	private renderCacheSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Folder embedding cache")
			.setDesc("Refresh cached folder vectors")
			.addButton((button) =>
				button.setButtonText("Refresh cache").onClick(async () => {
					button.setButtonText("Refreshing...");
					button.setDisabled(true);
					await this.plugin.rebuildEmbeddingCache?.();
					button.setButtonText("Refresh cache");
					button.setDisabled(false);
				}),
			);
	}

	private renderOnboardingSection(containerEl: HTMLElement): void {
		new Setting(containerEl)
			.setName("Onboarding")
			.setDesc("Restart the initial setup wizard")
			.addButton((button) =>
				button.setButtonText("Restart onboarding").onClick(() => {
					this.plugin.openOnboarding();
				}),
			);
	}

	private renderFundingSection(containerEl: HTMLElement): void {
		const fundingEl = containerEl.createDiv({ cls: "opdoc-funding" });
		fundingEl.createEl("p", {
			text: "☕ If OpDoc helps, buy the developer a cup of coffee!",
		});
		fundingEl.createEl("a", {
			text: "buy me a coffee",
			href: "https://ko-fi.com/yoongkim?hidefeed=true&widget=true&embed=true&preview=true",
		});

		fundingEl.createEl("p", {
			text: "📧 Feedback & suggestions: rklpoi5678@gmail.com",
		});
	}
}
