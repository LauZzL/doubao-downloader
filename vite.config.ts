import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import tailwindcss from "@tailwindcss/vite";
import copy from "rollup-plugin-copy";
import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    monkey({
      entry: "src/main.tsx",
      userscript: {
        name: "豆包下载器",
        description: "豆包AI生图去水印批量下载!",
        icon: "https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/chat/static/image/logo-icon-white-bg.72df0b1a.png",
        namespace: "npm/vite-plugin-monkey",
        match: ["https://www.doubao.com/*"],
      },
    }),
    copy({
      targets: [
        { src: "manifest.json", dest: "dist" },
        { src: "popup.html", dest: "dist" },
        { src: "src/assets/logo.png", dest: "dist" },
      ],
      hook: "writeBundle",
      overwrite: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD_TIME__: JSON.stringify(new Date().toLocaleString()),
  }
});
