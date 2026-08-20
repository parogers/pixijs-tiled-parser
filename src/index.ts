
import * as PIXI from 'pixi.js';
import { loadTiledMap } from './tiled-parsing';
import { type TiledMap } from './map';
export {
    getTiledGridLayers,
    getTiledObjectGroups,
    getTiledGroups,
    getTiledObjects,
    findTiledGridLayer,
} from './map';

export { loadTiledMap, TiledMap }


const TILED_MAP_LOADER = {
    extension: PIXI.ExtensionType.Asset,
    cache: {
        test(data: any): boolean {
            return (
                data &&
                typeof data === 'object' &&
                data['rows'] !== undefined &&
                data['cols'] !== undefined
            );
        },
        getCacheableAssets(keys: string[], asset: TiledMap) {
            const result: any = {};
            keys.forEach(key => {
                result[key] = asset;
            })
            asset.tilesetRefs.forEach(tilesetRef => {
                const spritesheet = tilesetRef.tileset?.spritesheet;
                if (!spritesheet) {
                    return;
                }
                Object.entries(spritesheet.textures).forEach(([key, value]) => {
                    result[key] = value;
                });
            });
            return result;
        },
    },
    loader: {
        id: 'tiledmap',
        extension: {
            type: PIXI.ExtensionType.LoadParser,
            priority: PIXI.LoaderParserPriority.Normal,
            name: 'tiledMapLoader',
        },
        test(url: string) {
            return url.endsWith('.tmx');
        },
        async load(url: string) {
            const map = await loadTiledMap(url)
            return map;
        },

    },
};


export function makeTiledParserExtension() {
    // TODO - placeholder
    // Eventually this function will support config options
    return TILED_MAP_LOADER;
}
