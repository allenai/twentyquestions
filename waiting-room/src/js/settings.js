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


/**
 * The URL for the server's websocket.
 *
 * The URL for the server's websocket through which we'll communicate
 * about the current game state.
 */
const serverSocket = {
  local: 'http://127.0.0.1:5000/waiting-room',
  live: '/waiting-room'
}[env];


/**
 * Create the URL for a game room.
 *
 * @param {String} roomId - The ID for the game room.
 * @param {String} playerId - The ID for the player to enter as.
 *
 * @return {String} The game room's URL.
 */
function makeGameRoomUrl(roomId, playerId) {
  return `/twenty-questions/game-room/${roomId}/player/${playerId}`;
}


/** Settings to be exported. */
const settings = {
  serverSocket,
  makeGameRoomUrl
};


export default settings;
