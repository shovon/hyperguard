import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
	// Only lint the hand-written source for now.
	{ files: ["lib.ts"] },

	// Ignore generated and vendored output.
	{ ignores: ["dist/**", "node_modules/**", "example/**", "scripts/**"] },

	js.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,

	{
		languageOptions: {
			parserOptions: {
				// Let typescript-eslint find the right tsconfig automatically
				// so type-aware rules work.
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	}
);
