
const { readFile } = require('node:fs/promises');
import { vi, expect, test, beforeEach } from 'vitest';
import { loadTiledMap } from '../src/index';
import { JSDOM } from 'jsdom';

global.DOMParser = new JSDOM().window.DOMParser;

vi.spyOn(globalThis, 'fetch');

beforeEach(() => {
    fetch.mockClear();
})


test('loads a parses an empty map', async () => {
    fetch.mockReturnValue({
        text: async function() {
            return await readFile('./tests/empty.tmx', { encoding: 'utf8' });
        }
    });
    const map = await loadTiledMap('http://example.com/test.tmx');
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
    expect(fetch).toHaveBeenCalled('http://example.com/test.tmx');
});


test('loads map properties', async () => {
    fetch.mockReturnValue({
        text: async function() {
            return await readFile('./tests/map-properties.tmx', { encoding: 'utf8' });
        }
    });
    const map = await loadTiledMap('http://example.com/test.tmx');
    expect(map.properties).toEqual({
        'abba' : 'testing',
        'hello' : 'world',
    });
});


function makeResponse(src: string) {
    return {
        text: async function() {
            return await readFile(src, { encoding: 'utf8' });
        }
    }
}


test('loads tilesets and layers', async () => {
    fetch.mockImplementation((url: string) => {
        if (url === 'http://example.com/tiles.tsx') {
            return makeResponse('./tests/tiles.tsx');
        }
        if (url === 'http://example.com/tiles2.tsx') {
            return makeResponse('./tests/tiles2.tsx');
        }
        return makeResponse('./tests/grid-layers.tmx');
    });
    const map = await loadTiledMap('http://example.com/test.tmx');
    expect(map.rows).toBe(4);
    expect(map.cols).toBe(3);
    expect(map.tileWidth).toBe(8);
    expect(map.tileHeight).toBe(8);
    expect(map.tilesetRefs).toEqual([
        {
            firstGID: 1,
            src: "tiles.tsx",
            tileset: {
                columns: 3,
                margin: 1,
                source: "http://example.com/tiles.png",
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
            src: "tiles2.tsx",
            tileset: {
                columns: 3,
                margin: 1,
                source: "http://example.com/tiles2.png",
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
    fetch.mockImplementation((url: string) => {
        if (url === 'http://example.com/tiles.tsx') {
            return makeResponse('./tests/tiles.tsx');
        }
        return makeResponse('./tests/groups.tmx');
    });
    const map = await loadTiledMap('http://example.com/test.tmx');
    expect(map.children.length).toBe(2);
    expect(map.children[0].name).toBe('Tile Layer 4');
    expect(map.children[1].name).toBe('Group Layer 1');
    expect(map.children[1].children.length).toBe(3);
    expect(map.children[1].children[0].name).toBe('Group Layer 2');
    expect(map.children[1].children[0].children.length).toBe(1);
})


test('loads objects', async () => {
    fetch.mockImplementation((url: string) => {
        if (url === 'http://example.com/tiles.tsx') {
            return makeResponse('./tests/tiles.tsx');
        }
        return makeResponse('./tests/objects.tmx');
    });
    const map = await loadTiledMap('http://example.com/test.tmx');
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
})
