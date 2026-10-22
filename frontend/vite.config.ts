import fs from "fs";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// React + Tailwind v4 + shadcn (Base UI). Django carga cada entrada con {% vite_assets %}.
const outputDir = process.env.VITE_OUTPUT_DIR ?? "dist";
// Cada pantalla de Administración agrega `src/admin-<seccion>.tsx` y queda registrada sola.
const adminEntries = Object.fromEntries(
  fs
    .readdirSync(path.resolve(import.meta.dirname, "src"))
    .filter((file) => /^admin-[a-z0-9-]+\.tsx$/.test(file))
    .map((file) => [file.replace(/\.tsx$/, ""), `src/${file}`]),
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  base: "/static/frontend/",
  build: {
    outDir: outputDir,
    emptyOutDir: true,
    manifest: true,
    rolldownOptions: {
      input: {
        inicio: "src/inicio.tsx",
        cuenta: "src/cuenta.tsx",
        ...adminEntries,
      },
    },
  },
});
