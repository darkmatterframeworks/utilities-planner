import R from "ramda";

import { download, list, synchronize, upload } from "./library/cli.js";

const [ ,, actionName = "synchronize", ...argumentList ] = process.argv;

export const main = R.cond(
  [
    [ R.equals('synchronize'), R.thunkify(synchronize)(process.cwd(), ...argumentList) ],
    [ R.equals('upload'), R.thunkify(upload)(process.cwd(), ...argumentList) ],
    [ R.equals('download'), R.thunkify(download)(process.cwd(), ...argumentList) ],
    [
      R.equals('list'),
      R.compose(
        R.andThen(
          R.reduce(
            (accumulator, { id, name, ...resource }) =>
              R.join(
                '\n',
                [
                    accumulator,
                    `  ${name} (${id})` + ((argumentList[0] === 'lanes') ? ` [${resource.pos}]` : '')
                ]
              ),
            `# List of ${argumentList[0]}\n`
          )
        ),
        R.thunkify(list)(process.cwd(), argumentList)
      )
    ],
    [
      R.T, () =>
      Promise.reject(
        new Error(`Could not handle the command \`dmfx-planner ${[actionName, ...argumentList].join(' ')}\``)
      )
    ]
  ]
);

main(actionName)
  .then(
    output => console.log(output) && process.exit(0),
    error => console.error(error.message) && process.exit(1)
  )