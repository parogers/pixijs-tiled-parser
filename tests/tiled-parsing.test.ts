
import * as PIXI from 'pixi.js';
// import { readFile } from 'node:fs/promises';
import { vi, expect, test, beforeEach } from 'vitest';
import { loadTiledMap } from '../src/index';


function makeResponse(src: string) {
    return {
        text: async function() {
            return await readFile(src, { encoding: 'utf8' });
        }
    }
}


test('loads a parses an empty map', async () => {
    const map = await loadTiledMap('tests/empty.tmx');
    expect(map.rows).toBe(24);
    expect(map.cols).toBe(32);
    expect(map.tileWidth).toBe(8);
    expect(map.tileHeight).toBe(8);
    expect(map.tilesetRefs).toEqual([]);
    expect(map.properties).toEqual({});
    expect(map.children.length).toEqual(1);
    expect(map.children[0].name).toBe('Tile Layer 1');
    expect(map.children[0].grid.length).toBe(24);
    expect(map.children[0].grid[0].length).toBe(32);
    expect(map.children[0].grid[0][0]).toBe(0);
});


test('loads map properties', async () => {
    const map = await loadTiledMap('tests/map-properties.tmx');
    expect(map.properties).toEqual({
        'abba' : 'testing',
        'hello' : 'world',
    });
});


test('loads tilesets and layers', async () => {
    const map = await loadTiledMap('tests/grid-layers.tmx');
    expect(map.rows).toBe(4);
    expect(map.cols).toBe(3);
    expect(map.tileWidth).toBe(8);
    expect(map.tileHeight).toBe(8);
    expect(map.tilesetRefs).toMatchObject([
        {
            firstGID: 1,
            src: "tiles.xml",
            tileset: {
                columns: 3,
                margin: 1,
                source: "tests/tiles.png",
                sourceHeight: 32,
                sourceWidth: 32,
                spacing: 1,
                tileCount: 9,
                tileHeight: 8,
                tileWidth: 8,
            },
        },
        {
            firstGID: 10,
            src: "tiles2.xml",
            tileset: {
                columns: 3,
                margin: 1,
                source: "tests/tiles2.png",
                sourceHeight: 32,
                sourceWidth: 32,
                spacing: 1,
                tileCount: 9,
                tileHeight: 8,
                tileWidth: 8,
            },
        },
    ]);
    expect(map.properties).toEqual({});
    expect(map.children.length).toEqual(2);
    expect(map.children[0].name).toBe('Tile Layer 1');
    expect(map.children[0].grid.length).toBe(4);
    expect(map.children[0].grid[0].length).toBe(3);
    expect(map.children[0].grid[0][0]).toBe(1);
    expect(map.children[0].grid[1][1]).toBe(2);
    expect(map.children[0].grid[3][2]).toBe(0);
    expect(map.children[1].name).toBe('Tile Layer 2');
    expect(map.children[1].grid.length).toBe(4);
    expect(map.children[1].grid[0].length).toBe(3);
    expect(map.children[1].grid[0][0]).toBe(10);
    expect(map.children[1].grid[1][1]).toBe(2);
})


test('loads group layers', async () => {
    const map = await loadTiledMap('tests/groups.tmx');
    expect(map.children.length).toBe(2);
    expect(map.children[0].name).toBe('Tile Layer 4');
    expect(map.children[1].name).toBe('Group Layer 1');
    expect(map.children[1].children.length).toBe(3);
    expect(map.children[1].children[0].name).toBe('Group Layer 2');
    expect(map.children[1].children[0].children.length).toBe(1);
})


test('loads objects', async () => {
    const map = await loadTiledMap('tests/objects.tmx');
    expect(map.children.length).toBe(2);
    expect(map.children[0].name).toBe('Tile Layer 1');
    expect(map.children[1].name).toBe('Object Layer 1');
    expect(map.children[1].objects.length).toBe(2);
    expect(map.children[1].objects[0]).toEqual({
        name: "",
        type: "",
        x: 1.875,
        y: 30.3125,
        width: 11.5,
        height: 11.5,
        flippedX: false,
        properties: {},
    });
    expect(map.children[1].objects[1]).toEqual({
        name: "second",
        type: "class name",
        x: 12.5,
        y: 11.625,
        width: 8,
        height: 8,
        flippedX: true,
        properties: {
            hello: 'world',
        },
    });
});
