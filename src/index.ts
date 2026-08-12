
import * as PIXI from 'pixi.js';
import { loadTiledMap } from './tiled-parsing';
import {
    type TiledMap,
    getTiledGridLayers,
    getTiledObjectGroups,
    getTiledGroups,
    getTiledObjects,
} from './map';

export {
    TiledMap,
    loadTiledMap,
    getTiledGridLayers,
    getTiledObjectGroups,
    getTiledGroups,
    getTiledObjects,
}


const TILED_MAP_LOADER = {
    id: 'pixijs-tiled-parser/map-loader',
    extension: {
        type: PIXI.ExtensionType.LoadParser,
        name: 'pixijs-tiled-parser-map-loader',
    },
    getCacheableAssets(keys: string[], asset: TiledMap) {
        const result = {};
        keys.forEach(key => {
            result[key] = asset;
        })
        asset.tilesetRefs.forEach(tilesetRef => {
            Object.entries(tilesetRef.tileset.spritesheet.textures).forEach(([key, value]) => {
                result[key] = value;
            });
        });
        return result;
    },
    test(url: string) {
        return url.endsWith('.tmx');
    },
    async load(url: string) {
        const map = await loadTiledMap(url)
        return map;
    },
};


export function makeTiledParserExtension() {
    // TODO - placeholder
    // Eventually this function will support config options
    return TILED_MAP_LOADER;
}
