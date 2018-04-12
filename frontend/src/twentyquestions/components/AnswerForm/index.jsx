/** Components for answering questions */

import React from 'react';
import Button from 'material-ui/Button';
import {
  FormLabel,
  FormControl,
  FormControlLabel,
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
 * A react component to answer a question.
 *
 * @prop {Game} game - The game.
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Controller} controller - The controller for the application.
 */
class AnswerForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      answerValue: ''
    };
  }

  handleChange(e) {
    this.setState({answerValue: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();

    const {playerId, controller} = this.props;

    const {answerValue} = this.state;

    this.setState({answerValue: ''});

    controller.takeGameAction(
      'provideAnswer',
      [playerId, answerValue]
    );
  }

  render() {
    const {game, playerId} = this.props;

    let questionToDisplay = null;
    if (game.round.questionAndAnswers.length > 0) {
      questionToDisplay = game
        .round
        .questionAndAnswers[0]
        .question
        .questionText;
    } else {
      questionToDisplay = 'No questions have been asked yet.';
    };
    const enableForm = game.state === model.STATES.PROVIDEANSWER;

    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant='title'>Submit Answers</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography>
              You chose the subject: <em>{game.round.subject}</em>
            </Typography>
          </Grid>
          { enableForm ?
                <Grid item xs={12}>
                  <Typography variant='headline'>
                    {questionToDisplay}
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
              <FormLabel component='legend'>answer</FormLabel>
              <RadioGroup
                aria-label='answer'
                name='answer'
                value={this.state.answerValue}
                onChange={this.handleChange.bind(this)}>
                <FormControlLabel
                  label='Always'
                  value='always'
                  control={<Radio inputProps={ {required: true} }/>}
                  disabled={!enableForm}/>
                <FormControlLabel
                  label='Usually'
                  value='usually'
                  control={<Radio inputProps={ {required: true} }/>}
                  disabled={!enableForm}/>
                <FormControlLabel
                  label='Sometimes'
                  value='sometimes'
                  control={<Radio inputProps={ {required: true} }/>}
                  disabled={!enableForm}/>
                <FormControlLabel
                  label='Rarely'
                  value='rarely'
                  control={<Radio inputProps={ {required: true} }/>}
                  disabled={!enableForm}/>
                <FormControlLabel
                  label='Never'
                  value='never'
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


export default withStyles(styles)(AnswerForm);
