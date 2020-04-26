import chai from "chai";
import mocha from "mocha";
import R from "ramda";

import {
  deserializeConfigurations
} from "./cli.js";

mocha.suite("CLI Unit test", function () {

  mocha.suite("#deserializeConfigurations", function () {
    const input = `trello:authentication-key={Authentication Key}
trello:authorization-token={Authorization Token}
trello:board-id={Board ID}
trello:lane:InProgress:character= 
trello:lane:InProgress:weight=196607
trello:lane:Done:character=x
trello:lane:Done:weight=393215`;

    mocha.test("String → Object", function () {
      const output = deserializeConfigurations(input);

      chai.expect(output).to.be.an('object');
    });

    mocha.test("Deserialize the configurations.", function () {
      const output = deserializeConfigurations(input);

      chai.expect(output).to.deep.equal(
        {
          authenticationKey: '{Authentication Key}',
          authorizationToken: '{Authorization Token}',
          boardID: '{Board ID}',
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

  });

});