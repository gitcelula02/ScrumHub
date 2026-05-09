import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "error",

      // AC13.2: Architectural Violations
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*", "!@/features/*/types"],
              message:
                "Architectural Violation: Do not import from feature internals. Use the feature barrel export or shared atoms.",
            },
          ],
        },
      ],

      // AC13.1 & AC13.3: FRONTEND_STYLING.md Anti-patterns Enforcement
      // Note: We use no-restricted-syntax to catch common styling violations in className and style attributes
      "no-restricted-syntax": [
        "error",
        {
          // Prevent inline hex styles: style={{ backgroundColor: '#fff' }}
          selector:
            "JSXAttribute[name.name='style'] Property[key.name=/color/i] Literal[value=/^#/]",
          message:
            "Styling Violation (FRONTEND_STYLING.md): No inline hex styles allowed. Use oklch CSS variables.",
        },
        {
          // Prevent Tailwind anti-patterns: bg-gradient, shadow-2xl, rounded-full, light mode colors
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(bg-gradient|shadow-2xl|rounded-full|bg-white|text-gray-)/]",
          message:
            "Styling Violation (FRONTEND_STYLING.md): Anti-pattern classes detected (bg-gradient, shadow-2xl, rounded-full, light mode colors).",
        },
      ],
    },
  },
  eslintPluginPrettier,
);
