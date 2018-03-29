/** A component for allowing players to enter a game room. */

import React from 'react';
import Button from 'material-ui/Button';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';

import InactiveModal from '../InactiveModal';
import model from '../../model';
import settings from '../../settings';


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
 * A react component for the waiting room.
 *
 * @prop {GameRoom} gameRoom - The game room.
 * @prop {Player} player - The player for this client.
 * @prop {Controller} controller - The controller for the application.
 */
class WaitingRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      secondsLeft: settings.SECONDSTOPLAY
    };
  }

  enterGameRoom() {
    const {player, controller} = this.props;

    controller.takePlayerAction(model.PLAYERACTIONS.STARTPLAYING);
  }

  decrement() {
    const {player, controller} = this.props;

    const readyToPlay = (
      player.status === model.PLAYERSTATUSES.READYTOPLAY
    );

    // only change the countdown if in state 'READYTOPLAY'
    if (readyToPlay) {
      const {secondsLeft} = this.state;

      // decrement the countdown
      this.setState({secondsLeft: secondsLeft - 1});

      if (secondsLeft - 1 === 0) {
        this.setState({secondsLeft: settings.SECONDSTOPLAY});

        controller.takePlayerAction(model.PLAYERACTIONS.GOINACTIVE);
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
    const {gameRoom, player, controller} = this.props;

    const informationalContent = {
      WAITING: (
        <Grid container>
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
      ),
      READYTOPLAY: (
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
      ),
      INACTIVE: (
        <InactiveModal
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      )
    }[player.status];

    return (
      <div>
        <Paper className={`${classes.padded} ${classes.margined}`}>
          <Grid
            container
            className={classes.padded}>
            <Grid item xs={12}>
              { informationalContent }
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
                onClick={() => this.enterGameRoom()}
                disabled={player.status !== model.PLAYERSTATUSES.READYTOPLAY}>
                Play
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </div>
    );
  }
}


export default withStyles(styles)(WaitingRoom);
