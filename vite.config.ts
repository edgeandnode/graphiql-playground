import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src", "index.tsx"),
      name: "GraphProtocolGraphiQL",
      fileName: (format) => `graphprotocol-graphiql.${format}.js`,
    },
    rollupOptions: {
      output: {
        /** prevent code-splitting */
        manualChunks: () => "_.js",
      },
    },
  },
});
