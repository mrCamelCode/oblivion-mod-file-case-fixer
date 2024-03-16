export interface ScriptArgs {
  oblivionDataFolder: string;
  modDataFolder: string;
  maxAnalysisWorkers: number;
}

export interface Path {
  /**
   * The actual path to the file, all case included.
   */
  realPath: string;
  /**
   * The actual path to the file, relative to the data folder.
   *
   * For example, if the `realPath` is `~/Games/Oblivion/Data/Meshes/Characters/Argonian/tail.nif`,
   * this will be `/Meshes/Characters/Argonian/tail.nif`.
   */
  realRelativePath: string;
  /**
   * The path in all lowercase, to make case-insensitive checks possible.
   */
  normalizedPath: string;
  /**
   * The path in all lowercase, relative to the data folder.
   *
   * For example, if the `normalizedPath` is `~/games/oblivion/data/meshes/characters/argonian/tail.nif`,
   * this will be `/meshes/characters/argonian/tail.nif`.
   */
  normalizedRelativePath: string;
}

export interface AnalyzedPath {
  existingPath: Path;
  correctedPath?: Path;
}

export interface PathsAnalysisResult {
  problemPaths: AnalyzedPath[];
  indepdenentPaths: AnalyzedPath[];
}

export interface IpcMessage<T = any> {
  type: IpcMessageType;
  payload: T;
}

export enum IpcMessageType {
  Start,
  Finished,
}

export interface PathAnalysisWorkerArgs {
  modPaths: Path[];
  allOblivionPaths: Path[];
  modDataFolderPath: string;
}
