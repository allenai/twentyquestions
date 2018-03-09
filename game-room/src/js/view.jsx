/** A view for rendering the data. */

import React from 'react';

import GameRoom from './components/GameRoom';
import SubmitResultsForm from './components/SubmitResultsForm';


/**
 * The UI layer of the application.
 *
 * @prop {Game} game - An instance of the Game class modeling the
 *   whole game state.
 * @prop {String} playerId - The ID for the player using this
 *   client.
 * @prop {Function} chooseSubject - The controller callback for
 *   choosing the subject of a round.
 * @prop {Function} askQuestion - The controller callback for asking a
 *   question.
 * @prop {Function} provideAnswer - The controller callback for
 *   providing an answer to a question.
 * @prop {Function} submitResults - The controller callback for
 *   submitting results to MTurk.
 */
class View extends React.Component {
  render() {
    const {
      game,
      playerId,
      chooseSubject,
      askQuestion,
      provideAnswer,
      submitResults
    } =  this.props;

    const display = game.pastRounds.length == 0 ?
      <GameRoom
        game={game}
        playerId={playerId}
        chooseSubject={chooseSubject}
        askQuestion={askQuestion}
        provideAnswer={provideAnswer}/>
      : <SubmitResultsForm
          game={game}
          playerId={playerId}
          submitResults={submitResults}/>;

    return display;
  }
}


export default View;
