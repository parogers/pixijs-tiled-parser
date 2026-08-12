
import { vi, expect, test, beforeEach } from 'vitest';
import {
    loadTiledMap,
    getTiledGridLayers,
    getTiledObjectGroups,
    getTiledGroups,
    getTiledObjects,
    getTiledMapGrid,
} from '../src/index';


test('filter grid layers', () => {
    const map = {
        name: 'test map',
        cols: 4,
        rows: 3,
        tileWidth: 8,
        tileHeight: 8,
        offsetX: 0,
        offsetY: 0,
        tilesetRefs: [],
        properties: {},
        children: [
            {
                name: 'first grid',
                grid: [[1, 2, 3], [4, 5, 6]],
            },
            {
                name: 'second grid',
                grid: [[1, 2, 3], [4, 5, 6]],
            },
            {
                name: 'objects',
                objects: [],
            },
            {
                name: 'third grid',
                grid: [[4, 5, 6], [7, 8, 9]],
            },
        ],
    };
    const layers = getTiledGridLayers(map);
    expect(layers).toEqual([
        {
            name: 'first grid',
            grid: [[1, 2, 3], [4, 5, 6]],
        },
        {
            name: 'second grid',
            grid: [[1, 2, 3], [4, 5, 6]],
        },
        {
            name: 'third grid',
            grid: [[4, 5, 6], [7, 8, 9]],
        },
    ]);
});


test('filters group layers', () => {
    const map = {
        name: 'test map',
        cols: 4,
        rows: 3,
        tileWidth: 8,
        tileHeight: 8,
        offsetX: 0,
        offsetY: 0,
        tilesetRefs: [],
        properties: {},
        children: [
            {
                name: 'grid',
                grid: [[1, 2, 3], [4, 5, 6]],
            },
            {
                name: 'first group',
                children: [
                    {
                        name: 'sub grid',
                        grid: [[1, 2, 3], [4, 5, 6]],
                    },
                ],
            },
            {
                name: 'second group',
                children: [],
            },
        ],
    };
    const layers = getTiledGroups(map);
    expect(layers).toEqual([
        {
            name: 'first group',
            children: [
                {
                    name: 'sub grid',
                    grid: [[1, 2, 3], [4, 5, 6]],
                },
            ],
        },
        {
            name: 'second group',
            children: [],
        },
    ]);
});


test('filters object groups', () => {
    const map = {
        name: 'test map',
        cols: 4,
        rows: 3,
        tileWidth: 8,
        tileHeight: 8,
        offsetX: 0,
        offsetY: 0,
        tilesetRefs: [],
        properties: {},
        children: [
            {
                name: 'grid',
                grid: [[1, 2, 3], [4, 5, 6]],
            },
            {
                name: 'first objects',
                objects: [],
            },
            {
                name: 'second objects',
                objects: [],
            },
        ],
    };
    const layers = getTiledObjectGroups(map);
    expect(layers).toEqual([
        {
            name: 'first objects',
            objects: [],
        },
        {
            name: 'second objects',
            objects: [],
        },
    ]);
})


test('filters objects', () => {
    const map = {
        name: 'test map',
        cols: 4,
        rows: 3,
        tileWidth: 8,
        tileHeight: 8,
        offsetX: 0,
        offsetY: 0,
        tilesetRefs: [],
        properties: {},
        children: [
            {
                name: 'grid',
                grid: [[1, 2, 3], [4, 5, 6]],
            },
            {
                name: 'first objects',
                objects: [
                    {
                        name: 'first object',
                        type: 'type',
                        x: 1,
                        y: 2,
                        width: 3,
                        height: 4,
                        flippedX: false,
                        properties: {},
                    },
                ],
            },
            {
                name: 'second objects',
                objects: [
                    {
                        name: 'second object',
                        type: 'type',
                        x: 5,
                        y: 6,
                        width: 7,
                        height: 8,
                        flippedX: true,
                        properties: {},
                    },
                ],
            },
        ],
    };
    const objects = getTiledObjects(map);
    expect(objects).toEqual([
        {
            name: 'first object',
            type: 'type',
            x: 1,
            y: 2,
            width: 3,
            height: 4,
            flippedX: false,
            properties: {},
        },
        {
            name: 'second object',
            type: 'type',
            x: 5,
            y: 6,
            width: 7,
            height: 8,
            flippedX: true,
            properties: {},
        },
    ]);
});


test('mapping grid to sprites', () => {
    const map = {
        name: 'test map',
        cols: 4,
        rows: 3,
        tileWidth: 8,
        tileHeight: 8,
        offsetX: 0,
        offsetY: 0,
        tilesetRefs: [
            {
                src: 'tiles.tsx',
                firstGID: 1,
                tileset: {
                    tileWidth: 8,
                    tileHeight: 8,
                    spacing: 1,
                    margin: 1,
                    columns: 3,
                    tileCount: 9,
                    source: 'tiles.png',
                    sourceWidth: 32,
                    sourceHeight: 32,
                    spritesheet: null,
                },
            },
            {
                src: 'tiles2.tsx',
                firstGID: 10,
                tileset: {
                    tileWidth: 8,
                    tileHeight: 8,
                    spacing: 1,
                    margin: 1,
                    columns: 4,
                    tileCount: 16,
                    source: 'tiles2.png',
                    sourceWidth: 32,
                    sourceHeight: 32,
                    spritesheet: null,
                },
            },
        ],
        properties: {},
        children: [
            {
                name: 'grid',
                grid: [
                    [0, 1, 2],
                    [10, 2, 9],
                    [4, 5, 16],
                ],
            },
        ],
    };
    const sprites = getTiledMapGrid(map, map.children[0]);
    expect(sprites).toEqual([
        [
            null,
            'tiles-1',
            'tiles-2',
        ],
        [
            'tiles2-1',
            'tiles-2',
            'tiles-9',
        ],
        [
            'tiles-4',
            'tiles-5',
            'tiles2-7',
        ],
    ]);
});
