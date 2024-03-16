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
  it(`does not report paths when they match exactly`, async () => {
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
    assertEquals(indepdenentPaths.length, 0);
  });
  it(`reports paths as problematic that have an exact match`, async () => {
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
  it(`reports paths as problematic that have a partial match`, async () => {
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
  it(`reports paths as independent when they have no match`, async () => {
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
});
