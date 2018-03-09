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
 * @prop {Function} submitResults - The controller callback for
 *   submitting the results back to MTurk.
 */
class SubmitResultsForm extends React.Component {
  handleSubmit(e) {
    e.preventDefault();

    const {submitResults} = this.props;

    submitResults();
  }

  render() {
    const { classes } = this.props;
    const {
      game,
      playerId,
      submitResults
    } = this.props;

    const lastRound = game.pastRounds[0];

    // identify this player's role
    let playerRole = null;
    if (lastRound.askerIds.includes(playerId)) {
      playerRole = 'asker';
    } else if (lastRound.answererId === playerId) {
      playerRole = 'answerer';
    } else {
      throw new Error('Player not found to have a role.');
    }

    // determine if the player won the previous round
    let playerWon = null;
    const lastQuestionAndAnswer = lastRound
          .questionAndAnswers[0];
    if (
      lastQuestionAndAnswer.question.isGuess
        && lastQuestionAndAnswer.answer.answerBool
    ) {
      playerWon = playerRole == 'asker';
    } else {
      playerWon = playerRole == 'answerer';
    }
    const gameOutcomeText = playerWon ?
          "You won! :D"
          : "Better luck next time.";

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

        <Paper
          className={`${classes.padded} ${classes.margined}`}>
          <Grid item xs={12}>
            <Typography
              variant='headline'
              color='primary'>
              { gameOutcomeText }
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
        </Paper>
      </div>
    );
  }
}


export default withStyles(styles)(SubmitResultsForm);
