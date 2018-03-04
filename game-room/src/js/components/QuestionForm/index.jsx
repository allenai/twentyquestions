/** Components for asking questions */

import React from 'react';
import Button from 'material-ui/Button';
import { LinearProgress } from 'material-ui/Progress';
import Checkbox from 'material-ui/Checkbox';
import {
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel
} from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';

import model from '../../model';


/** Style rules to apply to the component. */
const styles = theme => ({});


/**
 * A react component for the asker to ask questions.
 *
 * @prop {Game} game - The game.
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Function} askQuestion - The controller callback for asking a
 *   question.
 */
class QuestionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      questionText: '',
      isGuess: false
    };
  }

  handleChangeQuestionText(e) {
    this.setState({questionText: e.target.value});
  }

  handleChangeIsGuess(e, checked) {
    this.setState({isGuess: checked});
  }

  handleSubmit(e) {
    e.preventDefault();

    const {askQuestion, playerId} = this.props;
    const {questionText, isGuess} = this.state;

    this.setState({
      questionText: '',
      isGuessString: false
    });

    askQuestion(playerId, questionText, isGuess);
  }

  render() {
    const {game, playerId} = this.props;

    const enableForm = (
      game.state === model.STATES.ASKQUESTION
        && game.activeAskerId === playerId
    );

    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant='subheading'>Ask Questions</Typography>
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
            <TextField
              id='question-input'
              label='Question'
              placeholder='Ask a yes-or-no question.'
              value={this.state.questionText}
              autoComplete='off'
              disabled={!enableForm}
              onChange={this.handleChangeQuestionText.bind(this)}
              margin='normal'
              InputLabelProps={ {shrink: true} }
              fullWidth
              required/>
          </Grid>
          <Grid item xs={12}>
            <FormControl component='fieldset'>
              <FormLabel component='legend'>Is this a guess?</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                      <Checkbox
                          checked={this.state.isGuess}
                          onChange={this.handleChangeIsGuess.bind(this)}/>
                      }
                  value="isGuess"
                  disabled={!enableForm}/>
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              type='submit'
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


export default withStyles(styles)(QuestionForm);
