/** A form for submitting results to MTurk. */

import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/Styles';


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

    controller.submitResults();
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
    if (game.round.guessAndAnswer.guessAnswer.correct) {
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
              The subject was <b>{game.round.subject}</b> and the guess
              was <b>{game.round.guessAndAnswer.guess.guessText}</b>.
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
