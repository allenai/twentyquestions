/** Components for setting the subject of the round */

import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/styles';


/** Style rules to apply to the component. */
const styles = theme => ({});


/**
 * A react component for the answerer to set the subject of a round.
 *
 * @prop {Game} game - The game.
 * @prop {String} playerId - The ID for the player using this client.
 * @prop {Controller} controller - The controller for the application.
 */
class SubjectForm extends React.Component {
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

    const subject = this.state.value;

    this.setState({value: ''});

    controller.takeGameAction(
      'chooseSubject',
      [playerId, subject]
    );
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant='subheading'>
              Choose a Subject
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              id='subject-input'
              label='Subject'
              placeholder='i.e., dog, chair, bowl'
              value={this.state.value}
              autoComplete='off'
              onChange={this.handleChange.bind(this)}
              margin='normal'
              InputLabelProps={ {shrink: true} }
              helperText='Choose an object for the round that the other players will know well.'
              fullWidth
              required/>
          </Grid>
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
    );
  }
}


export default withStyles(styles)(SubjectForm);
