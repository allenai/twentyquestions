/** Settings and configuration */


/**
 * The current environment.
 *
 * The current environment. This constant should be one of `'local'`,
 * or `'live'`. local settings imply that we're using separate
 * servers for the frontend and the backend. `'live'` implies that we're
 * serving from the twentyquestions site.
 */
const env = 'live';


/** Whether or not to log. */
const shouldLog = {
  local: true,
  live: false
}[env];


/**
 * The URL for the server's websocket.
 *
 * The URL for the server's websocket through which we'll communicate
 * about the current game state.
 */
const serverSocket = {
  local: 'http://127.0.0.1:5000/',
  live: '/'
}[env];


/** URL regex for extracting the room id and player id. */
const gameRoomUrlRegex = /game-room\/(.*)\/player\/([^?]*)/;


/** Settings to be exported. */
const settings = {
  shouldLog,
  serverSocket,
  gameRoomUrlRegex
};


export default settings;
