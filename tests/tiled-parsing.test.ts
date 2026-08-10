
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
    expect(map.properties).toEqual([]);
    expect(map.children.length).toEqual(1);
    expect(map.children[0].name).toBe('Tile Layer 1');
    expect(map.children[0].grid.length).toBe(24);
    expect(map.children[0].grid[0].length).toBe(32);
    expect(map.children[0].grid[0][0]).toBe(0);
    expect(fetch).toHaveBeenCalled('http://example.com/test.tmx');
})


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
            "firstGID": 1,
            "src": "tiles.tsx",
            "tileset": {
                "columns": 3,
                "margin": 1,
                "source": "tiles.png",
                "sourceHeight": 32,
                "sourceWidth": 32,
                "spacing": 1,
                "texture": null,
                "tileCount": 9,
                "tileHeight": 8,
                "tileWidth": 8,
            },
        },
        {
            "firstGID": 10,
            "src": "tiles2.tsx",
            "tileset": {
                "columns": 3,
                "margin": 1,
                "source": "tiles2.png",
                "sourceHeight": 32,
                "sourceWidth": 32,
                "spacing": 1,
                "texture": null,
                "tileCount": 9,
                "tileHeight": 8,
                "tileWidth": 8,
            },
        },
    ]);
    expect(map.properties).toEqual([]);
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
