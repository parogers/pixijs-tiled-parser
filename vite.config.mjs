
import { defineConfig } from 'vite'
import dts from 'unplugin-dts/vite'

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'pixijs-tiled-parser',
            fileName: 'pixijs-tiled-parser',
        },
        rollupOptions: {
            external: ['pixi.js'],
            output: {
                globals: {
                    'pixi.js': 'PIXI',
                },
            },
        },
    },
    plugins: [
        dts(),
    ],
})
