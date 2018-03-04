/** A controller for coordinating the server, the models, and UI. */

import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';

import settings from './settings.js';


/** A class for coordinating the server, models, and UI. */
class Controller {
  /**
   * Create a controller instance.
   *
   * @param {View} view - The view for the application.
   * @param {Model} model - The model for the application.
   *
   * @return {Controller} The new controller instance.
   */
  constructor(
    view,
    model
  ) {
    // bind attributes to instance
    this.view = view;
    this.model = model;

    // internally used attributes
    /**
     * The websocket connecting the client to the server.
     *
     * This websocket is used to maintain game state between the server
     * and the clients. There are two main events that occur along the
     * socket, `'setClientGameState'` and `'setServerGameState'`.
     */
    this._socket = null;
    /** The ID for the waiting room that the player is currently in. */
    this.roomId = null;
    /** The ID for the player. */
    this.playerId = null;
    /** The currently known state of the waiting room. */
    this.waitingRoom = null;
  }

  /**
   * Initialize the waiting room.
   *
   * Initialize the waiting room, setting up this controller and connecting
   * to the server.
   */
  initializeWaitingRoom() {
    // set the room id and the player id from the URL
    const urlMatches = settings.waitingRoomUrlRegex.exec(
      window.location.href
    );
    if (urlMatches === null) {
      throw new Error('Failed to match against URL.');
    }
    const [_, roomId, playerId] = urlMatches;
    this.roomId = roomId;
    this.playerId = playerId;

    // open up the socket
    this._socket = io.connect(settings.serverSocket);
    // subscribe to the `'setClientWaitingRoom'` event
    this._socket.on(
      'setClientWaitingRoom',
      this.setClientWaitingRoom.bind(this)
    );
    // after the connection is successful, join the game room
    this._socket.on(
      'connect',
      this.joinWaitingRoom.bind(this)
    );
  }

  /** Join the waiting room on the server. */
  joinWaitingRoom() {
    const {roomId, playerId} = this;

    console.log(
      `Asking to join waiting room ${roomId} as player ${playerId}.`
    );

    this._socket.emit('joinWaitingRoom', {roomId, playerId});
  }

  /**
   * Set the waiting room state on this client.
   *
   * Set the waiting room state on this client. This function is
   * primarily intended as a callback for the 'setClientWaitingRoom'
   * event.
   *
   * @param {Object} message - The message from the server which
   *   contains the new waiting room state for the client.
   */
  setClientWaitingRoom(message) {
    const waitingRoomObject = message;

    console.log(
      `Updating waiting room to:`
        + `\n${JSON.stringify(waitingRoomObject, null, 2)}`
    );

    this.waitingRoom = this.model.WaitingRoom.fromObject(
      waitingRoomObject
    );
    this.renderView();
  }

  /** Render the view to reflect the current game state. */
  renderView() {
    ReactDOM.render(
      React.createElement(
        this.view,
        {
          waitingRoom: this.waitingRoom,
          enterGameRoom: this.enterGameRoom.bind(this)
        },
        null
      ),
      document.getElementById('root')
    );
  }

  /** Enter the game room. */
  enterGameRoom() {
    const {roomId, playerId} = this;

    console.log(`Entering game room ${roomId} as ${playerId}.`);

    window.location.href = settings.makeGameRoomUrl(roomId, playerId);
  }
}


export default Controller;
