
import { vi, expect, test, beforeEach } from 'vitest';
import { loadTiledMap } from '../src/index';
import { makeTiledParserExtension } from '../src/index';


test('tests for a map file', async () => {
    expect(makeTiledParserExtension().loader.test('map.tmx')).toBe(true);
    expect(makeTiledParserExtension().loader.test('somethingelse.json')).toBe(false);
});


test('loads a map object', async () => {
    const map = await makeTiledParserExtension().loader.load('tests/empty.tmx');
    expect(!!map).toBeTruthy();
});


test('caching the map object', async () => {
    const map = await loadTiledMap('tests/empty.tmx');
    const results = makeTiledParserExtension().cache.getCacheableAssets(['a', 'b', 'c'], map);
    expect(results['a']).toEqual(map);
    expect(results['b']).toEqual(map);
    expect(results['c']).toEqual(map);
});


test('caching the spritesheets', async () => {
    const map = await loadTiledMap('tests/grid-layers.tmx');
    const results = makeTiledParserExtension().cache.getCacheableAssets(['a', 'b', 'c'], map);
    expect(results['tests/tiles-1']).toBeTruthy();
    expect(results['tests/tiles-2']).toBeTruthy();
    expect(results['tests/tiles-9']).toBeTruthy();
    expect(results['tests/tiles2-1']).toBeTruthy();
    expect(results['tests/tiles2-9']).toBeTruthy();
});
