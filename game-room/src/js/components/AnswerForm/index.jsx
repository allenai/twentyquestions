/* Components for answering questions */

import React from 'react';
import Button from 'material-ui/Button';
import { LinearProgress } from 'material-ui/Progress';
import {
  FormLabel,
  FormControl,
  FormControlLabel,
  FormHelperText
} from 'material-ui/Form';
import Grid from 'material-ui/Grid';
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
 * @prop {Function} provideAnswer - The controller callback for providing
 *   an answer.
 */
class AnswerForm extends React.Component {
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

    const {playerId, provideAnswer} = this.props;

    const answerBool = this._answerStringMap[this.state.answerString];

    this.setState({answerString: ''});

    provideAnswer(playerId, answerBool);
  }

  render() {
    const {game, playerId} = this.props;

    let questionToDisplay = null;
    if (game.currentRound.questionAndAnswers.length > 0) {
      questionToDisplay = game
        .currentRound
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
            <Typography variant='subheading'>Submit Answers</Typography>
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
              <FormLabel component='legend'>{questionToDisplay}</FormLabel>
              <RadioGroup
                aria-label={questionToDisplay}
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


export default withStyles(styles)(AnswerForm);