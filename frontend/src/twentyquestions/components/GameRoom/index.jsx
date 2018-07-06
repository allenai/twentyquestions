/** A component representing the 20 Questions game. */

import React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/Styles';

import model from '../../model';
import InactivityWarning from '../InactivityWarning';
import PlayerContext from '../PlayerContext';
import QuestionForm from '../QuestionForm';
import AnswerForm from '../AnswerForm';
import SubjectForm from '../SubjectForm';
import MakeGuessForm from '../MakeGuessForm';
import AnswerGuessForm from '../AnswerGuessForm';
import SubmitResultsForm from '../SubmitResultsForm';
import QnABoard from '../QnABoard';


/**
 * Data defining each of the possible roles.
 *
 * The id fields should be unique. Label and description will be
 * displayed to the user.
 *
 * @property {Object} asker - Information about the asker role.
 * @property {Object} answerer - Information about the answerer role.
 */
const ROLES = {
  asker: {
    id: 'asker',
    label: 'asker'
  },
  answerer: {
    id: 'answerer',
    label: 'answerer'
  }
};


/** Style rules to apply to the component. */
const styles = theme => ({
  margined: {
    margin: theme.spacing.unit
  },
  padded: {
    padding: theme.spacing.unit * 2
  }
});


/**
 * A react component for representing the game.
 *
 * @prop {GameRoom} gameRoom - The game room.
 * @prop {Player} player - The player for this client.
 * @prop {Controller} controller - The controller for the application.
 */
class Game extends React.Component {
  render() {
    const { classes } = this.props;
    const {
      gameRoom,
      player,
      controller
    } = this.props;

    const playerId = player.playerId;
    const game = gameRoom.game;

    // calculate some quantities we'll display in the UI
    const numPlayers = (
      (game.answererId !== null ? 1 : 0)
        + (game.askerId !== null ? 1 : 0)
    );
    const numQuestionsLeft = (
      model.MAXQUESTIONS - game.round.questionAndAnswers.length
    );

    // identify this player's role
    let playerRole = null;
    if (game.askerId === playerId) {
      playerRole = ROLES.asker;
    } else if (game.answererId === playerId) {
      playerRole = ROLES.answerer;
    } else {
      throw new Error('Player not found to have a role.');
    }

    // identify the correct action form to display
    let actionForm = null;
    if (playerRole.id === ROLES.asker.id) {
      if (
        game.state === model.STATES.CHOOSESUBJECT
          || game.state === model.STATES.ASKQUESTION
          || game.state === model.STATES.PROVIDEANSWER
      ) {
        actionForm = (
          <QuestionForm
            game={game}
            playerId={playerId}
            controller={controller}/>
        );
      } else if (
        game.state === model.STATES.MAKEGUESS
          || game.state === model.STATES.ANSWERGUESS
      ) {
        actionForm = (
          <MakeGuessForm
            game={game}
            playerId={playerId}
            controller={controller}/>
        );
      } else if (game.state === model.STATES.SUBMITRESULTS) {
        actionForm = (
          <SubmitResultsForm
            game={game}
            playerId={playerId}
            controller={controller}/>
        );
      } else {
        throw new Error(`Game is in unknown state: ${game.state}`);
      }
    } else if (playerRole.id === ROLES.answerer.id) {
      if (game.state === model.STATES.CHOOSESUBJECT) {
        actionForm = (
          <SubjectForm
            game={game}
            playerId={playerId}
            controller={controller}/>
        );
      } else if (
        game.state === model.STATES.ASKQUESTION
          || game.state === model.STATES.PROVIDEANSWER
      ) {
        actionForm = (
          <AnswerForm
            game={game}
            playerId={playerId}
            controller={controller}/>
        );
      } else if (
        game.state === model.STATES.MAKEGUESS
          || game.state === model.STATES.ANSWERGUESS
      ) {
        actionForm = (
          <AnswerGuessForm
            game={game}
            playerId={playerId}
            controller={controller}/>
        );
      } else if (game.state === model.STATES.SUBMITRESULTS) {
        actionForm = (
          <SubmitResultsForm
            game={game}
            playerId={playerId}
            controller={controller}/>
        );
      } else {
        throw new Error(`Game is in unknown state: ${game.state}`);
      }
    } else {
      throw new Error("Could not find the player's role.");
    }

    return (
      <div>
        <InactivityWarning
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>

        <PlayerContext
          playerRole={playerRole}
          numPlayers={numPlayers}
          numQuestionsLeft={numQuestionsLeft}/>

        <Paper
          className={`${classes.padded} ${classes.margined}`}>
          {actionForm}
        </Paper>

        <Paper
          className={`${classes.padded} ${classes.margined}`}>
          <QnABoard
            questionAndAnswers={game.round.questionAndAnswers}/>
        </Paper>
      </div>
    );
  }
}


export default withStyles(styles)(Game);
