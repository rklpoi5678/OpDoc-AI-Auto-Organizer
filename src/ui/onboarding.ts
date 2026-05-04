import { App, Modal, Notice, requestUrl } from "obsidian";
import type OpDocPlugin from "../main";
import {
	AIProviderType,
	DEFAULT_SETTINGS,
	EmbeddingProviderType,
	type OpDocSettings,
} from "../types";

type Lang = "ko" | "en" | "zh";

interface Translations {
	stepNames: string[];
	welcomeTitle: string;
	welcomeDesc: string;
	welcomeFeatures: string[];
	welcomeHint: string;
	inboxTitle: string;
	inboxDesc: string;
	inboxHint: string;
	aiProviderTitle: string;
	aiProviderDesc: string;
	ollamaLabel: string;
	ollamaDesc: string;
	cloudLabel: string;
	cloudDesc: string;
	ollamaEndpoint: string;
	openaiApiKey: string;
	openaiKeyHint: string;
	modelTitle: string;
	modelDescOllama: string;
	modelDescOpenai: string;
	modelOrType: string;
	modelNotFound: string;
	embTitle: string;
	embDesc: string;
	embLocalLabel: string;
	embLocalDesc: string;
	embCloudLabel: string;
	embCloudDesc: string;
	embCloudHint: string;
	instructionsTitle: string;
	instructionsDesc: string;
	presetTech: string;
	presetProject: string;
	presetSkip: string;
	completeTitle: string;
	completeDesc: string;
	completeTip: string;
	completeStart: string;
	back: string;
	next: string;
	summaryLabels: {
		inbox: string;
		aiProvider: string;
		aiModel: string;
		embModel: string;
		instructions: string;
	};
	costLabel: string;
	dataLabel: string;
	requireLabel: string;
	costFree: string;
	costPaid: string;
	dataLocal: string;
	dataCloud: string;
	requireOllama: string;
	requireApiKey: string;
	installedModels: string;
	ollamaSuccess: string;
	ollamaFail: string;
	noticeActive: string;
}

const T: Record<Lang, Translations> = {
	ko: {
		stepNames: ["시작하기", "Inbox 폴더", "AI 공급자", "모델 선택", "임베딩 모델", "추가 지침", "완료"],
		welcomeTitle: "OpDoc에 오신 것을 환영합니다!",
		welcomeDesc: "OpDoc은 AI가 내 Obsidian Vault의 마크다운 파일을 자동으로 분석하여, 적절한 태그를 부여하고 알맞은 폴더로 이동시켜 줍니다.",
		welcomeFeatures: [
			"Inbox 폴더에 파일을 드롭하면 자동 처리",
			"AI가 콘텐츠를 분석해 태그와 폴더 결정",
			"Ollama(무료/로컬) 또는 OpenAI(클라우드) 지원",
			"모든 처리 과정을 OpDoc-Log.md에 기록",
		],
		welcomeHint: "이 마법사에서 몇 가지 설정만 하면 바로 시작할 수 있습니다.",
		inboxTitle: "Inbox 폴더 설정",
		inboxDesc: "새 마크다운 파일을 넣을 폴더를 지정하세요. OpDoc이 이 폴더를 감시합니다.",
		inboxHint: "이미 존재하는 폴더를 입력하면 그대로 사용합니다. 없으면 자동 생성됩니다.",
		aiProviderTitle: "AI 공급자 선택",
		aiProviderDesc: "파일 분석에 사용할 AI를 선택하세요.",
		ollamaLabel: "로컬 (Ollama) — 무료, 내 컴퓨터에서 실행",
		ollamaDesc: "데이터가 외부로 전송되지 않습니다. Ollama가 실행 중이어야 합니다.",
		cloudLabel: "클라우드 (OpenAI) — API 키 필요",
		cloudDesc: "OpenAI API를 사용합니다. API 키가 필요하며 데이터가 OpenAI 서버로 전송됩니다.",
		ollamaEndpoint: "Ollama 엔드포인트:",
		openaiApiKey: "OpenAI API 키:",
		openaiKeyHint: "API 키는 로컬에만 저장되며 외부로 전송되지 않습니다.",
		modelTitle: "분석용 AI 모델 선택",
		modelDescOllama: "파일 내용을 분석할 Ollama 모델을 선택하세요. 채팅 모델이어야 합니다.",
		modelDescOpenai: "사용할 OpenAI 모델을 선택하세요.",
		modelOrType: "또는 직접 입력:",
		modelNotFound: "모델이 감지되지 않았습니다. 터미널에서 'ollama pull llama3.2' 실행 후 새로고침하세요.",
		embTitle: "임베딩 모델 선택",
		embDesc: "임베딩 모델은 파일과 폴더 간의 유사도를 계산하는 데 사용됩니다.",
		embLocalLabel: "로컬 (Ollama) — nomic-embed-text",
		embLocalDesc: "무료. 로컬에서 실행. 'ollama pull nomic-embed-text'로 설치.",
		embCloudLabel: "클라우드 (OpenAI) — text-embedding-3-small",
		embCloudDesc: "OpenAI 임베딩 API 사용. 요청당 비용 발생.",
		embCloudHint: "임베딩에 OpenAI API 키를 공유합니다. 별도 설정 불필요.",
		instructionsTitle: "추가 지침 (선택사항)",
		instructionsDesc: "OpDoc이 파일을 정리할 때 참고할 규칙을 작성하세요. 나중에 설정에서 변경할 수 있습니다.",
		presetTech: "기술/일상 분리",
		presetProject: "프로젝트 기반",
		presetSkip: "건너뛰기",
		completeTitle: "설정 완료!",
		completeDesc: "OpDoc이 설정되었습니다. Inbox 폴더에 마크다운 파일을 넣으면 자동으로 분석하여 태그를 부여하고 적절한 폴더로 이동합니다.",
		completeTip: "명령어 팔레트에서 'Process inbox now'로 수동 처리할 수 있습니다. 설정에서 언제든 변경 가능합니다.",
		completeStart: "OpDoc 시작하기",
		back: "이전",
		next: "다음",
		summaryLabels: {
			inbox: "Inbox 폴더",
			aiProvider: "AI 공급자",
			aiModel: "분석 모델",
			embModel: "임베딩 모델",
			instructions: "추가 지침",
		},
		costLabel: "비용",
		dataLabel: "데이터",
		requireLabel: "요구사항",
		costFree: "무료",
		costPaid: "사용량 기반 과금",
		dataLocal: "내 컴퓨터에서만 처리",
		dataCloud: "OpenAI 서버로 전송",
		requireOllama: "Ollama 설치 + 모델 다운로드",
		requireApiKey: "API 키만 있으면 됨",
		installedModels: "설치된 모델:",
		ollamaSuccess: "Ollama 연결 성공! 설치된 모델: ",
		ollamaFail: "Ollama에 연결할 수 없습니다. Ollama가 실행 중인지 확인하세요.",
		noticeActive: "OpDoc 활성화 완료! Inbox 폴더에 파일을 넣어보세요.",
	},
	en: {
		stepNames: ["Welcome", "Inbox folder", "AI provider", "Model", "Embedding", "Custom instructions", "Complete"],
		welcomeTitle: "Welcome to OpDoc!",
		welcomeDesc: "OpDoc automatically organizes your markdown notes using AI. It watches your inbox folder, analyzes new files, tags them, and moves them to the right folder.",
		welcomeFeatures: [
			"Drop files into inbox — auto-processed",
			"AI analyzes content to assign tags and folders",
			"Ollama (free/local) or OpenAI (cloud) backend",
			"All actions logged to OpDoc-Log.md",
		],
		welcomeHint: "This wizard will walk you through setup in a few steps.",
		inboxTitle: "Set up your inbox folder",
		inboxDesc: "Choose a folder where you will drop new files. OpDoc monitors this folder for unprocessed markdown files.",
		inboxHint: "If the folder already exists, it will be used as-is. Otherwise it will be created automatically.",
		aiProviderTitle: "Choose your AI provider",
		aiProviderDesc: "Select the AI backend for file analysis.",
		ollamaLabel: "Local (Ollama) — free, runs on your machine",
		ollamaDesc: "Your data never leaves your computer. Requires Ollama installed and running.",
		cloudLabel: "Cloud (OpenAI) — requires API key",
		cloudDesc: "Uses OpenAI API. You need an API key. Data is sent to OpenAI servers.",
		ollamaEndpoint: "Ollama endpoint:",
		openaiApiKey: "OpenAI API key:",
		openaiKeyHint: "Your API key is stored locally only and never sent to any third party.",
		modelTitle: "Select AI model",
		modelDescOllama: "Choose an Ollama model for file analysis. Must be a chat model.",
		modelDescOpenai: "Choose an OpenAI model for file analysis.",
		modelOrType: "Or type a model name:",
		modelNotFound: "No models detected. Run 'ollama pull llama3.2' in terminal, then refresh.",
		embTitle: "Choose embedding model",
		embDesc: "Embedding models calculate similarity between files and folders.",
		embLocalLabel: "Free (local Ollama) — nomic-embed-text",
		embLocalDesc: "Runs locally. No token costs. Run 'ollama pull nomic-embed-text' to install.",
		embCloudLabel: "Paid (OpenAI cloud) — text-embedding-3-small",
		embCloudDesc: "Uses OpenAI embedding API. Incurs token costs per request.",
		embCloudHint: "Shares the OpenAI API key from the previous step. No additional setup needed.",
		instructionsTitle: "Custom instructions (optional)",
		instructionsDesc: "Add rules for how OpDoc should organize your files. You can change these later in settings.",
		presetTech: "Tech / Daily split",
		presetProject: "Project-based",
		presetSkip: "Skip",
		completeTitle: "Setup complete!",
		completeDesc: "OpDoc is now configured and ready. Drop markdown files into your inbox folder and they will be automatically organized.",
		completeTip: "Use 'Process inbox now' from the command palette for manual processing. Settings can be changed anytime.",
		completeStart: "Start using OpDoc",
		back: "Back",
		next: "Next",
		summaryLabels: {
			inbox: "Inbox folder",
			aiProvider: "AI provider",
			aiModel: "Analysis model",
			embModel: "Embedding model",
			instructions: "Custom instructions",
		},
		costLabel: "Cost",
		dataLabel: "Data",
		requireLabel: "Requirements",
		costFree: "Free",
		costPaid: "Usage-based billing",
		dataLocal: "Processed on your machine only",
		dataCloud: "Sent to OpenAI servers",
		requireOllama: "Ollama installed + model downloaded",
		requireApiKey: "API key only",
		installedModels: "Installed models:",
		ollamaSuccess: "Ollama connected! Installed models: ",
		ollamaFail: "Cannot reach Ollama. Make sure it is running.",
		noticeActive: "OpDoc activated! Drop files into your inbox folder.",
	},
	zh: {
		stepNames: ["开始", "收件箱文件夹", "AI 提供者", "模型选择", "嵌入模型", "自定义指令", "完成"],
		welcomeTitle: "欢迎使用 OpDoc！",
		welcomeDesc: "OpDoc 使用 AI 自动整理您的 Markdown 笔记。它会监视收件箱文件夹，分析新文件，添加标签，并移动到合适的文件夹。",
		welcomeFeatures: [
			"将文件放入收件箱 — 自动处理",
			"AI 分析内容并分配标签和文件夹",
			"支持 Ollama（免费/本地）或 OpenAI（云端）",
			"所有操作记录到 OpDoc-Log.md",
		],
		welcomeHint: "本向导将引导您完成设置。",
		inboxTitle: "设置收件箱文件夹",
		inboxDesc: "选择一个文件夹用于放入新文件。OpDoc 将监视此文件夹。",
		inboxHint: "如果文件夹已存在则直接使用，否则自动创建。",
		aiProviderTitle: "选择 AI 提供者",
		aiProviderDesc: "选择用于文件分析的 AI 后端。",
		ollamaLabel: "本地 (Ollama) — 免费，在您的电脑上运行",
		ollamaDesc: "数据不会离开您的电脑。需要安装并运行 Ollama。",
		cloudLabel: "云端 (OpenAI) — 需要 API 密钥",
		cloudDesc: "使用 OpenAI API。需要 API 密钥。数据将发送到 OpenAI 服务器。",
		ollamaEndpoint: "Ollama 端点：",
		openaiApiKey: "OpenAI API 密钥：",
		openaiKeyHint: "API 密钥仅存储在本地，不会发送给第三方。",
		modelTitle: "选择 AI 模型",
		modelDescOllama: "选择用于文件分析的 Ollama 模型。必须是聊天模型。",
		modelDescOpenai: "选择用于文件分析的 OpenAI 模型。",
		modelOrType: "或手动输入模型名称：",
		modelNotFound: "未检测到模型。请在终端运行 'ollama pull llama3.2' 后刷新。",
		embTitle: "选择嵌入模型",
		embDesc: "嵌入模型用于计算文件和文件夹之间的相似度。",
		embLocalLabel: "免费 (本地 Ollama) — nomic-embed-text",
		embLocalDesc: "本地运行，无费用。运行 'ollama pull nomic-embed-text' 安装。",
		embCloudLabel: "付费 (OpenAI 云端) — text-embedding-3-small",
		embCloudDesc: "使用 OpenAI 嵌入 API，按请求计费。",
		embCloudHint: "与上一步的 OpenAI API 密钥共用，无需额外设置。",
		instructionsTitle: "自定义指令（可选）",
		instructionsDesc: "添加 OpDoc 整理文件时应遵循的规则。稍后可在设置中修改。",
		presetTech: "技术/日常分类",
		presetProject: "按项目分类",
		presetSkip: "跳过",
		completeTitle: "设置完成！",
		completeDesc: "OpDoc 已配置完成。将 Markdown 文件放入收件箱文件夹即可自动整理。",
		completeTip: "可从命令面板使用 'Process inbox now' 手动处理。设置随时可修改。",
		completeStart: "开始使用 OpDoc",
		back: "上一步",
		next: "下一步",
		summaryLabels: {
			inbox: "收件箱文件夹",
			aiProvider: "AI 提供者",
			aiModel: "分析模型",
			embModel: "嵌入模型",
			instructions: "自定义指令",
		},
		costLabel: "费用",
		dataLabel: "数据",
		requireLabel: "要求",
		costFree: "免费",
		costPaid: "按用量计费",
		dataLocal: "仅在本地处理",
		dataCloud: "发送到 OpenAI 服务器",
		requireOllama: "安装 Ollama + 下载模型",
		requireApiKey: "仅需 API 密钥",
		installedModels: "已安装模型：",
		ollamaSuccess: "Ollama 连接成功！已安装模型：",
		ollamaFail: "无法连接 Ollama。请确认 Ollama 正在运行。",
		noticeActive: "OpDoc 已激活！将文件放入收件箱文件夹试试。",
	},
};

export class OnboardingModal extends Modal {
	private plugin: OpDocPlugin;
	private currentStep = -1; // -1 = language selection
	private wizardData: Partial<OpDocSettings> = {};
	private detectedModels: string[] = [];
	private lang: Lang = "ko";

	constructor(app: App, plugin: OpDocPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen(): void {
		this.titleEl.setText("OpDoc Setup");
		this.renderStep();
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private t(): Translations {
		return T[this.lang];
	}

	private renderStep(): void {
		const { contentEl } = this;
		contentEl.empty();

		if (this.currentStep === -1) {
			this.renderLanguageSelect(contentEl);
			return;
		}

		this.renderStepIndicator(contentEl);

		const stepEl = contentEl.createDiv({ cls: "opdoc-onboarding" });

		if (this.currentStep === 0) this.renderWelcome(stepEl);
		else if (this.currentStep === 1) this.renderInboxSetup(stepEl);
		else if (this.currentStep === 2) this.renderAIProvider(stepEl);
		else if (this.currentStep === 3) this.renderModelSelect(stepEl);
		else if (this.currentStep === 4) this.renderEmbeddingModel(stepEl);
		else if (this.currentStep === 5) this.renderCustomInstructions(stepEl);
		else if (this.currentStep === 6) this.renderComplete(stepEl);
	}

	private renderLanguageSelect(container: HTMLElement): void {
		container.createEl("h2", { text: "Select language / 언어 선택 / 选择语言" });

		const langs: Array<{ id: Lang; label: string; desc: string }> = [
			{ id: "ko", label: "한국어", desc: "Korean" },
			{ id: "en", label: "English", desc: "영어" },
			{ id: "zh", label: "中文", desc: "Chinese" },
		];

		for (const l of langs) {
			const radio = this.createRadioOption(
				container,
				"lang-select",
				this.lang === l.id,
				l.label,
				l.desc,
			);
			radio.addEventListener("change", () => {
				this.lang = l.id;
			});
		}

		const nextBtn = container.createEl("button", {
			text: "Next / 다음 / 下一步",
			cls: "mod-cta",
		});
		nextBtn.addEventListener("click", () => {
			this.currentStep = 0;
			this.renderStep();
		});
	}

	private renderStepIndicator(container: HTMLElement): void {
		const stepsEl = container.createDiv({ cls: "opdoc-onboarding-steps" });
		const names = this.t().stepNames;
		for (let i = 0; i < names.length; i++) {
			const stepEl = stepsEl.createDiv({ cls: "opdoc-onboarding-step" });
			if (i === this.currentStep) stepEl.classList.add("active");
			if (i < this.currentStep) stepEl.classList.add("completed");
		}
	}

	private renderWelcome(container: HTMLElement): void {
		const t = this.t();
		container.createEl("h2", { text: t.welcomeTitle });
		container.createEl("p", { text: t.welcomeDesc });

		const featureList = container.createEl("ul");
		for (const f of t.welcomeFeatures) {
			featureList.createEl("li", { text: f });
		}

		container.createEl("p", { text: t.welcomeHint, cls: "opdoc-hint" });
		this.createNavButtons(container, false, true);
	}

	private renderInboxSetup(container: HTMLElement): void {
		const t = this.t();
		container.createEl("h3", { text: t.inboxTitle });
		container.createEl("p", { text: t.inboxDesc });

		const input = container.createEl("input", {
			type: "text",
			cls: "opdoc-input",
		});
		input.value = this.wizardData.inboxFolder ?? DEFAULT_SETTINGS.inboxFolder;
		input.placeholder = "Inbox";
		this.wizardData.inboxFolder = input.value;
		input.addEventListener("input", () => {
			this.wizardData.inboxFolder = input.value || DEFAULT_SETTINGS.inboxFolder;
		});

		container.createEl("p", { text: t.inboxHint, cls: "opdoc-hint" });
		this.createNavButtons(container, true, true);
	}

	private renderAIProvider(container: HTMLElement): void {
		const t = this.t();
		container.createEl("h3", { text: t.aiProviderTitle });
		container.createEl("p", { text: t.aiProviderDesc });

		const tableEl = container.createEl("table", { cls: "opdoc-comparison-table" });
		const thead = tableEl.createEl("thead");
		const headerRow = thead.createEl("tr");
		headerRow.createEl("th", { text: "" });
		headerRow.createEl("th", { text: "Ollama" });
		headerRow.createEl("th", { text: "OpenAI" });
		const tbody = tableEl.createEl("tbody");
		const costRow = tbody.createEl("tr");
		costRow.createEl("td", { text: t.costLabel });
		costRow.createEl("td", { text: t.costFree });
		costRow.createEl("td", { text: t.costPaid });
		const dataRow = tbody.createEl("tr");
		dataRow.createEl("td", { text: t.dataLabel });
		dataRow.createEl("td", { text: t.dataLocal });
		dataRow.createEl("td", { text: t.dataCloud });
		const reqRow = tbody.createEl("tr");
		reqRow.createEl("td", { text: t.requireLabel });
		reqRow.createEl("td", { text: t.requireOllama });
		reqRow.createEl("td", { text: t.requireApiKey });

		const ollamaRadio = this.createRadioOption(
			container,
			"ai-provider",
			this.wizardData.aiProvider !== AIProviderType.OPENAI,
			t.ollamaLabel,
			t.ollamaDesc,
		);

		const cloudRadio = this.createRadioOption(
			container,
			"ai-provider",
			this.wizardData.aiProvider === AIProviderType.OPENAI,
			t.cloudLabel,
			t.cloudDesc,
		);

		const providerConfigEl = container.createDiv();

		const renderProviderConfig = (provider: AIProviderType): void => {
			providerConfigEl.empty();
			if (provider === AIProviderType.OLLAMA) {
				this.wizardData.aiProvider = AIProviderType.OLLAMA;
				providerConfigEl.createEl("p", { text: t.ollamaEndpoint, cls: "opdoc-label" });
				const endpointInput = providerConfigEl.createEl("input", { type: "text" });
				endpointInput.value = this.wizardData.ollamaEndpoint ?? DEFAULT_SETTINGS.ollamaEndpoint;
				endpointInput.addEventListener("input", () => {
					this.wizardData.ollamaEndpoint = endpointInput.value;
				});
				void this.detectOllama(providerConfigEl, endpointInput.value);
			} else {
				this.wizardData.aiProvider = AIProviderType.OPENAI;
				this.wizardData.aiModel ??= "gpt-4o-mini";
				providerConfigEl.createEl("p", { text: t.openaiApiKey, cls: "opdoc-label" });
				const keyInput = providerConfigEl.createEl("input", { type: "password", cls: "opdoc-input" });
				keyInput.placeholder = "sk-...";
				keyInput.value = this.wizardData.openaiApiKey ?? "";
				keyInput.addEventListener("input", () => {
					this.wizardData.openaiApiKey = keyInput.value;
				});
				providerConfigEl.createEl("p", { text: t.openaiKeyHint, cls: "opdoc-hint" });
			}
		};

		renderProviderConfig(this.wizardData.aiProvider ?? DEFAULT_SETTINGS.aiProvider);
		ollamaRadio.addEventListener("change", () => renderProviderConfig(AIProviderType.OLLAMA));
		cloudRadio.addEventListener("change", () => renderProviderConfig(AIProviderType.OPENAI));

		this.createNavButtons(container, true, true);
	}

	private renderModelSelect(container: HTMLElement): void {
		const t = this.t();

		if (this.wizardData.aiProvider === AIProviderType.OLLAMA) {
			container.createEl("h3", { text: t.modelTitle });
			container.createEl("p", { text: t.modelDescOllama });

			if (this.detectedModels.length > 0) {
				const chatModels = this.detectedModels.filter((m) => !m.includes("embed"));
				if (chatModels.length > 0) {
					container.createEl("p", { text: t.installedModels, cls: "opdoc-label" });
					for (const model of chatModels) {
						const radio = this.createRadioOption(
							container,
							"ai-model",
							(this.wizardData.aiModel ?? DEFAULT_SETTINGS.aiModel) === model,
							model,
							"",
						);
						radio.addEventListener("change", () => {
							this.wizardData.aiModel = model;
						});
					}
				}
			}

			container.createEl("p", { text: t.modelOrType, cls: "opdoc-label" });
			const modelInput = container.createEl("input", { type: "text", cls: "opdoc-input" });
			modelInput.value = this.wizardData.aiModel ?? DEFAULT_SETTINGS.aiModel;
			modelInput.placeholder = "llama3.2, qwen2.5, mistral";
			modelInput.addEventListener("input", () => {
				this.wizardData.aiModel = modelInput.value;
			});

			if (this.detectedModels.length === 0) {
				container.createEl("p", {
					text: t.modelNotFound,
					cls: "opdoc-hint opdoc-status-warn",
				});
			}
		} else {
			container.createEl("h3", { text: t.modelTitle });
			container.createEl("p", { text: t.modelDescOpenai });

			const openaiModels = [
				{ id: "gpt-4o-mini", label: "GPT-4o Mini", desc: "Fast and affordable. Sufficient for most organizing tasks." },
				{ id: "gpt-4o", label: "GPT-4o", desc: "More accurate analysis. Good for complex documents." },
				{ id: "gpt-4.1-mini", label: "GPT-4.1 Mini", desc: "Latest model. Fast and accurate." },
			];

			for (const model of openaiModels) {
				const radio = this.createRadioOption(
					container,
					"openai-model",
					(this.wizardData.aiModel ?? "gpt-4o-mini") === model.id,
					model.label,
					model.desc,
				);
				radio.addEventListener("change", () => {
					this.wizardData.aiModel = model.id;
				});
			}
		}

		this.createNavButtons(container, true, true);
	}

	private renderEmbeddingModel(container: HTMLElement): void {
		const t = this.t();
		container.createEl("h3", { text: t.embTitle });
		container.createEl("p", { text: t.embDesc });

		const localRadio = this.createRadioOption(
			container,
			"emb-provider",
			this.wizardData.embeddingProvider !== EmbeddingProviderType.OPENAI_CLOUD,
			t.embLocalLabel,
			t.embLocalDesc,
		);

		const cloudRadio = this.createRadioOption(
			container,
			"emb-provider",
			this.wizardData.embeddingProvider === EmbeddingProviderType.OPENAI_CLOUD,
			t.embCloudLabel,
			t.embCloudDesc,
		);

		const embConfigEl = container.createDiv();
		localRadio.addEventListener("change", () => {
			this.wizardData.embeddingProvider = EmbeddingProviderType.OLLAMA_LOCAL;
			this.wizardData.embeddingModel = "nomic-embed-text";
			embConfigEl.empty();
		});
		cloudRadio.addEventListener("change", () => {
			this.wizardData.embeddingProvider = EmbeddingProviderType.OPENAI_CLOUD;
			this.wizardData.embeddingModel = "text-embedding-3-small";
			embConfigEl.empty();
			embConfigEl.createEl("p", { text: t.embCloudHint, cls: "opdoc-hint" });
		});

		this.createNavButtons(container, true, true);
	}

	private renderCustomInstructions(container: HTMLElement): void {
		const t = this.t();
		container.createEl("h3", { text: t.instructionsTitle });
		container.createEl("p", { text: t.instructionsDesc });

		const presets = [
			{ label: t.presetTech, value: "Programming and tech notes → Tech folder. Personal diary → Daily folder." },
			{ label: t.presetProject, value: "Group files by project name. Work-related → Work folder." },
			{ label: t.presetSkip, value: "" },
		];

		const presetContainer = container.createDiv({ cls: "opdoc-preset-row" });
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
		const t = this.t();
		container.createEl("h3", { text: t.completeTitle });
		container.createEl("p", { text: t.completeDesc });

		const sl = t.summaryLabels;
		const rows: Array<{ label: string; value: string }> = [
			{ label: sl.inbox, value: this.wizardData.inboxFolder ?? "Inbox" },
			{ label: sl.aiProvider, value: this.wizardData.aiProvider === AIProviderType.OPENAI ? "OpenAI" : "Ollama" },
			{ label: sl.aiModel, value: this.wizardData.aiModel ?? DEFAULT_SETTINGS.aiModel },
			{ label: sl.embModel, value: this.wizardData.embeddingModel ?? "nomic-embed-text" },
		];
		if (this.wizardData.customInstructions) {
			rows.push({ label: sl.instructions, value: this.wizardData.customInstructions.substring(0, 60) + "..." });
		}

		const summaryEl = container.createDiv({ cls: "opdoc-summary" });
		const table = summaryEl.createEl("table", { cls: "opdoc-summary-table" });
		for (const row of rows) {
			const tr = table.createEl("tr");
			tr.createEl("td", { text: row.label, cls: "opdoc-summary-label" });
			tr.createEl("td", { text: row.value });
		}

		const tipEl = container.createEl("div", { cls: "opdoc-tip" });
		tipEl.createEl("strong", { text: "Tip: " });
		tipEl.createSpan({ text: t.completeTip });

		const finishBtn = container.createEl("button", {
			text: t.completeStart,
			cls: "mod-cta",
		});
		finishBtn.addEventListener("click", () => {
			void this.finishOnboarding();
		});
	}

	private async finishOnboarding(): Promise<void> {
		Object.assign(this.plugin.settings, {
			...this.wizardData,
			onboardingComplete: true,
		});
		await this.plugin.saveSettings();
		this.close();
		this.plugin.initCore();
		new Notice(this.t().noticeActive);
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
		if (desc) {
			labelEl.createEl("br");
			labelEl.createEl("small", { text: desc });
		}
		return input;
	}

	private createNavButtons(container: HTMLElement, showBack: boolean, showNext: boolean): void {
		const t = this.t();
		const navEl = container.createDiv({ cls: "opdoc-nav" });

		if (showBack) {
			const backBtn = navEl.createEl("button", { text: t.back });
			backBtn.addEventListener("click", () => {
				this.currentStep--;
				this.renderStep();
			});
		}

		if (showNext && this.currentStep < t.stepNames.length - 1) {
			const nextBtn = navEl.createEl("button", { text: t.next, cls: "mod-cta" });
			nextBtn.addEventListener("click", () => {
				this.currentStep++;
				this.renderStep();
			});
		}
	}

	private async detectOllama(container: HTMLElement, endpoint: string): Promise<void> {
		const t = this.t();
		const statusEl = container.createDiv({ cls: "opdoc-ollama-status" });
		try {
			const resp = await requestUrl({
				url: `${endpoint}/api/tags`,
				method: "GET",
			});
			const data = resp.json as { models?: Array<{ name: string }> };
			this.detectedModels = data.models?.map((m) => m.name) ?? [];
			const modelNames = this.detectedModels.join(", ") || "none";
			statusEl.createEl("p", {
				text: t.ollamaSuccess + modelNames,
				cls: "opdoc-status-success",
			});
		} catch {
			this.detectedModels = [];
			statusEl.createEl("p", {
				text: t.ollamaFail,
				cls: "opdoc-status-warn",
			});
		}
	}
}
