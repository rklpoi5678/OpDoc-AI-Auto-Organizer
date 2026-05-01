import { App, Modal, Notice, requestUrl } from "obsidian";
import type OpDocPlugin from "../main";
import {
	AIProviderType,
	DEFAULT_SETTINGS,
	EmbeddingProviderType,
	type OpDocSettings,
} from "../types";

const STEPS = [
	"Welcome",
	"Inbox folder",
	"AI provider",
	"Embedding model",
	"Custom instructions",
	"Complete",
] as const;

export class OnboardingModal extends Modal {
	private plugin: OpDocPlugin;
	private currentStep = 0;
	private wizardData: Partial<OpDocSettings> = {};

	constructor(app: App, plugin: OpDocPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen(): void {
		this.titleEl.setText("OpDoc setup");
		this.renderStep();
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private renderStep(): void {
		const { contentEl } = this;
		contentEl.empty();

		this.renderStepIndicator(contentEl);

		const stepEl = contentEl.createDiv({ cls: "opdoc-onboarding" });

		switch (this.currentStep) {
			case 0: this.renderWelcome(stepEl); break;
			case 1: this.renderInboxSetup(stepEl); break;
			case 2: this.renderAIProvider(stepEl); break;
			case 3: this.renderEmbeddingModel(stepEl); break;
			case 4: this.renderCustomInstructions(stepEl); break;
			case 5: this.renderComplete(stepEl); break;
		}
	}

	private renderStepIndicator(container: HTMLElement): void {
		const stepsEl = container.createDiv({ cls: "opdoc-onboarding-steps" });
		for (let i = 0; i < STEPS.length; i++) {
			const stepEl = stepsEl.createDiv({ cls: "opdoc-onboarding-step" });
			if (i === this.currentStep) stepEl.classList.add("active");
			if (i < this.currentStep) stepEl.classList.add("completed");
		}
	}

	private renderWelcome(container: HTMLElement): void {
		container.createEl("h2", { text: "Welcome to OpDoc!" });
		container.createEl("p", {
			text: "OpDoc automatically organizes your markdown notes using AI. It watches your inbox folder, analyzes new files, tags them, and moves them to the right folder.",
		});
		container.createEl("p", {
			text: "This setup wizard will guide you through configuration in a few steps.",
		});
		this.createNavButtons(container, false, true);
	}

	private renderInboxSetup(container: HTMLElement): void {
		container.createEl("h3", { text: "Set up your inbox folder" });
		container.createEl("p", {
			text: "Choose a folder where you will drop new files. OpDoc will monitor this folder for unprocessed markdown files.",
		});

		const input = container.createEl("input", {
			type: "text",
			cls: "opdoc-input",
		});
		input.value = this.wizardData.inboxFolder ?? DEFAULT_SETTINGS.inboxFolder;
		input.placeholder = "Inbox";

		const autoCreateLabel = container.createEl("label", {
			cls: "opdoc-checkbox-label",
		});
		const autoCreate = autoCreateLabel.createEl("input", { type: "checkbox" });
		autoCreate.checked = true;
		autoCreateLabel.createSpan({ text: " Create folder if it does not exist" });

		this.wizardData.inboxFolder = input.value;
		input.addEventListener("input", () => {
			this.wizardData.inboxFolder = input.value || DEFAULT_SETTINGS.inboxFolder;
		});
		// store temporarily for folder creation in finishOnboarding

		this.createNavButtons(container, true, true);
	}

	private renderAIProvider(container: HTMLElement): void {
		container.createEl("h3", { text: "Choose your AI provider" });

		const ollamaRadio = this.createRadioOption(
			container,
			"local",
			this.wizardData.aiProvider !== AIProviderType.OPENAI,
			"Local (Ollama) — free, runs on your machine",
			"Your data never leaves your computer. Requires Ollama installed and running.",
		);

		const cloudRadio = this.createRadioOption(
			container,
			"cloud",
			this.wizardData.aiProvider === AIProviderType.OPENAI,
			"Cloud (OpenAI) — requires API key",
			"Uses OpenAI API. You need an API key. Data is sent to OpenAI servers.",
		);

		const providerConfigEl = container.createDiv();

		const renderProviderConfig = (provider: AIProviderType): void => {
			providerConfigEl.empty();
			if (provider === AIProviderType.OLLAMA) {
				this.wizardData.aiProvider = AIProviderType.OLLAMA;
				this.wizardData.aiModel ??= DEFAULT_SETTINGS.aiModel;

				providerConfigEl.createEl("p", { text: "Ollama endpoint:" });
				const endpointInput = providerConfigEl.createEl("input", { type: "text" });
				endpointInput.value = this.wizardData.ollamaEndpoint ?? DEFAULT_SETTINGS.ollamaEndpoint;
				endpointInput.addEventListener("input", () => {
					this.wizardData.ollamaEndpoint = endpointInput.value;
				});

				void this.detectOllama(providerConfigEl, endpointInput.value);
			} else {
				this.wizardData.aiProvider = AIProviderType.OPENAI;
				this.wizardData.aiModel ??= "gpt-4o-mini";

				providerConfigEl.createEl("p", { text: "OpenAI API key:" });
				const keyInput = providerConfigEl.createEl("input", { type: "password" });
				keyInput.placeholder = "sk-...";
				keyInput.value = this.wizardData.openaiApiKey ?? "";
				keyInput.addEventListener("input", () => {
					this.wizardData.openaiApiKey = keyInput.value;
				});
			}
		};

		const currentProvider = this.wizardData.aiProvider ?? DEFAULT_SETTINGS.aiProvider;
		renderProviderConfig(currentProvider);

		ollamaRadio.addEventListener("change", () => renderProviderConfig(AIProviderType.OLLAMA));
		cloudRadio.addEventListener("change", () => renderProviderConfig(AIProviderType.OPENAI));

		this.createNavButtons(container, true, true);
	}

	private renderEmbeddingModel(container: HTMLElement): void {
		container.createEl("h3", { text: "Choose embedding model" });
		container.createEl("p", {
			text: "Embedding models are used to match new files with existing folders by content similarity.",
		});

		const localRadio = this.createRadioOption(
			container,
			"local-emb",
			this.wizardData.embeddingProvider !== EmbeddingProviderType.OPENAI_CLOUD,
			"Free (local Ollama) — nomic-embed-text",
			"Runs locally. No token costs. Run 'ollama pull nomic-embed-text' to install.",
		);

		const cloudRadio = this.createRadioOption(
			container,
			"cloud-emb",
			this.wizardData.embeddingProvider === EmbeddingProviderType.OPENAI_CLOUD,
			"Paid (OpenAI cloud) — text-embedding-3-small",
			"Uses OpenAI embedding API. Incurs token costs per request.",
		);

		localRadio.addEventListener("change", () => {
			this.wizardData.embeddingProvider = EmbeddingProviderType.OLLAMA_LOCAL;
			this.wizardData.embeddingModel = "nomic-embed-text";
		});

		cloudRadio.addEventListener("change", () => {
			this.wizardData.embeddingProvider = EmbeddingProviderType.OPENAI_CLOUD;
			this.wizardData.embeddingModel = "text-embedding-3-small";
		});

		this.createNavButtons(container, true, true);
	}

	private renderCustomInstructions(container: HTMLElement): void {
		container.createEl("h3", { text: "Custom instructions (optional)" });
		container.createEl("p", {
			text: "Add rules for how OpDoc should organize your files. You can skip this and add rules later in settings.",
		});

		const presets = [
			{ label: "Tech / Daily split", value: "Programming and tech notes → Tech folder. Personal diary → Daily folder." },
			{ label: "Project-based", value: "Group files by project name. Work-related → Work folder." },
			{ label: "Skip", value: "" },
		];

		const presetContainer = container.createDiv();
		for (const preset of presets) {
			const btn = presetContainer.createEl("button", {
				text: preset.label,
				cls: "opdoc-preset-btn",
			});
			btn.addEventListener("click", () => {
				textarea.value = preset.value;
				this.wizardData.customInstructions = preset.value;
			});
		}

		const textarea = container.createEl("textarea", { cls: "opdoc-textarea" });
		textarea.value = this.wizardData.customInstructions ?? "";
		textarea.addEventListener("input", () => {
			this.wizardData.customInstructions = textarea.value;
		});

		this.createNavButtons(container, true, true);
	}

	private renderComplete(container: HTMLElement): void {
		container.createEl("h3", { text: "Setup complete!" });
		container.createEl("p", {
			text: "OpDoc is now configured and ready. Drop markdown files into your inbox folder and they will be automatically organized.",
		});

		const summaryEl = container.createDiv({ cls: "opdoc-summary" });
		summaryEl.createEl("p", { text: `Inbox: ${this.wizardData.inboxFolder ?? "Inbox"}` });
		summaryEl.createEl("p", { text: `AI: ${this.wizardData.aiProvider ?? "ollama"}` });
		summaryEl.createEl("p", { text: `Embedding: ${this.wizardData.embeddingModel ?? "nomic-embed-text"}` });

		const finishBtn = container.createEl("button", {
			text: "Start using OpDoc",
			cls: "mod-cta",
		});
		finishBtn.addEventListener("click", () => {
			void this.finishOnboarding();
		});
	}

	private async finishOnboarding(): Promise<void> {
		const settings: Partial<OpDocSettings> = {
			...this.wizardData,
			onboardingComplete: true,
		};

		Object.assign(this.plugin.settings, settings);
		await this.plugin.saveSettings();

		this.close();

		this.plugin.initCore();
		new Notice("OpDoc is now active! Drop files into your inbox folder.");
	}

	private createRadioOption(
		container: HTMLElement,
		name: string,
		checked: boolean,
		label: string,
		desc: string,
	): HTMLInputElement {
		const wrapper = container.createDiv({ cls: "opdoc-radio-option" });
		const input = wrapper.createEl("input", { type: "radio", attr: { name } });
		input.checked = checked;
		const labelEl = wrapper.createEl("label");
		labelEl.createEl("strong", { text: label });
		labelEl.createEl("br");
		labelEl.createEl("small", { text: desc });
		return input;
	}

	private createNavButtons(container: HTMLElement, showBack: boolean, showNext: boolean): void {
		const navEl = container.createDiv({ cls: "opdoc-nav" });

		if (showBack) {
			const backBtn = navEl.createEl("button", { text: "Back" });
			backBtn.addEventListener("click", () => {
				this.currentStep--;
				this.renderStep();
			});
		}

		if (showNext && this.currentStep < STEPS.length - 1) {
			const nextBtn = navEl.createEl("button", { text: "Next", cls: "mod-cta" });
			nextBtn.addEventListener("click", () => {
				this.currentStep++;
				this.renderStep();
			});
		}
	}

	private async detectOllama(container: HTMLElement, endpoint: string): Promise<void> {
		const statusEl = container.createDiv({ cls: "opdoc-ollama-status" });
		try {
			const resp = await requestUrl({
				url: `${endpoint}/api/tags`,
				method: "GET",
			});

			const data = resp.json as { models?: Array<{ name: string }> };
			const models = data.models?.map((m) => m.name).join(", ") ?? "none";
			statusEl.createEl("p", {
				text: `Ollama detected! Available models: ${models}`,
				cls: "opdoc-status-success",
			});
		} catch {
			statusEl.createEl("p", {
				text: "Could not reach Ollama. Make sure it is running.",
				cls: "opdoc-status-warn",
			});
		}
	}
}
