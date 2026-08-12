
import * as PIXI from 'pixi.js';


export type TiledProperties = { [name: string]: any };


export type TiledGridLayer = {
    name: string;
    grid: number[][];
};


export type TiledObjectGroup = {
    name: string;
    objects: TiledObject[];
};


export type TiledGroup = {
    name: string;
    children: TiledChild[];
}


export type TiledChild = TiledGridLayer | TiledObjectGroup | TiledGroup;


export type TiledMap = {
    name: string;
    rows: number;
    cols: number;
    tileWidth: number;
    tileHeight: number;
    offsetX: number;
    offsetY: number;
    tilesetRefs: TilesetRef[];
    children: TiledChild[];
    properties: TiledProperties;
}


export type TilesetRef = {
    src: string;
    firstGID: number;
    tileset: Tileset|null;
}


export type Tileset = {
    tileWidth: number;
    tileHeight: number;
    spacing: number;
    margin: number;
    columns: number;
    tileCount: number;
    source: string;
    sourceWidth: number;
    sourceHeight: number;
    spritesheet: PIXI.Spritesheet | null;
}


export type TiledObject = {
    name: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    flippedX: boolean;
    properties: TiledProperties;
}


export function isTiledGridLayer(data: unknown): data is TiledGridLayer {
    const layer = data as TiledGridLayer;
    return !!(layer && layer.grid !== undefined);
}


export function isTiledObjectGroup(data: unknown): data is TiledObjectGroup {
    const group = data as TiledObjectGroup;
    return !!(group && group.objects !== undefined);
}


export function isTiledGroup(data: unknown): data is TiledGroup {
    const group = data as TiledGroup;
    return !!(group && group.children !== undefined && group.name !== undefined);
}


export function getTiledGridLayers(map: TiledMap): TiledGridLayer[] {
    return map.children.filter(isTiledGridLayer);
}


export function getTiledObjectGroups(map: TiledMap): TiledObjectGroup[] {
    return map.children.filter(isTiledObjectGroup);
}


export function getTiledGroups(map: TiledMap): TiledGroup[] {
    return map.children.filter(isTiledGroup);
}


export function getTiledObjects(map: TiledMap): TiledObject[] {
    return map.children.filter(isTiledObjectGroup).flatMap(group => group.objects);
}


export function getTiledMapGrid(map: TiledMap, layer: TiledGrid): string[][] {
    function findTilesetRef(index: number): TilesetRef|null {
        const ref = map.tilesetRefs.find(ref => {
            return index >= ref.firstGID && index <= ref.firstGID + ref.tileset.tileCount - 1;
        });
        return ref ?? null;
    }
    return layer.grid.map(
        row => (
            row.map(index => {
                if (index === 0) {
                    return null;
                }
                const ref = findTilesetRef(index);
                if (!ref) {
                    throw Error(`invalid grid index: ${index}`);
                }
                return getTilesetPrefix(ref.tileset) + (index - ref.firstGID);
            })
        )
    );
}


export function getTilesetPrefix(tileset: Tileset): string {
    function getPath(url: string): string {
        try {
             const path = new URL(url).pathname;
             if (path) {
                 return path;
             }
        } catch(error: any) {
            if (error.name !== 'TypeError') {
                throw error;
            }
        }
        return url;
    }
    function removeExtension(fileName: string): string {
        const index = fileName.lastIndexOf('.');
        return fileName.slice(0, index);
    }
    return getPath(removeExtension(tileset.source)) + '-';
}
