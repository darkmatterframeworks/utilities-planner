**DMFX**
# Planner

I love Markdown and how easy it is to get started working with Trello...  
So I made a utility to synchronize local Mardown files with my Trello boards.

## How does it work? 

When synchronizing with a Trello board, Planner creates two local Markdown files; the first one is a ToDo of every card
in the progress lane; the second is all the card's titles, descriptions.

I use the ToDo file to check-off all done tasks and to add comments to the card; the second file (which I will call
"specification file" from now on), is used to update the description of the card.

### Preview of a TODO file

```markdown
# TODO

`[x]` Design a planner  

  [//]: #id (5e6d3957ed149d016c745f6a)

`[ ]` Implement the Trello API  
  
  Only need to list cards, board and lane for now  
  
  Will need to be able to add comments to a specific card also...  

  [//]: #id (5e612abebbea073befd48234)
  
`[ ]` Implement the FS API  

```

### Preview of a Specification file

```markdown
# Design a planner

The Planner needs to synchronize a specification file and a ToDo file.

[//]: #labels (Priority 1, Backend, Private)

[//]: #id (5e6d3957ed149d016c745f6a)

---

# Implement the Trello API

We need to be able to list and update Trello cards.

| Method name          | API Reference                |
| -------------------- | ---------------------------- |
| `updateCard`         | [Trello][Trello Update Card] |
| `listCardsFromBoard` | [Trello][Trello List Cards]  |

[Trello Update Card]: https://developer.atlassian.com/cloud/trello/rest/#api-cards-id-put
[Trello List Cards]: https://developer.atlassian.com/cloud/trello/rest/#api-boards-id-cards-get

[//]: #labels (Priority 1, Backend, Private)
[//]: #id (5e612abebbea073befd48234)

```

## Getting started

First and foremost, you need a Trello account and an active board.  
Once you have those created, make sure you find your Trello Authentication key and Authorization token.  
You can get these by visiting [this page](Trello Authenticate User).

*Please note*: You will be prompt by Trello to create your app, and then you'll authorize yourself to use it; there is 
no remote service or anything; the key and token will never leave your computer.

[Trello Authenticate User]: https://trello.com/app-key/

Next, you need NodeJS version >= 13 installed as this project uses ECMAScript Modules (ESM).  

Install DMFX Planner using NPM:

```shell script
$ npm install @dmfx/utilities-planner
```

At the root of your project; create a configuration file as `.dmfx` and add your Authentication key and Authorization
token.

```shell script
$ cat <<EOF >.dmfx
trello:authentication-key={Obfuscated Authentication key}
trello:authorization-token={Obfuscated Authorization token}
EOF
```

You will need to edit your new configuration file to add a few more properties to optimize your experience...

### Edit the configuration file

| Property name                      | Description                                                                                     |
| ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `trello:board-id`                  | The ID of the Trello board you want to manage.                                                  |
| `trello:lane:InProgress:character` | The character that will represent cards that are in progress or idle. Prefer a white space ` `. |
| `trello:lane:InProgress:weight`    | The weight of the "In Progress" lane on your board.                                             |
| `trello:lane:Done:character`       | The character that will represent cards that are done. Prefer the letter X `x`.                 |
| `trello:lane:Done:weight`          | The weight of the "Done" lane on your board.                                                    |

#### Find your Board ID

Assuming that you correctly created your configuration file, you can easily find your preferred board's ID using the
DMFX Planner's CLI:

```shell script
$ dmfx-planner list boards

> # List of boards
>
>   My board ({Obfuscated Board ID})
> ...
```

Once you have the ID of your board, you can add it to your configuration file...

```shell script
$ cat <<EOF >>.dmfx
  
trello:board-id={Obfuscated Board ID}
EOF
```

#### Find your board's lane's weight

A Trello board is usually composed of lanes (or list); Each of your lanes has a weight (or position) assigned to it.
The weight is a positive integer that represents the current order of your lanes on your board; although these numbers
can change, it's pretty safe to assume you won't be moving your lanes around too often...

Assuming that you correctly created your configuration file and know your board's ID, you can use the DMFX Planner's CLI
to figure out the weight assigned to your lanes:

```shell script
$ dmfx-planner list lanes {Obfuscated Board ID}

> # List of lanes
>
>   Backlog ({Obfuscated Lane ID}) [65535]
>   To Do ({Obfuscated Lane ID}) [131071]
>   In Progress ({Obfuscated Lane ID}) [196607]
>   Test ({Obfuscated Lane ID}) [262143]
>   Deploy ({Obfuscated Lane ID}) [327679]
>   Done ({Obfuscated Lane ID}) [393215]
```

You can now edit the configuration file with the correct weights; in this example, I will use the weight for the lanes 
named "In Progress" (196607) and "Done" (393215). 

```shell script
$ cat <<EOF >>.dmfx
  
trello:lane:InProgress:character= 
trello:lane:InProgress:weight=196607
trello:lane:InProgress:character=x
trello:lane:InProgress:weight=393215
EOF
```

### Synchronize your project

Assuming that you've correctly setup your project, you can execute the `synchronize` action.

```shell script
$ dmfx-planner synchronize
```

This should result with two new files at the root of your project; `TODO.md` and `specification.md`.  
You're all set. Have fun...

## ToDo

I use the ToDo file for a few actions:

  * Check-off a task to move a card to the "Done" lane;
  * Add comments to a card;
  * Reorder cards;
  * Create new cards;
  
```markdown
# TODO

`[x]` Design a planner  

  [//]: #id (5e6d3957ed149d016c745f6a)

`[ ]` Implement the Trello API  
  
  Only need to list cards, board and lane for now  
  
  Will need to be able to add comments to a specific card also...  

  [//]: #id (5e612abebbea073befd48234)
  
`[ ]` Implement the FS API  

```
  
### The anatomy of the ToDo file
  
```markdown
# TODO

`[~x~]` ~ Title of the card ~

  ~ Optional comments separated by two new lines... ~

  [//]: #id (~ ID of the card ~])
```

#### Status of the card

The status of the card can be represented by a white space ` `, the letter X `x`, the exclamation mark `!` or the
question mark `?`.

By default, the characters are mapped as followed:

| Character | Status               |
| :-------- | :------------------- |
| ` `       | In Progress or lower |
| `?`       | Testing              |
| `!`       | Deployment           |
| `x`       | Done                 |

For obvious reason, only the white space ` ` and the letter X `x` must be used!

#### Title of the card

Well... The title of the card.

#### Optional comments

Any text added under an empty line below the title of the card will be treated as a new comment; you can separate
comments by an empty line `\n\n`.

#### ID of the card

The ID of the card must be kept around... *If the ID is missing*, the system will assume that you want to create a new
card!

## Specification file

```markdown
# Design a planner

The Planner need to synchronize a specification file and a ToDo file.

[//]: #labels (Priority 1, Backend, Private)

[//]: #id (5e6d3957ed149d016c745f6a)

---

# Implement the Trello API

Need to be able to list and update Trello cards.

| Method name          | API Reference                |
| -------------------- | ---------------------------- |
| `updateCard`         | [Trello][Trello Update Card] |
| `listCardsFromBoard` | [Trello][Trello List Cards]  |

[Trello Update Card]: https://developer.atlassian.com/cloud/trello/rest/#api-cards-id-put
[Trello List Cards]: https://developer.atlassian.com/cloud/trello/rest/#api-boards-id-cards-get

[//]: #labels (Priority 1, Backend, Private)
[//]: #id (5e612abebbea073befd48234)
```

### Anatomy of the Specification file

```markdown
# ~ Title of the card ~

~ Description of the card ~

[//]: #labels (~ Labels of the card ~)
[//]: #id (~ ID of the card ~)

---
```

## CLI

The CLI is pretty straightforward:

```shell script
$ dmfx-planner action [resource-type] [board-id]
```

| Action        | Description                                                                           |
| ------------- | ------------------------------------------------------------------------------------- |
| `download`    | Download the cards from the board and compose all the files                           |
| `upload`      | Parse all the files and upload the cards to the board                                 |
| `synchronize` | Execute upload then download.                                                         |
| `list`        | List `boards`, `lanes` or `cards`. You must specify the Board ID for lanes and cards. |
