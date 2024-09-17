import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
            },
        },
    },
    publicDir: 'public', // Ensures assets in public/ are copied to build
});
