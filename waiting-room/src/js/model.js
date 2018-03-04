/** A model of the waiting room. */


/** A class modeling the waiting room. */
class WaitingRoom {
  /**
   * A model of the waiting room.
   *
   * @param {String} roomId - the number of players currently in the
   *   waiting room.
   * @param {Array[String]} playerIds - a list of identifiers for the
   *   players present in the room.
   * @param {Number} quorum - the number of players that constitutes a
   *   quorum, i.e. after which the game will start.
   */
  constructor(roomId, playerIds, quorum) {
    // bind attributes to instance
    this.roomId = roomId;
    this.playerIds = playerIds;
    this.quorum = quorum;
  }

  toObject() {
    return {
      roomId: this.roomId,
      playerIds: this.playerIds,
      quorum: this.quorum
    };
  }

  static fromObject(obj) {
    return new WaitingRoom(
      obj.roomId,
      obj.playerIds,
      obj.quorum
    );
  }
}


/** The default export for Model */
const model = {
  WaitingRoom
};


export default model;
