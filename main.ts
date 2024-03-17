import { write, writeLine } from './console.util.ts';
import { MAX_PATH_OUTPUT_FOR_CONSOLE, VERSION } from './constants.ts';
import { OblivionFileAnalyzer } from './oblivion-file-analyzer.ts';
import { exitWithError, getArgs } from './util.ts';

const TITLE = `-- Oblivion Mod File Case Fixer for Linux by JT (v${VERSION}) --`;
const ANALYSIS_PERFORMANCE_MARK_NAME = 'analysis';

async function main() {
  try {
    write('-'.repeat(TITLE.length));
    write(TITLE);
    write('-'.repeat(TITLE.length));

    writeLine('JT says: Case sensitivity? Who she?');

    const { oblivionDataFolder, modDataFolder, maxAnalysisWorkers } = getArgs(Deno.args);

    write('Initializing...');
    const fileAnalyzer = new OblivionFileAnalyzer(oblivionDataFolder, modDataFolder);
    writeLine(`Found ${fileAnalyzer.numModPaths} paths to analyze in the mod's data folder.`, 1);

    write(`Analyzing (${maxAnalysisWorkers} workers)...`);
    const startAnalysisMark = performance.mark(`${ANALYSIS_PERFORMANCE_MARK_NAME}start`);

    const { indepdenentPaths, problemPaths } = await fileAnalyzer.analyzePaths(maxAnalysisWorkers);

    const endAnalysisMark = performance.mark(`${ANALYSIS_PERFORMANCE_MARK_NAME}end`);
    const analysisElapsedTime = performance.measure(
      'analysisElapsedTime',
      startAnalysisMark.name,
      endAnalysisMark.name
    );

    write(`Finished in ${analysisElapsedTime.duration}ms (${analysisElapsedTime.duration / 1000}s)`, 1);
    write(`Incorrect paths: ${problemPaths.length}`, 1);
    write(`OK paths: ${indepdenentPaths.length}`, 1);
    if (problemPaths.length + indepdenentPaths.length !== fileAnalyzer.numModPaths) {
      write(
        `Uh oh! The analysis somehow resulted in ${problemPaths.length + indepdenentPaths.length} files, but ` +
          `was supposed to analyze ${fileAnalyzer.numModPaths} files. This is a bug.`
      );
    }

    if (problemPaths.length > 0) {
      const shouldPrintProblemPaths = confirm(`View incorrect paths?`);

      if (shouldPrintProblemPaths) {
        const str = `Incorrect paths and proposed corrections:\n${problemPaths
          .map((path) => `${path.existingPath.realRelativePath} => ${path.correctedPath?.realRelativePath}`)
          .sort()
          .join('\n')}`;

        if (problemPaths.length <= MAX_PATH_OUTPUT_FOR_CONSOLE) {
          writeLine(str);
        } else {
          const filePath = './incorrectPaths.txt';

          writeLine(`Too many paths for console output. Output sent to ${filePath}`);
          await Deno.writeTextFile(filePath, str);
        }
      }
    }

    if (indepdenentPaths.length > 0) {
      const shouldPrintIndependentPaths = confirm(`View OK paths?`);

      if (shouldPrintIndependentPaths) {
        const str = `OK paths:\n${indepdenentPaths
          .map((path) => path.existingPath.realRelativePath)
          .sort()
          .join('\n')}`;

        if (indepdenentPaths.length <= MAX_PATH_OUTPUT_FOR_CONSOLE) {
          writeLine(str);
        } else {
          const filePath = './okPaths.txt';

          writeLine(`Too many paths for console output. Output sent to ${filePath}`);
          await Deno.writeTextFile(filePath, str);
        }
      }
    }

    if (problemPaths.length > 0) {
      writeLine(`The script can fix the incorrect paths.`);
      writeLine(
        `Oblivion's data folder will be untouched. The folder specified by --modDataFolder will be reconstructed with the proposed corrections ` +
          `in a new folder to avoid compromising the integrity of the original mod files. Once the process is complete, you ` +
          `can drop the new folder's contents into your game folder like you would if you were installing the mod normally. The folder ` +
          `containing the corrected paths essentially becomes the new mod folder.`
      );
      const shouldPerformFix = confirm(`Would you like to proceed with fixes?`);

      if (shouldPerformFix) {
        write('\nFixing...');

        await fileAnalyzer.fixPaths({ problemPaths, indepdenentPaths });

        writeLine(`Done! Files can be found at:\n`, 1);
        writeLine(`${fileAnalyzer.fixedFilesOutputPath}\n`, 1);
      } else {
        write('No fixes performed.');
      }
    } else {
      writeLine('\nMod is already good! No fixes needed.');
    }
  } catch (error) {
    exitWithError(`An unexpected error occurred that prevented the script from completing: ${error}`);
  }

  writeLine('\nThanks for using the script! Bye!');

  Deno.exit(0);
}

await main();
