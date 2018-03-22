/** A component representing the 20 Questions game. */

import React from 'react';
import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';
import Reboot from 'material-ui/Reboot';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';

import model from '../../model';
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
    label: 'asker',
    description: 'As the "asker", you ask yes-or-no questions and try to'
      + ' identify the object. After you have asked 20 questions, you'
      + ' can guess what the object is. If you guess the object'
      + ' correctly, then you win!'
  },
  answerer: {
    id: 'answerer',
    label: 'answerer',
    description: 'As the "answerer", you choose a common everyday object'
      + ' to start the round and then truthfully answer any questions'
      + ' the other players ask about that object. After the other'
      + ' player has asked 20 questions, the other player will make'
      + ' their best guess. If they guess incorrectly then you win!'
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
 * @prop {Game} game - The game.
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Controller} controller - The controller for the application.
 */
class Game extends React.Component {
  render() {
    const { classes } = this.props;
    const {
      game,
      playerId,
      controller
    } = this.props;

    const currentRound = game.currentRound;

    // calculate some quantities we'll display in the UI
    const numPlayers = game.players.length;
    const numQuestionsLeft = (
      model.MAXQUESTIONS - currentRound.questionAndAnswers.length
    );

    // identify this player's role
    let playerRole = null;
    if (currentRound.askerId === playerId) {
      playerRole = ROLES.asker;
    } else if (currentRound.answererId === playerId) {
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
        <Reboot/>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">
              20 Questions
            </Typography>
          </Toolbar>
        </AppBar>

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
            questionAndAnswers={currentRound.questionAndAnswers}/>
        </Paper>
      </div>
    );
  }
}


export default withStyles(styles)(Game);
