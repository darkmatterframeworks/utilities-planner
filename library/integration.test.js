import chai from "chai";
import fs from "fs";
import mocha from "mocha";
import path from "path";

import { download, list, readConfigurationFile } from "./cli.js";
import { downloadComposeAndWriteAllFiles } from "./specification.js";

mocha.describe("Integration test", function () {

  mocha.before(function () {

    return new Promise(
      (resolve, reject) =>
        fs.mkdir(
          path.join(process.cwd(), '.dump'),
          error => error ? reject(error) : resolve()
        )
    );
  });

  mocha.before(function () {

    return new Promise(
      (resolve, reject) =>
        fs.writeFile(
          path.join(process.cwd(), '.dump/.dmfx'),
          `trello:authentication-key=${process.env.DMFX_TRELLO_AUTHENTICATION_KEY}
trello:authorization-token=${process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN}
trello:board-id=${process.env.DMFX_TRELLO_BOARD_ID}
trello:lane:InProgress:character= 
trello:lane:InProgress:weight=196607
trello:lane:Done:character=x
trello:lane:Done:weight=393215`,
          error => error ? reject(error) : resolve()
        )
    )
  });

  mocha.after(function () {

    return new Promise(
      (resolve, reject) =>
        fs.rmdir(
          path.join(process.cwd(), '.dump'),
          { recursive: true },
          error => error ? reject(error) : resolve()
        )
    );
  });

  mocha.it("Reads the configurations", async function () {
    const configurations = await readConfigurationFile(path.join(process.cwd(), '.dump/.dmfx'));

    chai.expect(configurations).to.deep.equal(
      {
        authenticationKey: process.env.DMFX_TRELLO_AUTHENTICATION_KEY,
        authorizationToken: process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN,
        boardID: process.env.DMFX_TRELLO_BOARD_ID,
        lane: {
          InProgress: {
            character: ' ',
            weight: '196607'
          },
          Done: {
            character: 'x',
            weight: '393215'
          }
        }
      }
    );
  });

  mocha.it("Reads the configurations and creates a specification file and a ToDo file.", async function () {
    // This test is very limited as it just assumes there's an active Trello board and that the output files are
    // as expected.
    await download(path.join(process.cwd(), '.dump'), '5e61249c431bfb176829fadc', 'specification.md');

    const fileNameList = await retrieveAllFileNameOfDirectory(path.join(process.cwd(), '.dump'));

    chai.expect(fileNameList).to.include('specification.md');
    chai.expect(fileNameList).to.include('TODO.md');
  });

  mocha.it("Creates a specification file and a ToDo file.", async function () {
    // This test is very limited as it just assumes there's an active Trello board and that the output files are
    // as expected.
    await downloadComposeAndWriteAllFiles(
      { destinationPath: 'specification.md', workingDirectoryPath: path.join(process.cwd(), '.dump') },
      "5e61249c431bfb176829fadc"
    );

    const fileNameList = await retrieveAllFileNameOfDirectory(path.join(process.cwd(), '.dump'));

    chai.expect(fileNameList).to.include('specification.md');
    chai.expect(fileNameList).to.include('TODO.md');
  });

  mocha.it.only("Lists a given resource.", async function () {
    const boardList = await list(path.join(process.cwd(), '.dump'), [ 'boards' ]);

    chai.expect(boardList).to.be.an('array');
  });

});

function retrieveAllFileNameOfDirectory (directoryPath) {

  return new Promise(
    (resolve, reject) =>
      fs.readdir(
        directoryPath,
        (error, result) => error ? reject(error) : resolve(result)
      )
  );
}