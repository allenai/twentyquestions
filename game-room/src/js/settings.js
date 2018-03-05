/** Settings and configuration */


/**
 * The current environment.
 *
 * The current environment. This constant should be one of `'dev'` or
 * `'prod'`. Dev settings imply that we're using separate servers for
 * the frontend and the backend. `'prod'` implies that they're the same
 * server.
 */
const env = 'prod';


/**
 * The URL for the server's websocket.
 *
 * The URL for the server's websocket through which we'll communicate
 * about the current game state.
 */
const serverSocket = {
  dev: 'http://127.0.0.1:5000/game-room',
  prod: '/game-room'
}[env];


/** URL regex for extracting the room id and player id. */
const gameRoomUrlRegex = /twenty-questions\/game-room\/(.*)\/player\/(.*)/;


/** Settings to be exported. */
const settings = {
  env,
  serverSocket,
  gameRoomUrlRegex
};


export default settings;
