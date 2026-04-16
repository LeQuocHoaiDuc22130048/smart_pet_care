import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import terminal from 'vite-plugin-terminal';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        // Forward browser console.log/warn/error → terminal
        terminal({
            console: 'terminal',   // 'terminal' | 'both' (both = terminal + browser)
            output: ['terminal'],  // where to output
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
