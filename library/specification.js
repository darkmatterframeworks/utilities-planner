import path from "path";
import R from "ramda";

import { readFile, writeFile } from "./io.js";
import { listCardsFromBoard, listLanesFromBoard, updateCard } from "./trello.js";

// Card : Object

// parseToDoFile :: String → [Object]
export const parseToDoFile = (data) => {
  let result;
  const $$regularExpression = /(?:\`\[)(\s|x)(?:\]\`\s+([\x00-\x7F]+?)\[\/\/\]:\s\#id\s\((\w+)\))/gm;
  const output = [];

  while (result = $$regularExpression.exec(data)) {
    const [ , statusSymbol, content, cardID ] = result;
    const [ cardName, ...commentList ] = content.split(/\s*[\n\r]+\s*/).filter(fragment => fragment !== '');
    output.push({ cardID, cardName, cardStatus: (statusSymbol === 'x') ? 'Done' : 'InProgress', commentList });
  }

  return output;
};

// parseSpecificationFile :: String → [Card]
export const parseSpecificationFile = R.compose(
  R.map(
    R.compose(
      R.apply(
        R.useWith(
          (cardName, cardDescription, attributes) => {
            const { id: cardID } = attributes;

            return {
              desc: cardDescription.trim(),
              id: cardID,
              name: cardName.trim()
            }
          },
          [
            R.identity,
            R.identity,
            R.compose(
              R.reduce(
                (accumulator, [ propertyName, propertyValue ]) =>
                  R.set(R.lensProp(propertyName), propertyValue, accumulator),
                {}
              ),
              R.map(
                R.compose(
                  R.slice(1, Infinity),
                  R.match(/(?:\[\/\/\]: #)(\w+)(?:\s\()([\x00-\x7F]+?)(?:\))/)
                )
              ),
              R.split('\n\n')
            )
          ]
        )
      ),
      R.slice(1, Infinity),
      R.match(/(?:#\s+)([\w\s\d]+?)(?:\n+)([\x00-\x7F]*?)(\[\/\/\][\x00-\x7F]*)/),
    )
  ),
  R.split(/\n+---\n+/)
);

// composeSpecificationFile :: [Card] → String
export const composeSpecificationFile = R.reduce(
  (accumulator, card) => {
    const {
      desc: cardDescription = '[Description missing]',
      id: cardID,
      labels: cardLabelList = [ { name: '[Label missing]' } ],
      name: cardName = ''
    } = card;

    return R.join(
      accumulator !== '' ? '\n\n---\n\n' : '',
      [
        accumulator,
        R.join(
          '\n\n',
          [
            `# ${cardName}`,
            cardDescription,
            `[//]: #labels (${R.join(', ', R.map(label => label.name, cardLabelList))})`,
            `[//]: #id (${cardID})`
          ]
        )
      ]
    );
  },
  ''
);

// composeToDoFile :: [Object] → String → String
export const composeToDoFile = R.curry(
  (options, cardList) =>
    R.reduce(
      (accumulator, card) => {
        const {
          id: cardID,
          lane = null,
          name: cardName = ''
        } = card;

        //196607
        if (lane.pos < options.laneWeightByStatusName['InProgress']) return accumulator;

        return R.join(
          '\n',
          [
            accumulator,
            `\`[${(lane.pos > options.laneWeightByStatusName['InProgress']) ? 'x' : ' '}]\` ${cardName}  \n`,
            `  [//]: #id (${cardID})`,
            ''
          ]
        );
      },
      '# TODO\n'
    )(cardList)
);

// readAndParseSpecificationFile :: String → Object → Promise Object
export const readAndParseSpecificationFile = R.curry(
  (options, boardID) =>
    R.compose(
      R.andThen(
        R.compose(
          R.map(
            ({ id: cardID, ...attributes }) => updateCard(options, cardID, attributes)
          ),
          parseSpecificationFile
        )
      ),
      R.thunkify(readFile)(options.sourcePath)
    )(boardID)
);

// readParseAndUploadToDoFile :: String → Object → Promise Object
export const readParseAndUploadToDoFile = R.curry(
  (options, boardID) =>
    R.compose(
      R.andThen(
        R.compose(
          R.map(
            ({ id: cardID, ...attributes }) => updateCard(options, cardID, attributes)
          ),
          parseToDoFile
        )
      ),
      R.thunkify(readFile)(options.sourcePath)
    )(boardID)
);

// composeAllFiles :: [[Card], [Lane]] -> [String]
export const composeAllFiles = R.juxt(
  [
    R.compose(
      composeToDoFile({
        laneWeightByStatusName: {
          InProgress: 196607,
          Done: 393215
        }
      }),
      R.apply(
        R.useWith(
          (laneByID, cardList) =>
            R.map(
              card =>
                R.set(
                  R.lensProp('lane'),
                  R.view(R.lensProp(card.idList), laneByID),
                  card
                )
            )(cardList),
          [
            R.reduce(
              (accumulator, lane) => R.set(R.lensProp(lane.id), lane, accumulator),
              {}
            ),
            R.identity
          ]
        )
      )
    ),
    R.compose(
      composeSpecificationFile,
      R.last
    )
  ]
);

// downloadComposeAndWriteAllFiles :: String → Object → [Promise Object]
export const downloadComposeAndWriteAllFiles = R.curry(
  (options, boardID) =>
    R.compose(
      R.andThen(
        R.compose(
          R.apply(
            R.useWith(
              (...argumentList) => Promise.all(argumentList).then(() => ({})),
              [
                writeFile(path.join(options.workingDirectoryPath, path.dirname(options.destinationPath), 'TODO.md')),
                writeFile(path.join(options.workingDirectoryPath, options.destinationPath))
              ]
            )
          ),
          composeAllFiles
        )
      ),
      ($$promiseList) => Promise.all($$promiseList),
      R.juxt(
        [
          listLanesFromBoard(options),
          listCardsFromBoard(options)
        ]
      )
    )(boardID)
);