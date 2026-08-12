
import * as PIXI from 'pixi.js';

import {
    type TiledMap,
    type TiledGroup,
    type TiledProperties,
    type TilesetRef,
    type Tileset,
    type TiledChild,
    getTilesetPrefix,
} from './map';


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


function parseTileset(text: string, baseURL: string): Tileset {
    const data = new DOMParser().parseFromString(text, 'text/xml');
    const tileset = data.documentElement;
    if (data.documentElement?.tagName === 'parsererror') {
        console.error('unable to parse tileset:', text);
        throw Error('unable to parse tileset');
    }
    if (data.documentElement?.tagName !== 'tileset') {
        console.error('expecting tileset tag but got:', data.documentElement?.tagName);
        throw Error('not a tileset file');
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
        source: baseURL + getAttribute(image, 'source'),
        sourceWidth: getIntAttribute(image, 'width'),
        sourceHeight: getIntAttribute(image, 'height'),
        spritesheet: null,
    };
}

function parseGrid(text: string, width: number, height: number): number[][] {
    const grid = text.trim().split('\n').map(line => {
        return line.split(',').filter(value => !!value).map(value => +value);
    });
    return grid;
}

function parseObjectProperties(node: Element): TiledProperties {
    return Object.fromEntries(
        Array.from(node.getElementsByTagName('property'))
            .map(p => [p.getAttribute('name'), p.getAttribute('value')])
    );
}


export async function loadSpritesheetFromTileset(
    tileset: Tileset,
): Promise<PIXI.Spritesheet> {
    const prefix = getTilesetPrefix(tileset);
    const data = makeSpritesheetFromTileset(tileset, prefix);
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
            const index = Object.keys(tiles).length+1;
            if (index > tileset.tileCount) {
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


async function loadTileset(url: string): Promise<Tileset> {
    const tilesetText = await (await fetch(url)).text();
    const tileset = parseTileset(tilesetText, getBaseURL(url));
    const sheet = await loadSpritesheetFromTileset(tileset);
    tileset.spritesheet = sheet;
    return tileset;
}


async function parseChildren(doc: Element, baseURL: string): Promise<{
    tilesetRefs: TilesetRef[],
    children: TiledChild[],
    properties: TiledProperties,
}> {
    const tilesetRefs = [];
    const children = [];
    const properties: TiledProperties = {};
    for (let child of doc.children) {
        if (child.nodeName === 'tileset') {
            const src = baseURL + getAttribute(child, 'source');
            const tileset = await loadTileset(src);
            tilesetRefs.push({
                src: src,
                firstGID: getIntAttribute(child, 'firstgid'),
                tileset: tileset,
            });
        } else if (child.nodeName === 'layer') {
            const width = getIntAttribute(child, 'width');
            const height = getIntAttribute(child, 'height');
            const layer = {
                name: child.getAttribute('name') ?? '',
                grid: parseGrid(child.children[0].textContent, width, height),
            };
            children.push(layer);
        } else if (child.tagName === 'objectgroup') {
            const objects = Array.from(child.children).map(data => {
                return {
                    name: data.getAttribute('name') ?? '',
                    type: data.getAttribute('type') ?? '',
                    x: getIntAttribute(data, 'x'),
                    y: getIntAttribute(data, 'y'),
                    width: getIntAttribute(data, 'width'),
                    height: getIntAttribute(data, 'height'),
                    flippedX: !!(getIntAttribute(data, 'gid') & (2**31)),
                    properties: parseObjectProperties(data),
                };
            });
            const layer = {
                name: child.getAttribute('name') ?? '',
                objects: objects,
            };
            children.push(layer);
        } else if (child.tagName === 'group') {
            const group = await parseGroup(child, baseURL);
            children.push(group);
        } else if (child.tagName === 'properties') {
            Object.entries(parseObjectProperties(child)).forEach(([key, value]) => {
                properties[key] = value;
            });
        }
    }
    return {
        tilesetRefs,
        children,
        properties,
    };
}


async function parseGroup(doc: Element, baseURL: string): Promise<TiledGroup> {
    const { children } = await parseChildren(doc, baseURL);
    const group: TiledGroup = {
        name: doc.getAttribute('name') ?? '',
        children: children,
    };
    return group;
}


async function parseTiledMap(doc: Element, baseURL: string): Promise<TiledMap> {
    if (doc.nodeName !== 'map' && doc.nodeName !== 'group') {
        console.error('file is not a tiled map, doc node is', doc.nodeName);
        throw Error('file is not a tiled map');
    }
    const { tilesetRefs, children, properties } = await parseChildren(doc, baseURL);
    const map: TiledMap = {
        name: doc.getAttribute('name') ?? '',
        cols: getIntAttribute(doc, 'width'),
        rows: getIntAttribute(doc, 'height'),
        tileWidth: getIntAttribute(doc, 'tilewidth'),
        tileHeight: getIntAttribute(doc, 'tileheight'),
        offsetX: 0,
        offsetY: 0,
        tilesetRefs: tilesetRefs,
        properties: properties,
        children: children,
    };
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
    const map = await parseTiledMap(data.documentElement, baseURL);
    // for (let sub of map.groups) {
    //     let startRow = map.rows;
    //     let startCol = map.cols;
    //     let endRow = 0;
    //     let endCol = 0;
    //     const marginTop = sub.properties['margin-top'] ?? 0;
    //     const marginBottom = sub.properties['margin-bottom'] ?? 0;
    //     for (let child of sub.children) {
    //         if (isTiledGridLayer(child)) {
    //             for (let row = 0; row < map.rows; row++) {
    //                 for (let col = 0; col < map.cols; col++) {
    //                     if (child.grid[row][col]) {
    //                         startRow = Math.min(startRow, row);
    //                         startCol = Math.min(startCol, col);
    //                         endRow = Math.max(endRow, row);
    //                         endCol = Math.max(endCol, col);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     startRow = Math.max(startRow - marginTop, 0);
    //     endRow = Math.min(endRow + marginBottom, map.rows-1);
    //     const offsetX = startCol*map.tileWidth;
    //     const offsetY = startRow*map.tileHeight;
    //     sub.offsetX = offsetX;
    //     sub.offsetY = offsetY;
    //     for (let child of sub.children) {
    //         if (isTiledGridLayer(child)) {
    //             child.grid = sliceGrid(child.grid, startRow, endRow, startCol, endCol);
    //         }
    //         if (isTiledObjectGroup(child)) {
    //             for (let obj of child.objects) {
    //                 obj.x -= offsetX;
    //                 obj.y -= offsetY;
    //             }
    //         }
    //     }
    // }
    return map;
}
