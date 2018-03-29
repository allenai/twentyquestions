/** Settings and configuration */


/**
 * The current environment.
 *
 * The current environment. This constant should be one of `'local'` or
 * `'live'`. Local settings imply that we're using separate servers for
 * the frontend and the backend. `'live'` implies that they're the same
 * server.
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


/** Number of seconds a player has to enter a game. */
const SECONDSTOPLAY = 10;


/** Settings to be exported. */
const settings = {
  shouldLog,
  serverSocket,
  SECONDSTOPLAY
};


export default settings;
