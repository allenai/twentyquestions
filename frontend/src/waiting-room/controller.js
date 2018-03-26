/** A controller for coordinating the server, the models, and UI. */

import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';

import settings from './settings.js';


/** A class for coordinating the server, models, and UI. */
class WaitingRoomController {
  /**
   * Create a controller instance.
   *
   * @param {WaitingRoomView} view - The view for the application.
   * @param {WaitingRoomModel} model - The model for the application.
   *
   * @return {WaitingRoomController} The new controller instance.
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
    /** A representation of the waiting room. */
    this.waitingRoom = null;
  }

  /**
   * Initialize the waiting room.
   *
   * Initialize the waiting room, setting up this controller and connecting
   * to the server.
   */
  initialize() {
    // set the room id and the player id from the URL query params
    const queryParams = {};
    const [_, queryString] = window.location.href.split('?');
    if (queryString === undefined) {
      throw new Error('No query string found.');
    }
    const queryBits = queryString.split('&');
    for (let i = 0; i < queryBits.length; i++) {
      const [key, val] = queryBits[i].split('=');
      queryParams[key] = val;
    }
    if (queryParams.hitId === undefined) {
      throw new Error('No HIT ID found.');
    }
    if (queryParams.assignmentId === undefined) {
      throw new Error('No Assignment ID found.');
    }
    if (queryParams.workerId === undefined) {
      throw new Error('No Worker ID found.');
    }

    // if the turkers view it in preview mode, then the assignment id is
    // marked as unavailable in which case we'll store it as `null`.
    const playerId = queryParams.assignmentId != 'ASSIGNMENT_ID_NOT_AVAILABLE' ?
      queryParams.workerId
      : null;
    this.waitingRoom = this.model.WaitingRoom.fromObject({
      playerId: playerId,
      roomId: null,
      state: this.model.STATES.WAITING
    });

    // open up the socket
    this._socket = io.connect(settings.serverSocket);
    // subscribe to the `'setClientWaitingRoom'` event
    this._socket.on(
      'readyToPlay',
      this.handleReadyToPlay.bind(this)
    );
    // after the connection is successful, join the game room
    this._socket.on(
      'connect',
      this.joinWaitingRoom.bind(this)
    );

    this.renderView();
  }

  /** Join the waiting room on the server. */
  joinWaitingRoom() {
    const {playerId} = this.waitingRoom;

    this._socket.emit('joinWaitingRoom', {playerId});
  }

  /**
   * Handle a 'readyToPlay' message.
   *
   * When a game is ready to play, the server sends the client a message
   * containing the game room's id. This callback handles that message.
   *
   * @param {Object} message - The message from the server which
   *   contains the new waiting room state for the client.
   */
  handleReadyToPlay(message) {
    const {roomId} = message;

    this.waitingRoom = this.waitingRoom.copy({
      roomId: roomId,
      state: this.model.STATES.READYTOPLAY
    });
    this.renderView();
  }

  /** Set the player as active. */
  setPlayerAsActive() {
    const {playerId} = this.waitingRoom;

    // set the player as active
    this.waitingRoom = this.waitingRoom.copy({
      state: this.model.STATES.ACTIVE
    });
    this.renderView();

    // alert the server that the player is active
    this._socket.emit('setPlayerAsActive', {playerId});
  }

  /** Set the player as inactive. */
  setPlayerAsInactive() {
    const {playerId} = this.waitingRoom;

    // set the player to inactive
    this.waitingRoom = this.waitingRoom.copy({
      state: this.model.STATES.INACTIVE
    });
    this.renderView();

    // alert the server that the player is inactive
    this._socket.emit('setPlayerAsInactive', {playerId});
  }

  /** Render the view to reflect the current game state. */
  renderView() {
    ReactDOM.render(
      React.createElement(
        this.view,
        {
          waitingRoom: this.waitingRoom,
          controller: this
        },
        null
      ),
      document.getElementById('root')
    );
  }

  /** Enter the game room. */
  enterGameRoom() {
    const {roomId, playerId} = this.waitingRoom;

    const [_, queryString] = window.location.href.split('?');

    window.location.href = settings.makeGameRoomUrl(
      roomId,
      playerId,
      queryString
    );
  }
}


export default WaitingRoomController;
