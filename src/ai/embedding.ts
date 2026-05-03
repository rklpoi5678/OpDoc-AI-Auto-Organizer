import type { Vault } from "obsidian";
import type { EmbeddingProvider } from "./provider";
import { getFilesInFolder } from "../utils/helpers";

export class EmbeddingService {
	private provider: EmbeddingProvider;
	private vault: Vault;

	constructor(provider: EmbeddingProvider, vault: Vault) {
		this.provider = provider;
		this.vault = vault;
	}

	async generateFolderText(folderPath: string): Promise<string> {
		const files = getFilesInFolder(this.vault, folderPath);
		const parts: string[] = [folderPath];

		for (const file of files.slice(0, 10)) {
			parts.push(file.basename);
			try {
				const content = await this.vault.read(file);
				const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);
				if (frontmatter?.[1]) {
					const tags = frontmatter[1].match(/tags:\s*\[(.*?)\]/);
					if (tags?.[1]) parts.push(tags[1]);
				}
			} catch {
				// skip unreadable files
			}
		}

		return parts.join(" ");
	}

	async embedFolder(folderPath: string): Promise<number[]> {
		const text = await this.generateFolderText(folderPath);
		return this.provider.getEmbedding(text);
	}
}
