import { type TAbstractFile, TFile, TFolder, type Vault } from "obsidian";

export function isMarkdownFile(file: TAbstractFile): file is TFile {
	return file instanceof TFile && file.extension === "md";
}

export function isInboxFile(file: TFile, inboxPath: string): boolean {
	return file.parent?.path === inboxPath;
}

export async function resolveNameCollision(
	vault: Vault,
	targetPath: string,
): Promise<string> {
	if (!vault.getAbstractFileByPath(targetPath)) {
		return targetPath;
	}

	const lastSlash = targetPath.lastIndexOf("/");
	const dir = targetPath.substring(0, lastSlash);
	const fullName = targetPath.substring(lastSlash + 1);
	const dotIndex = fullName.lastIndexOf(".");
	const baseName = dotIndex > 0 ? fullName.substring(0, dotIndex) : fullName;
	const ext = dotIndex > 0 ? fullName.substring(dotIndex) : "";

	for (let i = 1; i <= 100; i++) {
		const newPath = `${dir}/${baseName}_${i}${ext}`;
		if (!vault.getAbstractFileByPath(newPath)) {
			return newPath;
		}
	}

	const timestamp = new Date().toISOString().replace(/[-:T]/g, "").substring(0, 14);
	return `${dir}/${baseName}_${timestamp}${ext}`;
}

export async function ensureFolder(
	vault: Vault,
	folderPath: string,
): Promise<TFolder> {
	const existing = vault.getAbstractFileByPath(folderPath);
	if (existing instanceof TFolder) {
		return existing;
	}
	try {
		await vault.createFolder(folderPath);
	} catch {
		// Race condition: another process may have created it
		const afterCreate = vault.getAbstractFileByPath(folderPath);
		if (afterCreate instanceof TFolder) return afterCreate;
		throw new Error(`Failed to create folder: ${folderPath}`);
	}
	const created = vault.getAbstractFileByPath(folderPath);
	if (created instanceof TFolder) return created;
	throw new Error(`Failed to create folder: ${folderPath}`);
}

export function resolveToExistingFolder(
	targetFolder: string,
	knownFolders: string[],
): string {
	if (knownFolders.includes(targetFolder)) return targetFolder;

	const lower = targetFolder.toLowerCase();
	const exactIgnoreCase = knownFolders.find((f) => f.toLowerCase() === lower);
	if (exactIgnoreCase) return exactIgnoreCase;

	const targetSegments = targetFolder.split("/");
	for (const folder of knownFolders) {
		const folderSegments = folder.split("/");
		if (folderSegments.length !== targetSegments.length) continue;
		if (folderSegments.every((s, i) => s.toLowerCase() === (targetSegments[i] ?? "").toLowerCase())) {
			return folder;
		}
	}

	return targetFolder;
}

export function getFilesInFolder(vault: Vault, folderPath: string): TFile[] {
	const folder = vault.getAbstractFileByPath(folderPath);
	if (!(folder instanceof TFolder)) return [];

	return folder.children.filter(isMarkdownFile);
}
