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
import QnABoard from '../QnABoard';
import SubjectForm from '../SubjectForm';


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
      + ' guess the object. At any point, instead of asking a question'
      + ' you may guess what the object is. You win if you can guess the'
      + ' object correctly in 20 questions or less.'
  },
  answerer: {
    id: 'answerer',
    label: 'answerer',
    description: 'As the "answerer", you should choose a common everyday'
      + ' object to start the round and then truthfully answer any'
      + ' questions the other players ask about that object. You win if'
      + ' they are unable to identify the object in 20 questions or'
      + ' less.'
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
 * @prop {Function} chooseSubject - The controller callback for choosing
 *   a subject.
 * @prop {Function} askQuestion - The controller callback for asking a
 *   question.
 * @prop {Function} provideAnswer - The controller callback for
 *   providing an answer.
 */
class Game extends React.Component {
  render() {
    const { classes } = this.props;
    const {
      game,
      playerId,
      chooseSubject,
      askQuestion,
      provideAnswer
    } = this.props;

    const currentRound = game.currentRound;

    // calculate some quantities we'll display in the UI
    const numPlayers = game.players.length;
    const numQuestionsLeft = (
      model.MAXQUESTIONS - currentRound.questionAndAnswers.length
    );

    // identify this player's role
    let playerRole = null;
    if (currentRound.askerIds.includes(playerId)) {
      playerRole = ROLES.asker;
    } else if (currentRound.answererId === playerId) {
      playerRole = ROLES.answerer;
    } else {
      throw new Error('Player not found to have a role.');
    }

    // identify the correct action form to display
    let actionForm = null;
    if (playerRole.id === ROLES.asker.id) {
      actionForm = (
        <QuestionForm
          game={game}
          playerId={playerId}
          askQuestion={askQuestion}/>
      );
    } else if (
      playerRole.id === ROLES.answerer.id
        && game.state === model.STATES.CHOOSESUBJECT
    ) {
      actionForm = (
        <SubjectForm
          playerId={playerId}
          chooseSubject={chooseSubject}/>
      );
    } else if (playerRole.id === ROLES.answerer.id) {
      actionForm = (
        <AnswerForm
          game={game}
          playerId={playerId}
          provideAnswer={provideAnswer}/>
      );
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
