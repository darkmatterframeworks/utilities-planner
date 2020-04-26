import path from "path";
import R from "ramda";

import { readFile } from "./io.js";
import { readAndParseSpecificationFile, downloadComposeAndWriteAllFiles } from "./specification.js";
import { listOwnBoards, listCardsFromBoard, listLanesFromBoard, retrieveOwnUser } from "./trello.js";

const parseSpineCaseToCamelCase = (string) => string.replace(/(\-\w)/g, (match) => match[1].toUpperCase());

// deserializeConfigurations :: String → Object
export const deserializeConfigurations = R.compose(
  R.reduce(
    (accumulator, argumentList) =>
      R.assocPath(
        R.slice(
          0,
          argumentList.length - 1,
          argumentList
        ).map(
          R.compose(
            R.replace('Id', 'ID'),
            parseSpineCaseToCamelCase
          )
        ),
        R.last(argumentList),
        accumulator
      ),
    {}
  ),
  R.map(
    R.compose(
      R.slice(1, Infinity),
      R.split(/[:|=]/g)
    )
  ),
  R.split(/\n/g)
);

// download :: (String, String) → [Promise Object]
export const download = (workingDirectoryPath, boardID, destinationPath) => R.compose(
  R.andThen(
    configurations =>
      downloadComposeAndWriteAllFiles({ ...configurations, destinationPath, workingDirectoryPath }, boardID)
  ),
  R.thunkify(readConfigurationFile)(path.join(workingDirectoryPath, '.dmfx'))
)();

export const readConfigurationFile = R.compose(
  R.andThen(deserializeConfigurations),
  readFile
);

export const list = (workingDirectoryPath, argumentList) => R.compose(
  R.apply(
    R.useWith(
      async (method, argumentList, configurations) =>
        method((await configurations), ...argumentList),
      [
        R.compose(
          R.cond(
            [
              [
                R.equals('boards'),
                () => (configurations) =>
                  R.compose(
                    R.andThen(
                      R.compose(
                        listOwnBoards(configurations),
                        R.prop('id')
                      )
                    ),
                    R.thunkify(retrieveOwnUser)(configurations)
                  )()
              ],
              [ R.equals('cards'), () => listCardsFromBoard ],
              [ R.equals('lanes'), () => listLanesFromBoard ]
            ]
          ),
          R.head
        ),
        R.identity,
        R.identity
      ]
    )
  ),
  R.append(readConfigurationFile(path.join(workingDirectoryPath, '.dmfx'))),
  R.splitAt(1)
)(argumentList);

// upload :: (String, String) → [Promise Object]
export const upload = (boardID, sourcePath) => R.compose(
  R.andThen(
    configurations => readAndParseSpecificationFile({ ...configurations, sourcePath }, boardID)
  ),
  R.thunkify(readConfigurationFile)(path.join(workingDirectoryPath, '.dmfx'))
);

// synchronize :: (String, String) → [Promise Object]
export const synchronize = (boardID, destinationPath) => R.compose(
  R.andThen(R.thunkify(download)(boardID, destinationPath)),
  R.thunkify(upload)(boardID, destinationPath)
)();
