import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
	...obsidianmd.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.js", "manifest.json"],
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: [".json"],
			},
		},
	},
	{
		plugins: {
			obsidianmd,
		},
		rules: {
			"obsidianmd/ui/sentence-case": [
				"error",
				{
					brands: [
						"OpDoc",
						"OpenAI",
						"Ollama",
						"Markdown",
						"Johnny.Decimal",
					],
					acronyms: ["API", "URL", "AI", "PARA", "MECE", "JSON"],
					enforceCamelCaseLower: true,
				},
			],
		},
	},
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
