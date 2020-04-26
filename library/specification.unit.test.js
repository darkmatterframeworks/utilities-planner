import chai from "chai";
import mocha from "mocha";
import R from "ramda";

import {
  composeAllFiles,
  composeSpecificationFile,
  composeToDoFile,
  parseSpecificationFile,
  parseToDoFile
} from "./specification.js";

mocha.suite("Specification Unit test", function () {

  mocha.suite("#composeAllFiles", function () {
    const input = [
      [
        {
          id: '5e6124b246996b7fd52d8a47',
          pos: 196607
        },
        {
          id: '5e6124c6b0e1a558a815d77b',
          pos: 393215
        }
      ],
      [
        {
          desc: "The planner need to synchronize a specification file and a ToDo file.",
          id: '5e6d3957ed149d016c745f6a',
          idList: '5e6124c6b0e1a558a815d77b',
          labels: [
            { name: 'Priority 1' },
            { name: 'Backend' },
            { name: 'Private' }
          ],
          name: "Design a planner",
        },
        {
          desc: "Need to be able to list and update Trello cards.",
          id: '5e612abebbea073befd48234',
          idList: '5e6124b246996b7fd52d8a47',
          labels: [
            { name: 'Priority 1' },
            { name: 'Backend' },
            { name: 'Private' }
          ],
          name: "Implement the Trello API"
        }
      ]
    ];

    mocha.test("[[Card], [Lane]] -> [String]", function () {
      const output = composeAllFiles(input);

      chai.expect(output).to.be.an('array');
      chai.expect(output).to.have.nested.property('[0]').to.be.a('string');
      chai.expect(output).to.have.nested.property('[1]').to.be.a('string');
    });

    mocha.test("Compose a list of Lanes and Cards into a string output.", function () {
      const output = composeAllFiles(input);

      chai.expect(output).to.deep.equal(
        [
          // ToDo file string output
          `# TODO

\`[x]\` Design a planner  

  [//]: #id (5e6d3957ed149d016c745f6a)

\`[ ]\` Implement the Trello API  

  [//]: #id (5e612abebbea073befd48234)
`,
          // Specification file string output
          `# Design a planner

The planner need to synchronize a specification file and a ToDo file.

[//]: #labels (Priority 1, Backend, Private)

[//]: #id (5e6d3957ed149d016c745f6a)

---

# Implement the Trello API

Need to be able to list and update Trello cards.

[//]: #labels (Priority 1, Backend, Private)

[//]: #id (5e612abebbea073befd48234)`
        ]
      );
    });

  });

  mocha.suite("#composeSpecificationFile", function () {
    const input = [
      {
        desc: "The planner need to synchronize a specification file and a ToDo file.",
        id: '5e6d3957ed149d016c745f6a',
        labels: [
          { name: 'Priority 1' },
          { name: 'Backend' },
          { name: 'Private' }
        ],
        name: "Design a planner",
      },
      {
        desc: "Need to be able to list and update Trello cards.",
        id: '5e612abebbea073befd48234',
        labels: [
          { name: 'Priority 1' },
          { name: 'Backend' },
          { name: 'Private' }
        ],
        name: "Implement the Trello API"

      }
    ];

    mocha.test("[Card] → String", function () {
      const output = composeSpecificationFile(input);

      chai.expect(output).to.be.a('string');
    });

    mocha.test("Compose a Card list into a string output.", function () {
      const output = composeSpecificationFile(input);

      chai.expect(output).to.equal(`# Design a planner

The planner need to synchronize a specification file and a ToDo file.

[//]: #labels (Priority 1, Backend, Private)

[//]: #id (5e6d3957ed149d016c745f6a)

---

# Implement the Trello API

Need to be able to list and update Trello cards.

[//]: #labels (Priority 1, Backend, Private)

[//]: #id (5e612abebbea073befd48234)`);
    });

  });

  mocha.suite("#composeToDoFile", function () {
    const input = [
      {
        id: '5e6d3957ed149d016c745f6a',
        lane: {
          pos: 393215
        },
        name: "Design a planner"
      },
      {
        id: '5e612abebbea073befd48234',
        lane: {
          pos: 196607
        },
        name: "Implement the Trello API"
      },
      {
        id: '5e9f0d6674b30e0707ae2e70',
        lane: {
          pos: 393215
        },
        name: "Implement the FS API"
      }
    ];
    const options = {
      laneWeightByStatusName: {
        InProgress: 196607,
        Done: 393215
      }
    };

    mocha.test("[Card] → String", function () {
      const output = composeToDoFile(options, input);

      chai.expect(output).to.be.a('string');
    });

    mocha.test("Compose a Card list into a string output", function () {
      const output = composeToDoFile(options, input);

      chai.expect(output).to.equal(`# TODO

\`[x]\` Design a planner  

  [//]: #id (5e6d3957ed149d016c745f6a)

\`[ ]\` Implement the Trello API  

  [//]: #id (5e612abebbea073befd48234)

\`[x]\` Implement the FS API  

  [//]: #id (5e9f0d6674b30e0707ae2e70)
`);
    });

  });

  mocha.suite("#parseSpecificationFile", function () {
    const input = `# Design a planner

The planner need to synchronize a specification file and a ToDo file.

[//]: #labels (Priority 1, Backend, Private)

[//]: #id (5e6d3957ed149d016c745f6a)

---

# Implement the Trello API

Need to be able to list and update Trello cards.

[//]: #labels (Priority 1, Backend, Private)

[//]: #id (5e612abebbea073befd48234)`;

    mocha.test("String → [Object]", function () {
      const output = parseSpecificationFile(input);

      chai.expect(output).to.be.an('array');
      chai.expect(output).to.have.nested.property('[0]').to.be.an('object');
      chai.expect(output).to.have.nested.property('[1]').to.be.an('object');
    });

    mocha.test("Parse a string input into a Card list", function () {
      const output = parseSpecificationFile(input);

      chai.expect(output).to.have.nested.property('[0].desc', "The planner need to synchronize a specification file and a ToDo file.");
      chai.expect(output).to.have.nested.property('[0].id', '5e6d3957ed149d016c745f6a');
      chai.expect(output).to.have.nested.property('[0].name', "Design a planner");
      chai.expect(output).to.have.nested.property('[1].desc', "Need to be able to list and update Trello cards.");
      chai.expect(output).to.have.nested.property('[1].id', '5e612abebbea073befd48234');
      chai.expect(output).to.have.nested.property('[1].name', "Implement the Trello API");
    });

  });

  mocha.suite("#parseToDoFile", function () {
    const input = `# TODO

\`[x]\` Design a planner  

  [//]: #id (5e971855074851091c5dda18)

\`[ ]\` Implement the Trello API  
  
  Only need to list cards, board and lane for now  
  
  Will need to be able to add comments to a specific card also...  

  [//]: #id (5e612abebbea073befd48234)
  
\`[x]\` Implement the FS API  

  [//]: #id (5e9f0d6674b30e0707ae2e70)`;

    mocha.test("String → [Object]", function () {
      const output = parseToDoFile(input);

      chai.expect(output).to.be.an('array');
      chai.expect(output).to.have.nested.property('[0]').to.be.an('object');
      chai.expect(output).to.have.nested.property('[1]').to.be.an('object');
      chai.expect(output).to.have.nested.property('[2]').to.be.an('object');
    });

    mocha.test("Parse a string input into a Card Status object", function () {
      const output = parseToDoFile(input);

      chai.expect(output).to.have.nested.property('[0].cardID', "5e971855074851091c5dda18");
      chai.expect(output).to.have.nested.property('[0].cardStatus', 'Done');
      chai.expect(output).to.have.nested.property('[0].commentList').to.be.an('array');
      chai.expect(output).to.have.nested.property('[0].commentList').to.have.length(0);
      chai.expect(output).to.have.nested.property('[1].cardID', "5e612abebbea073befd48234");
      chai.expect(output).to.have.nested.property('[1].cardStatus', 'InProgress');
      chai.expect(output).to.have.nested.property('[1].commentList').to.be.an('array');
      chai.expect(output).to.have.nested.property('[1].commentList').to.have.length(2);
      chai.expect(output).to.have.nested.property('[2].cardID', "5e9f0d6674b30e0707ae2e70");
      chai.expect(output).to.have.nested.property('[2].cardStatus', 'Done');
      chai.expect(output).to.have.nested.property('[2].commentList').to.be.an('array');
      chai.expect(output).to.have.nested.property('[2].commentList').to.have.length(0);

    });

  });

});