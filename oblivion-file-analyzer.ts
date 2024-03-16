import { copy, ensureFileSync, walkSync } from './deps.ts';
import {
  AnalyzedPath,
  IpcMessage,
  IpcMessageType,
  Path,
  PathAnalysisWorkerArgs,
  PathsAnalysisResult,
} from './model.ts';
import { waitFor } from './util.ts';

interface WorkerData {
  worker: Worker;
  isComplete: boolean;
}

export class OblivionFileAnalyzer {
  public static readonly FIXED_FILES_OUTPUT_DIR = 'OMFCF_FIXED';

  private _allOblivionPaths: Path[] = [];
  private _allModPaths: Path[] = [];

  public get numModPaths(): number {
    return this._allModPaths.length;
  }
  public get fixedFilesOutputPath(): string {
    return `${this._modDataFolderPath}/${OblivionFileAnalyzer.FIXED_FILES_OUTPUT_DIR}`;
  }

  constructor(private _oblivionDataFolderPath: string, private _modDataFolderPath: string, autoInitPaths = true) {
    if (autoInitPaths) {
      this.initPaths();
    }
  }

  public async analyzePaths(maxWorkers: number): Promise<PathsAnalysisResult> {
    const problemPaths: AnalyzedPath[] = [];
    const indepdenentPaths: AnalyzedPath[] = [];

    const numWorkers = this.determineActualNumWorkers(maxWorkers);

    const workers: WorkerData[] = [];
    const modPathsChunkSize = Math.floor(this._allModPaths.length / numWorkers);
    for (let i = 0; i < numWorkers; i++) {
      const workerDataObj = {
        worker: new Worker(import.meta.resolve('./analyze-paths.worker.ts'), { type: 'module' }),
        isComplete: false,
      } as WorkerData;

      workerDataObj.worker.addEventListener('message', (event) => {
        const { type, payload } = (event.data as IpcMessage) ?? {};

        if (type === IpcMessageType.Finished) {
          const { indepdenentPaths: workerIndependentPaths, problemPaths: workerProblemPaths } =
            payload as PathsAnalysisResult;

          problemPaths.push(...workerProblemPaths);
          indepdenentPaths.push(...workerIndependentPaths);

          workerDataObj.isComplete = true;
        }
      });

      workers.push(workerDataObj);

      const startIndex = modPathsChunkSize * i;
      const thisWorkersChunk =
        i === numWorkers - 1
          ? // In case the chunks didn't split evenly, the final worker gets any leftovers.
            this._allModPaths.slice(startIndex)
          : this._allModPaths.slice(startIndex, startIndex + modPathsChunkSize);

      workerDataObj.worker.postMessage({
        type: IpcMessageType.Start,
        payload: {
          allOblivionPaths: this._allOblivionPaths,
          modPaths: thisWorkersChunk,
          modDataFolderPath: this._modDataFolderPath,
        },
      } as IpcMessage<PathAnalysisWorkerArgs>);
    }

    await waitFor(() => workers.every((worker) => worker.isComplete));

    return {
      problemPaths,
      indepdenentPaths,
    };
  }

  public async fixPaths({ indepdenentPaths, problemPaths }: PathsAnalysisResult): Promise<void> {
    const problemPathsCopies = problemPaths.map((problemPath) => {
      const srcPath = problemPath.existingPath.realPath;
      const destPath = `${this.fixedFilesOutputPath}/${problemPath.correctedPath?.realRelativePath}`;

      ensureFileSync(destPath);

      return copy(srcPath, destPath, {
        preserveTimestamps: true,
        overwrite: true,
      });
    });
    const independentPathsCopies = indepdenentPaths.map((indepdenentPath) => {
      const srcPath = indepdenentPath.existingPath.realPath;
      const destPath = `${this.fixedFilesOutputPath}/${indepdenentPath.existingPath.realRelativePath}`;

      ensureFileSync(destPath);

      return copy(srcPath, destPath, {
        preserveTimestamps: true,
        overwrite: true,
      });
    });

    await Promise.all(problemPathsCopies);
    await Promise.all(independentPathsCopies);
  }

  public initPaths() {
    this._allOblivionPaths = [];
    this._allModPaths = [];

    function initPathArr(arr: Path[], dataFolderPath: string) {
      for (const entry of walkSync(dataFolderPath, {
        includeDirs: false,
        followSymlinks: false,
      })) {
        const realPath = entry.path;
        const normalizedPath = entry.path.toLowerCase();

        arr.push({
          realPath,
          realRelativePath: realPath.replace(dataFolderPath, ''),
          normalizedPath,
          normalizedRelativePath: normalizedPath.replace(dataFolderPath.toLowerCase(), ''),
        });
      }
    }

    initPathArr(this._allOblivionPaths, this._oblivionDataFolderPath);
    initPathArr(this._allModPaths, this._modDataFolderPath);
  }

  /**
   * @param maxWorkers
   *
   * @returns The number of workers that should actually be used based on the data this analyzer was initialized with.
   * For example, if there are only 2 mod paths to analyze and the `maxWorkers` is {@link DEFAULT_MAX_ANALYSIS_WORKERS}, this function will
   * return 2 because it can only break up the work two times at most.
   */
  private determineActualNumWorkers(maxWorkers: number): number {
    return this._allModPaths.length < maxWorkers ? this._allModPaths.length : maxWorkers;
  }
}
