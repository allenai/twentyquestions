/** A component for allowing players to enter a game room. */

import React from 'react';
import Badge from 'material-ui/Badge';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';

import settings from '../../settings';
import WaitingRoomModel from '../../model';


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
 * A react component for the play form.
 *
 * @prop {WaitingRoom} waitingRoom - An instance of the WaitingRoom
 *   class modeling the waiting room state.
 * @prop {WaitingRoomController} controller - The controller for the
 *   waiting room.
 */
class PlayForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      secondsLeft: settings.SECONDSTOPLAY
    };
  }

  decrement() {
    const {waitingRoom, controller} = this.props;

    const readyToPlay = (
      this.props.waitingRoom.state === WaitingRoomModel.STATES.READYTOPLAY
    );

    // only change the countdown if in state 'READYTOPLAY'
    if (readyToPlay) {
      const {secondsLeft} = this.state;

      // decrement the countdown
      this.setState({secondsLeft: secondsLeft - 1});

      if (secondsLeft - 1 === 0) {
        this.setState({secondsLeft: settings.SECONDSTOPLAY});

        controller.setPlayerAsInactive();
      }
    }
  }

  componentDidMount() {
    this.countdown = setInterval(
      () => this.decrement(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.countdown);
  }

  render() {
    const {classes} = this.props;
    const {waitingRoom, controller} = this.props;

    const readyToPlay = (
      waitingRoom.state === WaitingRoomModel.STATES.READYTOPLAY
    );

    return (
      <Paper className={`${classes.padded} ${classes.margined}`}>
        <Grid
          container
          className={classes.padded}>
          <Grid item xs={12}>
            { readyToPlay ?
                <Grid container>
                  <Grid item xs={12}>
                    <Typography
                      variant='headline'
                      align='center'>
                        Ready to Play!
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography
                      variant='subheading'
                      align='center'>
                        {this.state.secondsLeft} Seconds Left
                    </Typography>
                  </Grid>
                </Grid>
                : <Grid container>
                    <Grid item xs={12}>
                      <Typography
                          variant='headline'
                          align='center'>
                          Waiting for Players
                        </Typography>
                    </Grid>
                    <Grid item align='center' xs={12}>
                        <CircularProgress color='primary'/>
                  </Grid>
                </Grid>
              }
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid
            container
            className={classes.padded}
            alignContent='center'
            alignItems='center'
            justify='center'>
            <Button
              variant='raised'
              color='primary'
              onClick={controller.enterGameRoom.bind(controller)}
              disabled={!readyToPlay}>
              Play
            </Button>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}


export default withStyles(styles)(PlayForm);
