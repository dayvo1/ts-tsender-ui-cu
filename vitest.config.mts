import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
       environment: 'jsdom',
       exclude: ['**/node_modules/**', '**/test/**', 'playwright-reprt/**', 'test-results/**'],
       deps: {
            inline: ['wagmi', '@wagmi/core']
       } 
    },
})