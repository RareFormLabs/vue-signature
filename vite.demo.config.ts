import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
  root: "demo",
  base: "/vue-signature/",
  plugins: [vue(), tailwindcss()],
  build: {
    outDir: "../demo-dist",
    emptyOutDir: true,
  },
});
