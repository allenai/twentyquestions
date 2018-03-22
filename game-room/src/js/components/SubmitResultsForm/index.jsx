/** A form for submitting results to MTurk. */

import React from 'react';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Reboot from 'material-ui/Reboot';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';


/**
 * Data defining and describing the different possible game outcomes.
 *
 * @property {Object} guessedCorrectly - The asker guessed correctly.
 * @property {Object} guessedIncorrectly - The asker guessed
 *   incorrectly.
 */
const OUTCOMES = {
  guessedCorrectly: {
    heading: {
      asker: 'Youuu WIN!!!',
      answerer: 'Better luck next time'
    },
    description: {
      asker: 'You guessed the subject correctly! You win c:!!!',
      answerer: 'The other player guessed the subject correctly. You'
        + ' lost this time, but thanks for playing c:'
    }
  },
  guessedIncorrectly: {
    heading: {
      asker: 'Better luck next time',
      answerer: 'Youuu WIN!!!'
    },
    description: {
      asker: 'You didn\'t guess the subject correctly. You lost this'
        + ' time, but thanks for playing c:',
      answerer: 'The other player guessed the subject incorrectly. You'
        + ' win c:!!'
    }
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
 * A react component for submitting results back to Turk.
 *
 * @prop {Game} game - The game.
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Controller} controller - The controller for the application.
 */
class SubmitResultsForm extends React.Component {
  handleSubmit(e) {
    e.preventDefault();

    const {controller} = this.props;

    controller.dispatchAction(
      'submitResults',
      []
    );
  }

  render() {
    const { classes } = this.props;
    const {
      game,
      playerId
    } = this.props;

    // identify this player's role
    let playerRole = null;
    if (game.askerId === playerId) {
      playerRole = 'asker';
    } else if (game.answererId === playerId) {
      playerRole = 'answerer';
    } else {
      throw new Error('Player not found to have a role.');
    }

    // determine if the player won the previous round
    let gameOutcome = null;
    if (game.currentRound.guess.answer.answerBool) {
      gameOutcome = OUTCOMES.guessedCorrectly;
    } else {
      gameOutcome = OUTCOMES.guessedIncorrectly;
    }

    return (
      <Grid container>
        <Grid item xs={12}>
          <Typography
            variant='headline'
            color='primary'>
            { gameOutcome.heading[playerRole] }
          </Typography>
          <Typography
            variant='subheading'>
            <p>
              The subject was <b>{game.currentRound.subject}</b> and the guess
              was <b>{game.currentRound.guess.question.questionText}</b>.
            </p>
            <p>{ gameOutcome.description[playerRole] }</p>
          </Typography>
        </Grid>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <Grid container>
            <Grid item xs={12}>
              <Button
                type='submit'
                variant='raised'
                color='primary'>
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
    );
  }
}


export default withStyles(styles)(SubmitResultsForm);
