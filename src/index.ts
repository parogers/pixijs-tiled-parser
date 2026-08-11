
import * as PIXI from 'pixi.js';
import { loadTiledMap } from './tiled-parsing';
import { makeSpritesheetFromTileset, loadSpritesheetFromTileset } from './map';

export {
    loadTiledMap,
    makeSpritesheetFromTileset,
    loadSpritesheetFromTileset,
}

export const TILED_MAP_LOADER = {
    id: 'pixijs-tiled-parser/map-loader',
    extension: {
        type: PIXI.ExtensionType.LoadParser,
        name: 'pixijs-tiled-parser-map-loader',
    },
    test(url: string) {
        return url.endsWith('.tmx');
    },
    async load(url: string) {
        const map = await loadTiledMap(url)
        return map;
    },
};
