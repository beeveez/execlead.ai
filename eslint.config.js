import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginUnusedImports from "eslint-plugin-unused-imports";

export default [
  {
    files: [
      "src/components/**/*.{js,mjs,cjs,jsx}",
      "src/pages/**/*.{js,mjs,cjs,jsx}",
      "src/Layout.jsx",
    ],
    ignores: ["src/lib/**/*", "src/components/ui/**/*"],
    ...pluginJs.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "unused-imports": pluginUnusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": [
        "error",
        { ignore: ["cmdk-input-wrapper", "toast-close"] },
      ],
      "react-hooks/rules-of-hooks": "error",

      // ── Interactive Experience Standard™ — Legacy Component Enforcement ──
      // Reject deprecated interactive component patterns.
      // All dashboard cards, metrics, widgets, and progress bars must use
      // the shared Interactive* components from @/components/shared.
      "no-restricted-syntax": [
        "warn",
        {
          selector: "JSXOpeningElement[name.name='MetricCard']",
          message: "MetricCard is deprecated — use InteractiveMetric™ from @/components/shared for Universal Metric Intelligence™ drill-down.",
        },
        {
          selector: "JSXOpeningElement[name.name='ProgressCard']",
          message: "ProgressCard is deprecated — use InteractiveProgress™ from @/components/shared.",
        },
        {
          selector: "JSXOpeningElement[name.name='WidgetCard']",
          message: "WidgetCard is deprecated — use InteractiveWidget™ from @/components/shared.",
        },
        {
          selector: "JSXOpeningElement[name.name='InsightCard']",
          message: "InsightCard is deprecated — use InteractiveInsight™ from @/components/shared.",
        },
        {
          selector: "JSXOpeningElement[name.name='RoadmapCard']",
          message: "RoadmapCard is deprecated — use InteractiveRoadmap™ from @/components/shared.",
        },
        {
          selector: "JSXOpeningElement[name.name='ArticleCard']",
          message: "ArticleCard is deprecated — use InteractiveArticle™ from @/components/shared.",
        },
      ],
    },
  },
];