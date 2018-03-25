/** A model of the waiting room. */

import Data from '../utilities/data';


/* constants */

/** The possible states that the waiting room can be in */
const STATES = {
  WAITING: 'WAITING',
  READYTOPLAY: 'READYTOPLAY',
  INACTIVE: 'INACTIVE'
};



/* data models */


/** A class modeling the waiting room. */
class WaitingRoom extends Data {
  /**
   * A model of the waiting room.
   *
   * @param {String} playerId - the identifier for this player.
   * @param {Optional[String]} roomId - the id for the game room that
   *   the player will enter. If roomId is not present, it must be null.
   * @param {String} state - the current state of the waiting room. Must
   *   be one of the values enumerated in the STATES constant.
   */
  constructor(playerId, roomId, state) {
    super();

    // bind attributes to instance
    this.playerId = playerId;
    this.roomId = roomId;
    this.state = state;
  }

  toObject() {
    return {
      playerId: this.playerId,
      roomId: this.roomId,
      state: this.state
    };
  }

  static fromObject(obj) {
    return new WaitingRoom(
      obj.playerId,
      obj.roomId,
      obj.state
    );
  }
}


/** The default export for Model */
const WaitingRoomModel = {
  STATES,
  WaitingRoom
};


export default WaitingRoomModel;
