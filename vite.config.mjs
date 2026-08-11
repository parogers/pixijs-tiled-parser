
import { defineConfig } from 'vite'
import { playwright } from '@vitest/browser-playwright';
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
    test: {
         browser: {
             ui: false,
             provider: playwright(),
             enabled: true,
             instances: [
                 {
                     browser: 'chromium',
                     viewport: {
                         width: 600,
                         height: 400,
                     },
                 }
             ],
         },
     },
})
