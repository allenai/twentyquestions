/** A model of the waiting room. */



/* constants */

/** The possible states that the waiting room can be in */
const STATES = {
  WAITING: 'WAITING',
  READYTOPLAY: 'READYTOPLAY',
  INACTIVE: 'INACTIVE'
};



/* data models */


/** A class modeling the waiting room. */
class WaitingRoom {
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

  /**
   * Return a copy of this instance, updating attributes with data.
   *
   * @param {Object} data - An object containing key-value pairs to
   *   update in the newly returned instance.
   *
   * @return {Data} A copy of this instance with the attributes defined
   *   in data overriden.
   */
  copy(data) {
    return Object.assign(new this.constructor, this, data);
  }
}


/** The default export for Model */
const WaitingRoomModel = {
  STATES,
  WaitingRoom
};


export default WaitingRoomModel;
