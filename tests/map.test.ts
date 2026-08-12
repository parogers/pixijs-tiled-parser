
import { vi, expect, test, beforeEach } from 'vitest';
import {
    loadTiledMap,
    getTiledGridLayers,
    getTiledObjectGroups,
    getTiledGroups,
    getTiledObjects,
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
                rawGrid: [[1, 2, 3], [4, 5, 6]],
                grid: [],
            },
            {
                name: 'second grid',
                rawGrid: [[1, 2, 3], [4, 5, 6]],
                grid: [],
            },
            {
                name: 'objects',
                objects: [],
            },
            {
                name: 'third grid',
                rawGrid: [[4, 5, 6], [7, 8, 9]],
                grid: [],
            },
        ],
    };
    const layers = getTiledGridLayers(map);
    expect(layers).toEqual([
        {
            name: 'first grid',
            rawGrid: [[1, 2, 3], [4, 5, 6]],
            grid: [],
        },
        {
            name: 'second grid',
            rawGrid: [[1, 2, 3], [4, 5, 6]],
            grid: [],
        },
        {
            name: 'third grid',
            rawGrid: [[4, 5, 6], [7, 8, 9]],
            grid: [],
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
                grid: [],
                rawGrid: [[1, 2, 3], [4, 5, 6]],
            },
            {
                name: 'first group',
                children: [
                    {
                        name: 'sub grid',
                        grid: [],
                        rawGrid: [[1, 2, 3], [4, 5, 6]],
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
                    grid: [],
                    rawGrid: [[1, 2, 3], [4, 5, 6]],
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
                grid: [],
                rawGrid: [[1, 2, 3], [4, 5, 6]],
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
                grid: [],
                rawGrid: [[1, 2, 3], [4, 5, 6]],
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
