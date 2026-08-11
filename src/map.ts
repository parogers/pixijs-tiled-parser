
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
