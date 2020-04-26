import axios from "axios";
import R from "ramda";

// addCommentToCard :: Object → String → String → Promise Object
export const addCommentToCard = R.curry(
  (options, cardID, comment) => {
    const {
      authenticationKey = process.env.DMFX_TRELLO_AUTHENTICATION_KEY,
      authorizationToken = process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN
    } = options;

    return axios.put(
      `https://api.trello.com/1/cards/${cardID}/actions/comments?key=${authenticationKey}&token=${authorizationToken}&text=${comment}`
    )
      .then(response => response.data);
  }
);

// listBoards :: Object → Promise [Object]
export const listOwnBoards = R.curry(
  (options, userID) => {
    const {
      authenticationKey = process.env.DMFX_TRELLO_AUTHENTICATION_KEY,
      authorizationToken = process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN
    } = options;

    return axios.get(
      `https://api.trello.com/1/members/${userID}/boards?key=${authenticationKey}&token=${authorizationToken}`
    )
      .then(response => response.data);
  }
);

// listCardsFromBoard :: Object → String → Promise [Object]
export const listCardsFromBoard = R.curry(
  (options, boardID) => {
    const {
      authenticationKey = process.env.DMFX_TRELLO_AUTHENTICATION_KEY,
      authorizationToken = process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN
    } = options;

    return axios.get(
      `https://api.trello.com/1/boards/${boardID}/cards/open?key=${authenticationKey}&token=${authorizationToken}`
    )
      .then(response => response.data);
  }
);

// listCommentsFromCard :: Object → String → Promise [Object]
export const listCommentsFromCard = R.curry(
  (options, cardID) => {
    const {
      authenticationKey = process.env.DMFX_TRELLO_AUTHENTICATION_KEY,
      authorizationToken = process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN
    } = options;

    return axios.get(
      `https://api.trello.com/1/cards/${cardID}/actions?key=${authenticationKey}&token=${authorizationToken}`
    )
      .then(response => response.data.filter(action => action.type === 'commentCard'));
  }
);

// listLanesFromBoard :: Object → String → Promise [Object]
export const listLanesFromBoard = R.curry(
  (options, boardID) => {
    const {
      authenticationKey = process.env.DMFX_TRELLO_AUTHENTICATION_KEY,
      authorizationToken = process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN
    } = options;

    return axios.get(
      `https://api.trello.com/1/boards/${boardID}/lists/open?key=${authenticationKey}&token=${authorizationToken}`
    )
      .then(response => response.data);
  }
);

export const retrieveOwnUser = (options) => {
  const {
    authenticationKey = process.env.DMFX_TRELLO_AUTHENTICATION_KEY,
    authorizationToken = process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN
  } = options;

  return axios.get(
    `https://api.trello.com/1/tokens/${authorizationToken}/member?key=${authenticationKey}`
  )
    .then(response => response.data);
}

// updateCard :: Object → String → Object → Promise Object
export const updateCard = R.curry(
  (options, cardID, attributes) => {
    const {
      authenticationKey = process.env.DMFX_TRELLO_AUTHENTICATION_KEY,
      authorizationToken = process.env.DMFX_TRELLO_AUTHORIZATION_TOKEN
    } = options;
    const queryString = R.compose(
      R.join('&'),
      R.values,
      R.mapObjIndexed((propertyValue, propertyName) => `${propertyName}=${encodeURIComponent(propertyValue)}`)
    )(attributes);

    return axios.put(
      `https://api.trello.com/1/cards/${cardID}?key=${authenticationKey}&token=${authorizationToken}&${queryString}`
    )
      .then(response => response.data);
  }
);