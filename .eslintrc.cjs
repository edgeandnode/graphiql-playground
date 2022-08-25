module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["@edgeandnode"],
  plugins: ["testing-library"],
  rules: {
    "testing-library/no-unnecessary-act": ["error", { isStrict: true }],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parserOptions: {
        project: require.resolve("./tsconfig.eslint.json"),
      },
    },
  ],
};
