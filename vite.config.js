import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		visualizer({
			filename: "dist/stats.html",
			title: "Bundle Visualizer",
			brotliSize: true,
			gzipSize: true,
			template: "treemap",
		}),
	],
});
