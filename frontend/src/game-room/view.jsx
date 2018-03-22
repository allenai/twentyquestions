/** A view for rendering the data. */

import React from 'react';

import GameRoom from './components/GameRoom';


/**
 * The UI layer of the application.
 *
 * @prop {Game} game - An instance of the Game class modeling the
 *   whole game state.
 * @prop {String} playerId - The ID for the player using this
 *   client.
 * @prop {GameController} controller - The controller for the application.
 */
class GameView extends React.Component {
  render() {
    const {
      game,
      playerId,
      controller
    } =  this.props;

    return (
      <GameRoom
        game={game}
        playerId={playerId}
        controller={controller}/>
    );
  }
}


export default GameView;
