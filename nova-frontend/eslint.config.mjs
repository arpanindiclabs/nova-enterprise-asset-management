/* eslint-disable */

// import { dirname } from "path";
// import { fileURLToPath } from "url";
// import { FlatCompat } from "@eslint/eslintrc";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// const eslintConfig = [
//   // Remove or comment out extensions to stop applying base rule sets
//   // ...compat.extends("next/core-web-vitals", "next/typescript"),

//   {
//     files: ["**/*.{ts,tsx,js,jsx}"],
//     rules: {
//       // Wildcard disable
//       "all": "off", // This doesn't work in ESLint, so we explicitly disable most common rules below
//       "@typescript-eslint/no-unused-vars": "off",
//       "@typescript-eslint/no-explicit-any": "off",
//       "react-hooks/exhaustive-deps": "off",
//       "react/no-unescaped-entities": "off",
//       "no-unused-vars": "off",
//       "no-console": "off",
//       "no-undef": "off",
//       "no-redeclare": "off",
//       "no-empty": "off",
//       "no-mixed-spaces-and-tabs": "off",
//       // Add others here as needed
//     },
//   },
// ];

// export default eslintConfig;
// next.config.js
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Disables ESLint from blocking builds
  },
};

module.exports = nextConfig;