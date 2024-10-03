import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
    // depending on your application, base can also be "/"
    base: '',
    plugins: [react(), viteTsconfigPaths()],
    server: {
        // this ensures that the browser opens upon server start
        open: true,
        // this sets a default port to 3000  
        port: 3000,
    },
    define: {
        global: 'globalThis',
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true
    }
})