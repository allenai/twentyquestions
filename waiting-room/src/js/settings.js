/** Settings and configuration */


/**
 * The current environment.
 *
 * The current environment. This constant should be one of `'dev'` or
 * `'prod'`.
 */
const env = 'dev';


/**
 * The URL for the server's websocket.
 *
 * The URL for the server's websocket through which we'll communicate
 * about the current game state.
 */
const serverSocket = {
  dev: 'http://127.0.0.1:5000/waiting-room'
}[env];


/** URL regex for extracting the room id and player id. */
const waitingRoomUrlRegex = /\/#\/waiting-room\/(.*)\/player\/(.*)/;


/** Settings to be exported. */
const settings = {
  env,
  serverSocket,
  waitingRoomUrlRegex
};


export default settings;
