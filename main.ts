import { write, writeLine } from './console.util.ts';
import { OblivionFileAnalyzer } from './oblivion-file-analyzer.ts';
import { exitWithError, getArgs } from './util.ts';

const TITLE = '-- Oblivion Mod File Case Fixer for Linux by JT --';
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

    write(`Analyzing with max of ${maxAnalysisWorkers} workers...`);
    const startAnalysisMark = performance.mark(`${ANALYSIS_PERFORMANCE_MARK_NAME}start`);

    const { indepdenentPaths, problemPaths } = await fileAnalyzer.analyzePaths(maxAnalysisWorkers);

    const endAnalysisMark = performance.mark(`${ANALYSIS_PERFORMANCE_MARK_NAME}end`);
    const analysisElapsedTime = performance.measure(
      'analysisElapsedTime',
      startAnalysisMark.name,
      endAnalysisMark.name
    );

    write(`Finished in ${analysisElapsedTime.duration}ms (${analysisElapsedTime.duration / 1000}s)`, 1);
    write(`Badly-cased paths: ${problemPaths.length}`, 1);
    write(`Mod-specific paths: ${indepdenentPaths.length}`, 1);

    if (problemPaths.length > 0) {
      const shouldPrintProblemPaths = confirm(`View proposed badly-cased path changes?`);

      if (shouldPrintProblemPaths) {
        writeLine(
          `Badly-cased path corrections:\n${problemPaths
            .map((path) => `${path.existingPath.realRelativePath} => ${path.correctedPath?.realRelativePath}`)
            .join('\n')}`
        );
      }
    }
    if (indepdenentPaths.length > 0) {
      const shouldPrintIndependentPaths = confirm(`View mod-specific paths?`);

      if (shouldPrintIndependentPaths) {
        writeLine(
          `Mod-specific paths:\n${indepdenentPaths.map((path) => path.existingPath.realRelativePath).join('\n')}`
        );
      }
    }

    if (problemPaths.length > 0) {
      writeLine(`The script can fix the badly-cased paths.`);
      writeLine(
        `Mod-specific paths have no exact nor partial equivalent in Oblivion's Data Folder and can typically be copied over as-is without issue. These files will be present in the output.`
      );
      writeLine(
        `Oblivion's data folder will be untouched. Fixed file paths will be put into a separate directory in the mod directory ` +
          `to avoid damaging the integrity of the mod's files.`
      );
      const shouldPerformFix = confirm(`Would you like to proceed with fixes?`);

      if (shouldPerformFix) {
        write('\nFixing...');

        await fileAnalyzer.fixPaths({ problemPaths, indepdenentPaths });

        writeLine(`Done! Files can be found at: \n\n${fileAnalyzer.fixedFilesOutputPath}`, 1);
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
