/** Settings and configuration */


/**
 * The current environment.
 *
 * The current environment. This constant should be one of `'local'`,
 * `'dev'` or `'prod'`. local settings imply that we're using separate
 * servers for the frontend and the backend. `'dev'` implies we want to
 * test against the MTurk sandbox, and `'prod'` implies that we're
 * running with live Turkers.
 */
const env = 'dev';


/**
 * The URL for the server's websocket.
 *
 * The URL for the server's websocket through which we'll communicate
 * about the current game state.
 */
const serverSocket = {
  local: 'http://127.0.0.1:5000/game-room',
  dev: '/game-room',
  prod: '/game-room'
}[env];


/** URL regex for extracting the room id and player id. */
const gameRoomUrlRegex = /twenty-questions\/game-room\/(.*)\/player\/(.*)/;


/** MTurk results endpoint. */
const turkResultsEndpoint = {
  local: 'https://workersandbox.mturk.com/mturk/externalSubmit',
  dev: 'https://workersandbox.mturk.com/mturk/externalSubmit',
  prod: 'https://www.mturk.com/mturk/externalSubmit'
}[env];


/** Settings to be exported. */
const settings = {
  env,
  serverSocket,
  gameRoomUrlRegex,
  turkResultsEndpoint
};


export default settings;
