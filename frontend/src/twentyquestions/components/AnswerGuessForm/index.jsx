/** Components for answering a guess at the end of a round. */

import React from 'react';
import Button from '@material-ui/core/Button';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import model from '../../model';


/** Style rules to apply to the component. */
const styles = theme => ({});


/**
 * A react component to answer a guess.
 *
 * @prop {Game} game - The game.
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Controller} controller - The controller for the application.
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

    const {playerId, controller} = this.props;

    const correct = this._answerStringMap[this.state.answerString];

    this.setState({answerString: ''});

    controller.takeGameAction(
      'answerGuess',
      [playerId, correct]
    );
  }

  render() {
    const {game, playerId} = this.props;

    const guessText = game.round.guessAndAnswer !== null ?
          game.round.guessAndAnswer.guess.guessText
          : 'No guess has been made yet.';
    const enableForm = game.state === model.STATES.ANSWERGUESS;

    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant='title'>Answer the Guess</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              You chose the subject: <em>{game.round.subject}</em>
            </Typography>
          </Grid>
          { enableForm ?
                <Grid item xs={12}>
                  <Typography variant='headline'>
                    {guessText}
                  </Typography>
                </Grid>
              : <Grid item xs={12}>
                  <Typography align='center' variant='caption'>
                    waiting for your turn
                  </Typography>
                  <LinearProgress variant='query'/>
                </Grid>
          }
          <Grid item xs={12}>
            <FormControl
              component='fieldset'>
              <FormLabel component='legend'>Is the guess correct? Feel free to use your judgment.</FormLabel>
              <RadioGroup
                aria-label='answer'
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
