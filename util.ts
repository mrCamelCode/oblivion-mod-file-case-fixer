import { DEFAULT_MAX_ANALYSIS_WORKERS } from "./constants.ts";
import { parseArgs } from './deps.ts';
import { ScriptArgs } from './model.ts';

export function getArgs(args: string[]): ScriptArgs {
  const { oblivionDataFolder, modDataFolder, maxAnalysisWorkers } = parseArgs(args, {
    string: ['oblivionDataFolder', 'modDataFolder', 'maxAnalysisWorkers'],
  });

  const treatedOblivionFolder = treatPathString(oblivionDataFolder);
  const treatedModDataFolder = treatPathString(modDataFolder);
  const parsedMaxAnalysisWorkers = +(maxAnalysisWorkers ?? '');
  const safeMaxAnalysisWorkers =
    isNaN(parsedMaxAnalysisWorkers) || parsedMaxAnalysisWorkers === 0 ? DEFAULT_MAX_ANALYSIS_WORKERS : parsedMaxAnalysisWorkers;

  const missingRequiredArgs = [
    treatedOblivionFolder ? undefined : 'oblivionDataFolder',
    treatedModDataFolder ? undefined : 'modDataFolder',
  ].filter(Boolean) as string[];

  if (missingRequiredArgs.length > 0) {
    _internals.exitWithError(
      `The arguments ${missingRequiredArgs.join(
        ', '
      )} must be provided. Note that paths are case-sensitive. Example: --${
        missingRequiredArgs[0]
      }=~/path/to/folder/Data`
    );
  }

  return {
    oblivionDataFolder: treatedOblivionFolder,
    modDataFolder: treatedModDataFolder,
    maxAnalysisWorkers: safeMaxAnalysisWorkers,
  };
}

export function exitWithError(error: string) {
  console.error(error);

  Deno.exit(-1);
}

export function waitFor(callback: () => boolean, pollFrequencyMs = 200): Promise<void> {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (callback()) {
        clearInterval(interval);
        resolve();
      }
    }, pollFrequencyMs);
  });
}

/**
 * @param path - The path to treat.
 *
 * @returns The provided `path` without trailing whitespace and slashes.
 */
function treatPathString(path?: string): string {
  const safePath = path ?? '';

  const trimmedPathChars = safePath.trim().split('');
  while (trimmedPathChars[trimmedPathChars.length - 1] === '/') {
    trimmedPathChars.pop();
  }

  return trimmedPathChars.join('');
}

export const _internals = { exitWithError, getArgs };
