import react from "@vitejs/plugin-react";
import * as path from "node:path";
import autoExternal from "rollup-plugin-auto-external";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src", "index.tsx"),
      name: "GraphiQLPlayground",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      plugins: [autoExternal()],
    },
  },
});
