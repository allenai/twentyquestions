/** A controller for coordinating the server, the models, and UI */

import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';

import {parseQueryString} from '../utilities/urls';
import settings from './settings';


/** A class for coordinating the server, models, and UI. */
class Controller {
  /**
   * Create a Controller instance.
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
     * This websocket is used to maintain state between the server and
     * the clients. There are three main events that occur along the
     * socket, `'setClientState'` and `'setServerGameState'` and
     * `'takePlayerAction'`.
     */
    this._socket = null;
    /** The player for this client. */
    this.player = null;
    /** The entire state of the game room that the player is in. */
    this.gameRoom = null;
  }

  /**
   * Initialize the game.
   *
   * Initialize the game, setting up this controller and connecting to
   * the server.
   */
  initialize() {
    // parse the query string
    const queryParams = parseQueryString(window.location.href);

    // check that the required query parameters are present
    if (queryParams.hitId === undefined) {
      throw new Error('No HIT ID found.');
    }
    if (queryParams.assignmentId === undefined) {
      throw new Error('No Assignment ID found.');
    }
    if (queryParams.workerId === undefined) {
      throw new Error('No Worker ID found.');
    }

    // if the turkers view the game in preview mode, then the assignment
    // id is marked as unavailable in which case we'll store it as
    // `null`.
    const playerId = (
      queryParams.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE' ?
        null
        : queryParams.workerId
    );

    // open up the socket
    this._socket = io.connect(settings.serverSocket);

    // subscribe to the `'setClientState'` event
    this._socket.on(
      'setClientState',
      (message) => this.setClientState(message)
    );

    // after the connection is successful, join the game room
    this._socket.on(
      'connect',
      (message) => this.joinServer(playerId)
    );

    this.renderView();
  }

  /**
   * Join the game room on the server.
   *
   * @param {String} playerId - The ID for the player.
   */
  joinServer(playerId) {
    this._socket.emit('joinServer', {playerId});
  }

  /**
   * Set the game room state on this client.
   *
   * Set the game room state on this client. This function is
   * primarily intended as a callback for the 'setClientState'
   * event.
   *
   * @param {Object} message - The message from the server which
   *   contains the new game room state for the client.
   */
  setClientState(message) {
    if (settings.shouldLog) {
      console.log(
        `Setting client state:`
          + `\n${JSON.stringify(message, null, 2)}`
      );
    }

    this.player = this.model.Player.fromObject(message.player);
    this.gameRoom = message.gameRoom
      && this.model.GameRoom.fromObject(message.gameRoom);

    this.renderView();
  }

  /** Set the state of the game on the server. */
  setServerGameState() {
    const message = {
      player: this.player.toObject(),
      gameRoom: this.gameRoom.toObject()
    };

    if (settings.shouldLog) {
      console.log(
        `Updating server game state:`
          + `\n${JSON.stringify(message, null, 2)}`
      );
    }

    this._socket.emit('setServerGameState', message);
  }

  /** Render the view to reflect the current game state. */
  renderView() {
    ReactDOM.render(
      React.createElement(
        this.view,
        {
          gameRoom: this.gameRoom,
          player: this.player,
          controller: this
        },
        null
      ),
      document.getElementById('root')
    );
  }

  /**
   * Take an action in the game, updating the model, view and server.
   *
   * @param {String} methodName - The name of the method on the Game
   *   object that you wish to call.
   * @param {Array} args - The arguments with which you wish to call
   *   methodName.
   */
  takeGameAction(methodName, args) {
    this.gameRoom = this.gameRoom.copy({
      game: this.gameRoom.game[methodName](...args)
    });
    this.renderView();
    this.setServerGameState();
  }

  /**
   * Take an action on the player's state.
   *
   * Take an action on the player's state, updating the model, view and
   * server.
   *
   * @param {String} action - The name of the action to take.
   */
  takePlayerAction(action) {
    // update the local state of the player for certain states
    if (action === this.model.PLAYERACTIONS.STARTPLAYING) {
      this.player = this.player.copy({
        status: this.model.PLAYERSTATUSES.PLAYING
      });
    } else if (action === this.model.PLAYERACTIONS.GOINACTIVE) {
      this.player = this.player.copy({
        status: this.model.PLAYERSTATUSES.INACTIVE
      });
    } else if (action === this.model.PLAYERACTIONS.GOACTIVE) {
      this.player = this.player.copy({
        status: this.model.PLAYERSTATUSES.WAITING
      });
    }

    const message = {
      player: this.player.toObject(),
      action: action
    };

    if (settings.shouldLog) {
      console.log(
        `Taking player action: ${JSON.stringify(message, null, 2)}`)
      ;
    }

    // render the client
    this.renderView();

    // sync with the server
    this._socket.emit('takePlayerAction', message);
  }

  /**
   * Submit results to MTurk.
   */
  submitResults() {
    // extract the assignmentId and turkSubmitTo query string fields
    // from the url
    const queryParams = parseQueryString(window.location.href);

    // we want to create and post a form to MTurk.
    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute(
      'action',
      `${decodeURIComponent(queryParams.turkSubmitTo)}/mturk/externalSubmit`
    );

    const jsonField = document.createElement('input');
    jsonField.setAttribute('type', 'hidden');
    jsonField.setAttribute('name', 'gameRoomJson');
    jsonField.setAttribute('value', this.gameRoom.toJSON());
    form.appendChild(jsonField);

    const assignmentIdField = document.createElement('input');
    assignmentIdField.setAttribute('type', 'text');
    assignmentIdField.setAttribute('name', 'assignmentId');
    assignmentIdField.setAttribute('value', queryParams.assignmentId);
    form.appendChild(assignmentIdField);

    document.body.appendChild(form);
    form.submit();
  }
}


export default Controller;
