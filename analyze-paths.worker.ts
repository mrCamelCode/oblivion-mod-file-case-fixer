import { AnalyzedPath, IpcMessage, IpcMessageType, PathAnalysisWorkerArgs, PathsAnalysisResult } from './model.ts';

// @ts-ignore
addEventListener('message', handleMessage);

function analyzePaths({ modPaths, allOblivionPaths, modDataFolderPath }: PathAnalysisWorkerArgs): void {
  const problemPaths: AnalyzedPath[] = [];
  const indepdenentPaths: AnalyzedPath[] = [];

  modPaths.forEach((modPath) => {
    const matchingPath = allOblivionPaths.find((oblivionPath) => {
      return oblivionPath.normalizedRelativePath === modPath.normalizedRelativePath;
    });

    if (matchingPath) {
      if (matchingPath.realRelativePath !== modPath.realRelativePath) {
        const correctedRealPath = `${modDataFolderPath}${matchingPath.realRelativePath}`;

        problemPaths.push({
          existingPath: modPath,
          correctedPath: {
            realPath: correctedRealPath,
            realRelativePath: matchingPath.realRelativePath,
            normalizedPath: correctedRealPath.toLowerCase(),
            normalizedRelativePath: matchingPath.realRelativePath.toLowerCase(),
          },
        });
      } else {
        indepdenentPaths.push({
          existingPath: modPath,
        });
      }
    } else {
      const bestPartialMatchingPathMetadata = allOblivionPaths
        .map((oblivionPath) => {
          const oblivionPathNormalizedParts = oblivionPath.normalizedRelativePath.split('/').filter(Boolean);
          const oblivionPathParts = oblivionPath.realRelativePath.split('/').filter(Boolean);

          const modPathNormalizedParts = modPath.normalizedRelativePath.split('/').filter(Boolean);
          const modPathParts = modPath.realRelativePath.split('/').filter(Boolean);

          const matchingOblivionPathParts: string[] = [];

          let matchLevel = 0;
          for (let i = 0; i < modPathNormalizedParts.length; i++) {
            const modPart = modPathNormalizedParts[i];
            const oblivionPart = oblivionPathNormalizedParts[i];

            if (modPart === oblivionPart) {
              matchLevel += 1;

              matchingOblivionPathParts.push(oblivionPathParts[i]);
            } else {
              break;
            }
          }

          const correctedRealRelativePath = `/${matchingOblivionPathParts.join('/')}/${modPathParts
            .slice(matchingOblivionPathParts.length)
            .join('/')}`;

          return {
            matchLevel,
            correctedRealRelativePath,
            isExactMatchExceptFilename:
              oblivionPath.realRelativePath.substring(0, oblivionPath.realRelativePath.lastIndexOf('/')) ===
              modPath.realRelativePath.substring(0, modPath.realRelativePath.lastIndexOf('/')),
          };
        })
        .filter((matchData) => matchData.matchLevel > 0)
        .sort(function sortDescendingMatchLevelFavorExacts(a, b) {
          if (a.isExactMatchExceptFilename && !b.isExactMatchExceptFilename) {
            return -1;
          } else if (!a.isExactMatchExceptFilename && b.isExactMatchExceptFilename) {
            return 1;
          } else if (a.matchLevel > b.matchLevel) {
            return -1;
          } else if (a.matchLevel < b.matchLevel) {
            return 1;
          }

          return 0;
        })[0];

      if (
        bestPartialMatchingPathMetadata &&
        !bestPartialMatchingPathMetadata.isExactMatchExceptFilename &&
        modPath.realRelativePath !== bestPartialMatchingPathMetadata.correctedRealRelativePath
      ) {
        const correctedRealPath = `${modDataFolderPath}${bestPartialMatchingPathMetadata.correctedRealRelativePath}`;

        problemPaths.push({
          existingPath: modPath,
          correctedPath: {
            realPath: correctedRealPath,
            realRelativePath: bestPartialMatchingPathMetadata.correctedRealRelativePath,
            normalizedPath: correctedRealPath.toLowerCase(),
            normalizedRelativePath: bestPartialMatchingPathMetadata.correctedRealRelativePath.toLowerCase(),
          },
        });
      } else {
        indepdenentPaths.push({
          existingPath: modPath,
        });
      }
    }
  });

  // @ts-ignore
  self.postMessage({
    type: IpcMessageType.Finished,
    payload: {
      indepdenentPaths,
      problemPaths,
    },
  } as IpcMessage<PathsAnalysisResult>);
}

function handleMessage(event: MessageEvent) {
  const { type, payload } = (event.data as IpcMessage) ?? {};

  if (type === IpcMessageType.Start) {
    analyzePaths(payload as PathAnalysisWorkerArgs);
  }
}
