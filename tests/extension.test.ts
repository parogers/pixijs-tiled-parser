
import { vi, expect, test, beforeEach } from 'vitest';
import { loadTiledMap } from '../src/index';
import { TILED_MAP_LOADER } from '../src/index';


test('caching the map object', async () => {
    const map = await loadTiledMap('tests/empty.tmx');
    const results = TILED_MAP_LOADER.getCacheableAssets(['a', 'b', 'c'], map);
    expect(results['a']).toEqual(map);
    expect(results['b']).toEqual(map);
    expect(results['c']).toEqual(map);
});


test('caching the spritesheets', async () => {
    const map = await loadTiledMap('tests/grid-layers.tmx');
    const results = TILED_MAP_LOADER.getCacheableAssets(['a', 'b', 'c'], map);
    expect(results['tests/tiles-0']).toBeTruthy();
    expect(results['tests/tiles2-0']).toBeTruthy();
});
