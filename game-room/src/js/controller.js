/** A controller for coordinating the server, the models, and UI */

import io from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';

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
     * This websocket is used to maintain game state between the server
     * and the clients. There are two main events that occur along the
     * socket, `'setClientGameState'` and `'setServerGameState'`.
     */
    this._socket = null;
    /** The ID for the room that the player is currently in. */
    this.roomId = null;
    /** The ID for the player. */
    this.playerId = null;
    /** The currently known state of the game. */
    this.game = null;
  }

  /**
   * Initialize the game.
   *
   * Initialize the game, setting up this controller and connecting to
   * the server.
   */
  initializeGame() {
    // set the room id and the player id from the URL
    const urlMatches = settings.gameRoomUrlRegex.exec(window.location.href);
    if (urlMatches === null) {
      throw new Error('Failed to match against URL.');
    }
    const [_, roomId, playerId] = urlMatches;
    this.roomId = roomId;
    this.playerId = playerId;

    // open up the socket
    this._socket = io.connect(settings.serverSocket);
    // subscribe to the `'setClientGameState'` event
    this._socket.on(
      'setClientGameState',
      this.setClientGameState.bind(this)
    );
    // after the connection is successful, join the game room
    this._socket.on(
      'connect',
      this.joinGameRoom.bind(this)
    );
  }

  /** Join the game room on the server. */
  joinGameRoom() {
    const {roomId, playerId} = this;

    this._socket.emit('joinGameRoom', {roomId, playerId});
  }

  /**
   * Set the game state on this client.
   *
   * Set the game state on this client. This function is primarily
   * intended as a callback for the 'setClientGameState' event.
   *
   * @param {Object} message - The message from the server which
   *   contains the new game state for the client.
   */
  setClientGameState(message) {
    const gameObject = message;

    this.game = this.model.Game.fromObject(gameObject);
    this.renderView();
  }

  /**
   * Set the game state on the server.
   *
   * Set the server's game state using this client's game state.
   */
  setServerGameState() {
    const {roomId, playerId, game} = this;

    this._socket.emit(
      'setServerGameState',
      {
        roomId,
        playerId,
        game: game.toObject()
      }
    );
  }

  /** Render the view to reflect the current game state. */
  renderView() {
    ReactDOM.render(
      React.createElement(
        this.view,
        {
          game: this.game,
          playerId: this.playerId,
          chooseSubject: this.chooseSubject.bind(this),
          askQuestion: this.askQuestion.bind(this),
          provideAnswer: this.provideAnswer.bind(this),
          makeGuess: this.makeGuess.bind(this),
          answerGuess: this.answerGuess.bind(this),
          submitResults: this.submitResults.bind(this)
        },
        null
      ),
      document.getElementById('root')
    );
  }

  /**
   * Update client and server game state using chooseSubject.
   *
   * @see model.Game
   */
  chooseSubject(playerId, subject) {
    this.game = this.game.chooseSubject(playerId, subject);
    this.renderView();
    this.setServerGameState();
  }

  /**
   * Update client and server game state using askQuestion.
   *
   * @see model.Game
   */
  askQuestion(askerId, questionText) {
    this.game = this.game.askQuestion(askerId, questionText);
    this.renderView();
    this.setServerGameState();
  }

  /**
   * Update client and server game state using provideAnswer.
   *
   * @see model.Game
   */
  provideAnswer(answererId, answerBool) {
    this.game = this.game.provideAnswer(answererId, answerBool);
    this.renderView();
    this.setServerGameState();
  }

  /**
   * Update client and server game state using makeGuess.
   *
   * @see model.Game
   */
  makeGuess(askerId, questionText) {
    this.game = this.game.makeGuess(askerId, questionText);
    this.renderView();
    this.setServerGameState();
  }

  /**
   * Update client and server game state using answerGuess.
   *
   * @see model.Game
   */
  answerGuess(answererId, answerBool) {
    this.game = this.game.answerGuess(answererId, answerBool);
    this.renderView();
    this.setServerGameState();
  }

  /**
   * Submit results to MTurk.
   */
  submitResults() {
    // extract the assignmentId and turkSubmitTo query string fields
    // from the url
    const queryParams = {};
    const queryBits = window.location.href.split('?')[1].split('&');
    for (let i = 0; i < queryBits.length; i++) {
      const [key, val] = queryBits[i].split('=');
      queryParams[key] = val;
    }

    // we want to create and post a form to MTurk.
    const form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute(
      'action',
      `${decodeURIComponent(queryParams.turkSubmitTo)}/mturk/externalSubmit`
    );

    const jsonField = document.createElement('input');
    jsonField.setAttribute('type', 'hidden');
    jsonField.setAttribute('name', 'gameJson');
    jsonField.setAttribute('value', this.game.toJSON());
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
