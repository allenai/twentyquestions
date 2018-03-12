/** Settings and configuration */


/**
 * The current environment.
 *
 * The current environment. This constant should be one of `'local'`,
 * or `'live'`. local settings imply that we're using separate
 * servers for the frontend and the backend. `'live'` implies that we're
 * serving from the crowdsense site.
 */
const env = 'live';


/**
 * The URL for the server's websocket.
 *
 * The URL for the server's websocket through which we'll communicate
 * about the current game state.
 */
const serverSocket = {
  local: 'http://127.0.0.1:5000/game-room',
  live: '/game-room'
}[env];


/** URL regex for extracting the room id and player id. */
const gameRoomUrlRegex = /twenty-questions\/game-room\/(.*)\/player\/([^?]*)/;


/** Settings to be exported. */
const settings = {
  serverSocket,
  gameRoomUrlRegex
};


export default settings;
