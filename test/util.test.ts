import { DEFAULT_MAX_ANALYSIS_WORKERS } from '../constants.ts';
import { Stub, afterEach, assertEquals, assertSpyCalls, beforeEach, describe, it, stub } from '../deps.ts';
import { _internals, getArgs } from '../util.ts';

describe('getArgs', () => {
  let exitStub: Stub;
  beforeEach(() => {
    exitStub = stub(_internals, 'exitWithError', () => {});
  });
  afterEach(() => {
    exitStub.restore();
  });

  it(`doesn't explode when given no args`, () => {
    getArgs([]);

    assertSpyCalls(exitStub, 1);
  });

  describe('required args', () => {
    it('exits when oblivionDataFolder is missing', () => {
      getArgs(['--modDataFolder=something', '--someOtherArg']);

      assertSpyCalls(exitStub, 1);
    });
    it('exits when modDataFolder is missing', () => {
      getArgs(['--oblivionDataFolder=something', '--someOtherArg']);

      assertSpyCalls(exitStub, 1);
    });
    it(`doesn't exit when all required args are present`, () => {
      getArgs(['--oblivionDataFolder=something', '--modDataFolder=something']);

      assertSpyCalls(exitStub, 0);
    });
  });

  describe('optional args', () => {
    it('uses a correct maxAnalysisWorkers', () => {
      const { maxAnalysisWorkers } = getArgs([
        '--oblivionDataFolder=something',
        '--modDataFolder=something',
        '--maxAnalysisWorkers=5',
      ]);

      assertEquals(maxAnalysisWorkers, 5);
    });
    describe(`maxAnalysisWorkers defaults to ${DEFAULT_MAX_ANALYSIS_WORKERS}...`, () => {
      it('when not provided', () => {
        const { maxAnalysisWorkers } = getArgs(['--oblivionDataFolder=something', '--modDataFolder=something']);

        assertEquals(maxAnalysisWorkers, DEFAULT_MAX_ANALYSIS_WORKERS);
      });
      it('when not a number', () => {
        const { maxAnalysisWorkers } = getArgs([
          '--oblivionDataFolder=something',
          '--modDataFolder=something',
          '--maxAnalysisWorkers=f',
        ]);

        assertEquals(maxAnalysisWorkers, DEFAULT_MAX_ANALYSIS_WORKERS);
      });
    });
  });

  describe('arg treatment', () => {
    it('trims trailing slashes from the mod folder args.', () => {
      const { modDataFolder, oblivionDataFolder } = getArgs([
        '--oblivionDataFolder=/a/folder/somewhere///',
        '--modDataFolder=/another/folder/somewhere/else/',
      ]);

      assertEquals(oblivionDataFolder, '/a/folder/somewhere');
      assertEquals(modDataFolder, '/another/folder/somewhere/else');
    });
    it('trims trailing whitespace from the mod folder args.', () => {
      const { modDataFolder, oblivionDataFolder } = getArgs([
        '--oblivionDataFolder=  /a/folder/somewhere  ',
        '--modDataFolder=/another/folder/somewhere/else/      ',
      ]);

      assertEquals(oblivionDataFolder, '/a/folder/somewhere');
      assertEquals(modDataFolder, '/another/folder/somewhere/else');
    });
  });
});
