/** Components for asking questions */

import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

import model from '../../model';


/** Style rules to apply to the component. */
const styles = theme => ({});


/**
 * A react component for the asker to ask questions.
 *
 * @prop {Game} game - The game.
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Controller} controller - The controller for the application.
 */
class QuestionForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: ''
    };
  }

  handleChange(e) {
    this.setState({value: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();

    const {playerId, controller} = this.props;
    const questionText = this.state.value;

    this.setState({
      value: ''
    });

    controller.takeGameAction(
      'askQuestion',
      [playerId, questionText]
    );
  }

  render() {
    const {game, playerId} = this.props;

    const enableForm = game.state === model.STATES.ASKQUESTION;

    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant='title'>Ask Questions</Typography>
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
              value={this.state.value}
              autoComplete='off'
              disabled={!enableForm}
              onChange={this.handleChange.bind(this)}
              margin='normal'
              InputLabelProps={ {shrink: true} }
              fullWidth
              required/>
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
