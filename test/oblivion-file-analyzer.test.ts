import { assertEquals, describe, it } from '../deps.dev.ts';
import { Path } from '../model.ts';
import { OblivionFileAnalyzer } from '../oblivion-file-analyzer.ts';

const OBLIVION_DATA_PATH = '~/Games/Oblivion/Data';
const MOD_DATA_PATH = '~/Downloads/mod/data';

const fileAnalyzer = new OblivionFileAnalyzer(OBLIVION_DATA_PATH, MOD_DATA_PATH, false);

function updateAnalyzerPaths(oblivionPaths: Path[], modPaths: Path[]) {
  // @ts-ignore
  fileAnalyzer._allOblivionPaths = oblivionPaths;
  // @ts-ignore
  fileAnalyzer._allModPaths = modPaths;
}

describe('OblivionFileAnalyzer', () => {
  describe('reports paths as problematic when...', () => {
    it(`they have an exact match in different casing`, async () => {
      updateAnalyzerPaths(
        [
          {
            realPath: `${OBLIVION_DATA_PATH}/Meshes/Characters/Argonian/tail.nif`,
            realRelativePath: `/Meshes/Characters/Argonian/tail.nif`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/meshes/characters/argonian/tail.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/tail.nif`,
          },
        ],
        [
          {
            realPath: `${MOD_DATA_PATH}/meshes/characters/argonian/tail.nif`,
            realRelativePath: `/meshes/characters/argonian/tail.nif`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/meshes/characters/argonian/tail.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/tail.nif`,
          },
        ]
      );

      const { problemPaths, indepdenentPaths } = await fileAnalyzer.analyzePaths(1);

      assertEquals(problemPaths.length, 1);
      assertEquals(indepdenentPaths.length, 0);
    });
    it(`they have a partial match up to the filename`, async () => {
      updateAnalyzerPaths(
        [
          // Include another path that doesn't match as well to check that it picks the best-matching
          // path.
          {
            realPath: `${OBLIVION_DATA_PATH}/Meshes/Characters/Imperial/tail.nif`,
            realRelativePath: `/Meshes/Characters/Imperial/tail.nif`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/meshes/characters/imperial/tail.nif`,
            normalizedRelativePath: `/meshes/characters/imperial/tail.nif`,
          },
          {
            realPath: `${OBLIVION_DATA_PATH}/Meshes/Characters/Argonian/tail.nif`,
            realRelativePath: `/Meshes/Characters/Argonian/tail.nif`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/meshes/characters/argonian/tail.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/tail.nif`,
          },
        ],
        [
          {
            realPath: `${MOD_DATA_PATH}/meshes/characters/argonian/head.nif`,
            realRelativePath: `/meshes/characters/argonian/head.nif`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/meshes/characters/argonian/head.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/head.nif`,
          },
          {
            realPath: `${MOD_DATA_PATH}/meshes/characters/argonian/m/tail.nif`,
            realRelativePath: `/meshes/characters/argonian/m/tail.nif`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/meshes/characters/argonian/m/tail.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/m/tail.nif`,
          },
        ]
      );

      const { problemPaths, indepdenentPaths } = await fileAnalyzer.analyzePaths(1);

      assertEquals(problemPaths, [
        {
          existingPath: {
            realPath: '~/Downloads/mod/data/meshes/characters/argonian/head.nif',
            realRelativePath: '/meshes/characters/argonian/head.nif',
            normalizedPath: '~/downloads/mod/data/meshes/characters/argonian/head.nif',
            normalizedRelativePath: '/meshes/characters/argonian/head.nif',
          },
          correctedPath: {
            realPath: '~/Downloads/mod/data/Meshes/Characters/Argonian/head.nif',
            realRelativePath: '/Meshes/Characters/Argonian/head.nif',
            normalizedPath: '~/downloads/mod/data/meshes/characters/argonian/head.nif',
            normalizedRelativePath: '/meshes/characters/argonian/head.nif',
          },
        },
        {
          existingPath: {
            realPath: '~/Downloads/mod/data/meshes/characters/argonian/m/tail.nif',
            realRelativePath: '/meshes/characters/argonian/m/tail.nif',
            normalizedPath: '~/downloads/mod/data/meshes/characters/argonian/m/tail.nif',
            normalizedRelativePath: '/meshes/characters/argonian/m/tail.nif',
          },
          correctedPath: {
            realPath: '~/Downloads/mod/data/Meshes/Characters/Argonian/m/tail.nif',
            realRelativePath: '/Meshes/Characters/Argonian/m/tail.nif',
            normalizedPath: '~/downloads/mod/data/meshes/characters/argonian/m/tail.nif',
            normalizedRelativePath: '/meshes/characters/argonian/m/tail.nif',
          },
        },
      ]);

      assertEquals(indepdenentPaths.length, 0);
    });
    it(`they have a partial match for starting directories, but then deviate`, async () => {
      updateAnalyzerPaths(
        [
          {
            realPath: `${OBLIVION_DATA_PATH}/Textures/menus/icons/Grhys/exnemconv/seduchess.dds`,
            realRelativePath: `/Textures/menus/icons/Grhys/exnemconv/seduchess.dds`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/textures/menus/icons/grhys/exnemconv/seduchess.dds`,
            normalizedRelativePath: `/textures/menus/icons/grhys/exnemconv/seduchess.dds`,
          },
          {
            realPath: `${OBLIVION_DATA_PATH}/Textures/something/else/entirely/seduchess.dds`,
            realRelativePath: `/Textures/something/else/entirely/seduchess.dds`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/textures/something/else/entirely/seduchess.dds`,
            normalizedRelativePath: `/textures/something/else/entirely/seduchess.dds`,
          },
        ],
        [
          {
            realPath: `${MOD_DATA_PATH}/Textures/Menus/Icons/Armor/CowloftheGrayFox/Helmet.dds`,
            realRelativePath: `/Textures/Menus/Icons/Armor/CowloftheGrayFox/Helmet.dds`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/textures/menus/icons/armor/cowlofthegrayfox/helmet.dds`,
            normalizedRelativePath: `/textures/menus/icons/armor/cowlofthegrayfox/helmet.dds`,
          },
          {
            realPath: `${MOD_DATA_PATH}/Textures/Menus/Icons/IconSigilStone.dds`,
            realRelativePath: `/Textures/Menus/Icons/IconSigilStone.dds`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/textures/menus/icons/iconsigilstone.dds`,
            normalizedRelativePath: `/textures/menus/icons/iconsigilstone.dds`,
          },
        ]
      );

      const { problemPaths, indepdenentPaths } = await fileAnalyzer.analyzePaths(1);

      assertEquals(problemPaths, [
        {
          existingPath: {
            realPath: `${MOD_DATA_PATH}/Textures/Menus/Icons/Armor/CowloftheGrayFox/Helmet.dds`,
            realRelativePath: `/Textures/Menus/Icons/Armor/CowloftheGrayFox/Helmet.dds`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/textures/menus/icons/armor/cowlofthegrayfox/helmet.dds`,
            normalizedRelativePath: `/textures/menus/icons/armor/cowlofthegrayfox/helmet.dds`,
          },
          correctedPath: {
            realPath: `${MOD_DATA_PATH}/Textures/menus/icons/Armor/CowloftheGrayFox/Helmet.dds`,
            realRelativePath: `/Textures/menus/icons/Armor/CowloftheGrayFox/Helmet.dds`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/textures/menus/icons/armor/cowlofthegrayfox/helmet.dds`,
            normalizedRelativePath: `/textures/menus/icons/armor/cowlofthegrayfox/helmet.dds`,
          },
        },
        {
          existingPath: {
            realPath: `${MOD_DATA_PATH}/Textures/Menus/Icons/IconSigilStone.dds`,
            realRelativePath: `/Textures/Menus/Icons/IconSigilStone.dds`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/textures/menus/icons/iconsigilstone.dds`,
            normalizedRelativePath: `/textures/menus/icons/iconsigilstone.dds`,
          },
          correctedPath: {
            realPath: `${MOD_DATA_PATH}/Textures/menus/icons/IconSigilStone.dds`,
            realRelativePath: `/Textures/menus/icons/IconSigilStone.dds`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/textures/menus/icons/iconsigilstone.dds`,
            normalizedRelativePath: `/textures/menus/icons/iconsigilstone.dds`,
          },
        },
      ]);

      assertEquals(indepdenentPaths.length, 0);
    });
  });
  describe('reports paths as indepdendent when...', () => {
    it(`they have no match`, async () => {
      updateAnalyzerPaths(
        [
          {
            realPath: `${OBLIVION_DATA_PATH}/Meshes/Characters/Argonian/tail.nif`,
            realRelativePath: `/Meshes/Characters/Argonian/tail.nif`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/meshes/characters/argonian/tail.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/tail.nif`,
          },
        ],
        [
          {
            realPath: `${MOD_DATA_PATH}/textures/characters/argonian/head.nif`,
            realRelativePath: `/textures/characters/argonian/head.nif`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/textures/characters/argonian/head.nif`,
            normalizedRelativePath: `/textures/characters/argonian/head.nif`,
          },
        ]
      );

      const { problemPaths, indepdenentPaths } = await fileAnalyzer.analyzePaths(1);

      assertEquals(problemPaths.length, 0);
      assertEquals(indepdenentPaths.length, 1);
    });
    it(`they match exactly`, async () => {
      updateAnalyzerPaths(
        [
          {
            realPath: `${OBLIVION_DATA_PATH}/Meshes/Characters/Argonian/tail.nif`,
            realRelativePath: `/Meshes/Characters/Argonian/tail.nif`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/meshes/characters/argonian/tail.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/tail.nif`,
          },
        ],
        [
          {
            realPath: `${MOD_DATA_PATH}/Meshes/Characters/Argonian/tail.nif`,
            realRelativePath: `/Meshes/Characters/Argonian/tail.nif`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/meshes/characters/argonian/tail.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/tail.nif`,
          },
        ]
      );

      const { indepdenentPaths, problemPaths } = await fileAnalyzer.analyzePaths(1);

      assertEquals(problemPaths.length, 0);
      assertEquals(indepdenentPaths.length, 1);
    });
    it(`there's a path that matches exactly for everything but the name of the file`, async () => {
      updateAnalyzerPaths(
        [
          {
            realPath: `${OBLIVION_DATA_PATH}/OBSE/Plugins/DUMMY/Blockhead.dll`,
            realRelativePath: `/OBSE/Plugins/DUMMY/Blockhead.dll`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/obse/plugins/dummy/blockhead.dll`,
            normalizedRelativePath: `/obse/plugins/dummy/blockhead.dll`,
          },
          {
            realPath: `${OBLIVION_DATA_PATH}/OBSE/Plugins/Blockhead.dll`,
            realRelativePath: `/OBSE/Plugins/Blockhead.dll`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/obse/plugins/blockhead.dll`,
            normalizedRelativePath: `/obse/plugins/blockhead.dll`,
          },
          {
            realPath: `${OBLIVION_DATA_PATH}/OBSE/DUMMY/Blockhead.dll`,
            realRelativePath: `/OBSE/DUMMY/Blockhead.dll`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/obse/dummy/blockhead.dll`,
            normalizedRelativePath: `/obse/dummy/blockhead.dll`,
          },
        ],
        [
          {
            realPath: `${MOD_DATA_PATH}/OBSE/Plugins/SkyBSA.dll`,
            realRelativePath: `/OBSE/Plugins/SkyBSA.dll`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/obse/plugins/skybsa.dll`,
            normalizedRelativePath: `/obse/plugins/skybsa.dll`,
          },
        ]
      );

      const { indepdenentPaths, problemPaths } = await fileAnalyzer.analyzePaths(1);

      assertEquals(problemPaths.length, 0);
      assertEquals(indepdenentPaths, [
        {
          existingPath: {
            realPath: `${MOD_DATA_PATH}/OBSE/Plugins/SkyBSA.dll`,
            realRelativePath: `/OBSE/Plugins/SkyBSA.dll`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/obse/plugins/skybsa.dll`,
            normalizedRelativePath: `/obse/plugins/skybsa.dll`,
          },
        },
      ]);
    });
    it(`there's a partial match that matches exactly, but then they deviate`, async () => {
      updateAnalyzerPaths(
        [
          {
            realPath: `${OBLIVION_DATA_PATH}/Meshes/Characters/Argonian/tail.nif`,
            realRelativePath: `/Meshes/Characters/Argonian/tail.nif`,
            normalizedPath: `${OBLIVION_DATA_PATH.toLowerCase()}/meshes/characters/argonian/tail.nif`,
            normalizedRelativePath: `/meshes/characters/argonian/tail.nif`,
          },
        ],
        [
          {
            realPath: `${MOD_DATA_PATH}/Meshes/Architecture/CastleInterior/TowerSmall/CastleTowerLadder01.NIF`,
            realRelativePath: `/Meshes/Architecture/CastleInterior/TowerSmall/CastleTowerLadder01.NIF`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/meshes/architecture/castleinterior/towersmall/castletowerladder01.nif`,
            normalizedRelativePath: `/meshes/architecture/castleinterior/towersmall/castletowerladder01.nif`,
          },
        ]
      );

      const { problemPaths, indepdenentPaths } = await fileAnalyzer.analyzePaths(1);

      assertEquals(indepdenentPaths, [
        {
          existingPath: {
            realPath: `${MOD_DATA_PATH}/Meshes/Architecture/CastleInterior/TowerSmall/CastleTowerLadder01.NIF`,
            realRelativePath: `/Meshes/Architecture/CastleInterior/TowerSmall/CastleTowerLadder01.NIF`,
            normalizedPath: `${MOD_DATA_PATH.toLowerCase()}/meshes/architecture/castleinterior/towersmall/castletowerladder01.nif`,
            normalizedRelativePath: `/meshes/architecture/castleinterior/towersmall/castletowerladder01.nif`,
          },
        },
      ]);

      assertEquals(problemPaths.length, 0);
    });
  });
});
