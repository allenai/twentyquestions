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
const waitingRoomUrlRegex = /twenty-questions\/waiting-room\/(.*)\/player\/(.*)/;


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
  env,
  serverSocket,
  waitingRoomUrlRegex,
  makeGameRoomUrl
};


export default settings;
