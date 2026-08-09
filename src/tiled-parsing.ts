
import * as PIXI from 'pixi.js';


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
    offsetX: number;
    offsetY: number;
    tilesetRefs: TilesetRef[];
    groups: TiledMap[];
    children: TiledChild[];
    properties: { [name: string]: any };
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
    texture: PIXI.Texture|null;
}


export type TiledObject = {
    name: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    facing: number;
    properties: { [name: string]: any };
}


function isTiledGridLayer(data: unknown): data is TiledGridLayer {
    const layer = data as TiledGridLayer;
    return !!(layer && layer.grid !== undefined);
}


function isTiledObjectGroup(data: unknown): data is TiledObjectGroup {
    const group = data as TiledObjectGroup;
    return !!(group && group.objects !== undefined);
}


function getAttribute(node: Element, name: string): string {
    const value = node.getAttribute(name);
    if (!value) {
        throw Error(`missing attribute: ${name}`);
    }
    return value;
}

function getIntAttribute(node: Element, name: string): number {
    const value = getAttribute(node, name);
    const numeric = +value;
    if (isNaN(numeric)) {
        throw Error(`attribute is not a number: ${value}`);
    }
    return numeric;
}


function parseTileset(text: string): Tileset {
    const data = new DOMParser().parseFromString(text, 'text/xml');
    const tileset = data.documentElement;
    if (data.documentElement?.tagName === 'parsererror') {
        console.error('unable to parse tileset:', text);
        throw Error('unable to parse tileset');
    }
    const tileWidth = getIntAttribute(tileset, 'tilewidth');
    const tileHeight = getIntAttribute(tileset, 'tileheight');
    const spacing = getIntAttribute(tileset, 'spacing');
    const margin = getIntAttribute(tileset, 'margin');
    const columns = getIntAttribute(tileset, 'columns');
    const tileCount = getIntAttribute(tileset, 'tilecount');
    const image = tileset.getElementsByTagName('image')[0];
    return {
        tileWidth: tileWidth,
        tileHeight: tileHeight,
        spacing: spacing,
        margin: margin,
        columns: columns,
        tileCount: tileCount,
        source: getAttribute(image, 'source'),
        sourceWidth: getIntAttribute(image, 'width'),
        sourceHeight: getIntAttribute(image, 'height'),
        texture: null, // filled in later
    };
}

function parseGrid(text: string, width: number, height: number): number[][] {
    const grid = text.trim().split('\n').map(line => {
        return line.split(',').filter(value => !!value).map(value => +value);
    });
    return grid;
}

function parseObjectProperties(node: Element): { [key: string]: string } {
    return Object.fromEntries(
        Array.from(node.getElementsByTagName('property'))
            .map(p => [p.getAttribute('name'), p.getAttribute('value')])
    );
}

function parseTiledMap(doc: Element, baseURL: string): TiledMap {
    if (doc.nodeName !== 'map' && doc.nodeName !== 'group') {
        console.error('file is not a tiled map, doc node is', doc.nodeName);
        throw Error('file is not a tiled map');
    }
    const map: TiledMap = {
        name: doc.getAttribute('name') ?? '',
        cols: getIntAttribute(doc, 'width'),
        rows: getIntAttribute(doc, 'height'),
        offsetX: 0,
        offsetY: 0,
        tilesetRefs: [],
        groups: [],
        properties: [],
        children: [],
    };
    Array.from(doc.children).forEach(child => {
        if (child.nodeName === 'tileset') {
            const src = getAttribute(child, 'source');
            map.tilesetRefs.push({
                src: src,
                firstGID: getIntAttribute(child, 'firstgid'),
                tileset: null, // filled in later
            });
        } else if (child.nodeName === 'layer') {
            const width = getIntAttribute(child, 'width');
            const height = getIntAttribute(child, 'height');
            const layer = {
                name: child.getAttribute('name') ?? '',
                grid: parseGrid(child.children[0].textContent, width, height),
            };
            map.children.push(layer);
        } else if (child.tagName === 'objectgroup') {
            const objects = Array.from(child.children).map(data => {
                return {
                    name: data.getAttribute('name') ?? '',
                    type: data.getAttribute('type') ?? '',
                    x: getIntAttribute(data, 'x'),
                    y: getIntAttribute(data, 'y'),
                    width: getIntAttribute(data, 'width'),
                    height: getIntAttribute(data, 'height'),
                    facing: (getIntAttribute(data, 'gid') & (2**31)) ? -1 : 1,
                    properties: parseObjectProperties(data),
                };
            });
            const layer = {
                name: child.getAttribute('name') ?? '',
                objects: objects,
            };
            map.children.push(layer);
        } else if (child.tagName === 'group') {
            const group = parseTiledMap(child, baseURL);
            map.groups.push(group);
            map.children.push(group);
        } else if (child.tagName === 'properties') {
            map.properties = parseObjectProperties(child);
        }
    });
    return map;
}


function sliceGrid(grid: number[][], startRow: number, endRow: number, startCol: number, endCol: number) {
    return grid.slice(startRow, endRow+1).map(row => row.slice(startCol, endCol+1));
}


function getBaseURL(url: string): string {
    return url.slice(0, url.lastIndexOf('/') + 1);
}


export async function loadTiledMap(url: string): Promise<TiledMap> {
    const response = await fetch(url);
    const mapText = await response.text();
    const baseURL = getBaseURL(url);

    const data = new DOMParser().parseFromString(mapText, 'text/xml');
    if (data.documentElement?.tagName === 'parsererror') {
        console.error('unable to parse tiled map:', mapText);
        throw Error('unable to parse tiled map');
    }
    const map = parseTiledMap(data.documentElement, baseURL);
    // Backfill the tileset definitions
    for (let tilesetRef of map.tilesetRefs) {
        try {
            const tilesetText = await PIXI.Assets.load({
                src: baseURL + tilesetRef.src,
                alias: 'tiles',
                parser: 'loadTxt',
            });
            const tileset = parseTileset(tilesetText);
            tilesetRef.tileset = tileset;
            tilesetRef.tileset.texture = await PIXI.Assets.load(baseURL + tileset.source);
        } catch(error) {
            console.error('error parsing tileset:', tilesetRef.src);
            throw error;
        }
    }
    for (let sub of map.groups) {
        let startRow = map.rows;
        let startCol = map.cols;
        let endRow = 0;
        let endCol = 0;
        const marginTop = sub.properties['margin-top'] ?? 0;
        const marginBottom = sub.properties['margin-bottom'] ?? 0;
        for (let child of sub.children) {
            if (isTiledGridLayer(child)) {
                for (let row = 0; row < map.rows; row++) {
                    for (let col = 0; col < map.cols; col++) {
                        if (child.grid[row][col]) {
                            startRow = Math.min(startRow, row);
                            startCol = Math.min(startCol, col);
                            endRow = Math.max(endRow, row);
                            endCol = Math.max(endCol, col);
                        }
                    }
                }
            }
        }
        startRow = Math.max(startRow - marginTop, 0);
        endRow = Math.min(endRow + marginBottom, map.rows-1);
        const offsetX = startCol*(map.tilesetRefs[0].tileset?.tileWidth ?? 0);
        const offsetY = startRow*(map.tilesetRefs[0].tileset?.tileHeight ?? 0);
        sub.offsetX = offsetX;
        sub.offsetY = offsetY;
        for (let child of sub.children) {
            if (isTiledGridLayer(child)) {
                child.grid = sliceGrid(child.grid, startRow, endRow, startCol, endCol);
            }
            if (isTiledObjectGroup(child)) {
                for (let obj of child.objects) {
                    obj.x -= offsetX;
                    obj.y -= offsetY;
                }
            }
        }
    }
    return map;
}


// export function makeSpritesheetFromGrid(tileset: Tileset, tileNamePrefix: string) {
//     const tiles = {};
//     const rows = (tileset.tileCount / tileset.columns)|0 + 1;
//     for (let row = 0; row < rows; row++) {
//         for (let col = 0; col < tileset.columns; col++) {
//             const x = tileset.margin + tileset.spacing*col + tileset.tileWidth*col;
//             const y = tileset.margin + tileset.spacing*row + tileset.tileHeight*row;
//             const index = Object.keys(tiles).length;
//             if (index >= tileset.tileCount) {
//                 break;
//             }
//             const name = tileNamePrefix + index;
//             tiles[name] = {
//                 frame: {
//                     x: x,
//                     y: y,
//                     w: tileset.tileWidth,
//                     h: tileset.tileHeight,
//                 },
//                 spriteSourceSize: {
//                     x: x,
//                     y: y,
//                     w: tileset.tileWidth,
//                     h: tileset.tileHeight,
//                 },
//                 sourceSize: {
//                     w: tileset.tileWidth,
//                     h: tileset.tileHeight,
//                 },
//                 anchor: {
//                     x: 0,
//                     y: 0,
//                 }
//             };
//         }
//     }
//     const sheet = {
//         frames: tiles,
//         meta: {
//             image: tileset.source,
//             format: 'RGBA8888',
//             size: {
//                 w: tileset.sourceWidth,
//                 h: tileset.sourceHeight,
//             },
//             scale: 1,
//         },
//     };
//     return sheet;
// }
