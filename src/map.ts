
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


export async function loadSpritesheetFromTileset(
    tileset: Tileset,
    tileNamePrefix: string,
): PIXI.SpritesheetData {
    const data = makeSpritesheetFromTileset(tileset, tileNamePrefix);
    const texture = await PIXI.Assets.load(tileset.source);
    const sheet = new PIXI.Spritesheet(texture, data);
    await sheet.parse();
    return sheet;
}


export function makeSpritesheetFromTileset(
    tileset: Tileset,
    tileNamePrefix: string,
): PIXI.SpritesheetData {
    const tiles: any = {};
    const rows = (tileset.tileCount / tileset.columns)|0 + 1;
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < tileset.columns; col++) {
            const x = tileset.margin + tileset.spacing*col + tileset.tileWidth*col;
            const y = tileset.margin + tileset.spacing*row + tileset.tileHeight*row;
            const index = Object.keys(tiles).length;
            if (index >= tileset.tileCount) {
                break;
            }
            const name = tileNamePrefix + index;
            tiles[name] = {
                frame: {
                    x: x,
                    y: y,
                    w: tileset.tileWidth,
                    h: tileset.tileHeight,
                },
                spriteSourceSize: {
                    x: x,
                    y: y,
                    w: tileset.tileWidth,
                    h: tileset.tileHeight,
                },
                sourceSize: {
                    w: tileset.tileWidth,
                    h: tileset.tileHeight,
                },
                anchor: {
                    x: 0,
                    y: 0,
                }
            };
        }
    }
    const sheet = {
        frames: tiles,
        meta: {
            image: tileset.source,
            format: 'RGBA8888',
            size: {
                w: tileset.sourceWidth,
                h: tileset.sourceHeight,
            },
            scale: 1,
        },
    };
    return sheet;
}
