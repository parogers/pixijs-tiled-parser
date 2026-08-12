
# pixijs-tiled-parser

A simple parsing library for Tiled map editor files for use with PixiJS.

## Usage

```typescript
import * as PIXI from 'pixi.js';
import { makeTiledParserExtension } from '@parogers/pixijs-tiled-parser';

PIXI.extensions.add(makeTiledParserExtension());

async function load() {
    const map = await PIXI.Assets.load('map.tmx');
    // Map info:
    map.rows
    map.cols
    map.tileWidth
    map.tileHeight
    map.properties['key']           // custom properties (key, value pairs)

    // Grid layers
    const gridLayers = getTiledGridLayers(map);
    gridLayers[0].name              // eg. "Grid Layer 1"
    gridLayers[0].grid[0][0]        // index into the tilesets

    // Object layers
    const objectGroups = getTiledObjectGroups(map);
    objectGroups[0].name
    objectGroups[0].x
    objectGroups[0].y

    // You can access child objects directly
    map.children                    // map layers (ie grid, group, object group)
    map.children[0].name
    map.children[0].grid[0][0]

    // Tileset info:
    map.tilesetRefs[0].source       // eg. "tiles.tsx"
    map.tilesetRefs[0].firstGID     // used to map grid indices to tiles
    // Automatically loads tilesets as PIXI spritesheets
    map.tilesetRefs[0].tileset.spritesheet
    // Automatically named after the tilesheet plus image index
    map.tilesetRefs[0].tileset.spritesheet.textures['tiles-1']
}

```
