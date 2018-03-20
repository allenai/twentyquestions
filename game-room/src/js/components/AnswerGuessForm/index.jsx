/** Components for answering a guess at the end of a round. */

import React from 'react';
import Button from 'material-ui/Button';
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText
} from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import { LinearProgress } from 'material-ui/Progress';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

import model from '../../model';


/** Style rules to apply to the component. */
const styles = theme => ({});


/**
 * A react component to answer a guess.
 *
 * @prop {Game} game - The game.
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Function} provideAnswer - The controller callback for
 *   answering a guess.
 */
class AnswerGuessForm extends React.Component {
  constructor(props) {
    super(props);

    this._answerStringMap = {
      true: true,
      false: false
    };

    this.state = {
      answerString: ''
    };
  }

  handleChange(e) {
    this.setState({answerString: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();

    const {playerId, answerGuess} = this.props;

    const isCorrect = this._answerStringMap[this.state.answerString];

    this.setState({answerString: ''});

    answerGuess(playerId, isCorrect);
  }

  render() {
    const {game, playerId} = this.props;

    const guessText = game.currentRound.guess !== null ?
          game.currentRound.guess.guessText
          : 'No guess has been made yet.';
    const enableForm = game.state === model.STATES.ANSWERGUESS;

    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant='subheading'>Answer the Guess</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              You chose the subject: <em>{game.currentRound.subject}</em>
            </Typography>
          </Grid>
          { !enableForm &&
            <Grid item xs={12}>
              <Typography align='center' variant='caption'>
                waiting for your turn
              </Typography>
              <LinearProgress variant='query'/>
            </Grid>
          }
          <Grid item xs={12}>
            <FormControl
              component='fieldset'>
              <FormLabel component='legend'>{guessText}</FormLabel>
              <RadioGroup
                aria-label={guessText}
                name='answer'
                value={this.state.answerString}
                onChange={this.handleChange.bind(this)}>
                <FormControlLabel
                  label='yes'
                  value='true'
                  control={<Radio inputProps={ {required: true} }/>}
                  disabled={!enableForm}/>
                <FormControlLabel
                  label='no'
                  value='false'
                  control={<Radio inputProps={ {required: true} }/>}
                  disabled={!enableForm}/>
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant='raised'
              color='primary'
              disabled={!enableForm}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>
    );
  }
}


export default withStyles(styles)(AnswerGuessForm);
