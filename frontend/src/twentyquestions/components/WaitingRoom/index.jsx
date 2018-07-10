/** A component for allowing players to enter a game room. */

import React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/Styles';

import InactiveModal from '../InactiveModal';
import Instructions from '../Instructions';
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
 * @prop {Optional[GameRoom]} gameRoom - The game room.
 * @prop {Optional[Player]} player - The player for this client.
 * @prop {Controller} controller - The controller for the application.
 */
class WaitingRoom extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      secondsLeft: settings.SECONDSTORESPOND
    };
  }

  finishReadingInstructions() {
    const {player, controller} = this.props;

    controller.takePlayerAction(
      model.PLAYERACTIONS.FINISHREADINGINSTRUCTIONS
    );
  }

  enterGameRoom() {
    const {player, controller} = this.props;

    controller.takePlayerAction(model.PLAYERACTIONS.STARTPLAYING);
  }

  decrement() {
    const {player, controller} = this.props;

    const readyToPlay = player === null ?
          false
          : player.status === model.PLAYERSTATUSES.READYTOPLAY;

    // only change the countdown if in state 'READYTOPLAY'
    if (readyToPlay) {
      const {secondsLeft} = this.state;

      // decrement the countdown
      this.setState({secondsLeft: secondsLeft - 1});

      if (secondsLeft - 1 === 0) {
        this.setState({secondsLeft: settings.SECONDSTORESPOND});

        controller.takePlayerAction(model.PLAYERACTIONS.GOINACTIVE);
      }
    }
  }

  componentDidMount() {
    this.countdown = setInterval(() => this.decrement(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.countdown);
  }

  render() {
    const {classes} = this.props;
    const {gameRoom, player, controller} = this.props;

    let infoContent = null;
    let actionButton = null;
    if (player === null) {
      infoContent = (
        <Grid item xs={12}>
          <Typography
            variant='title'
            align='center'>
            Previewing HIT
          </Typography>
        </Grid>
      );
      actionButton = null;
    } else if (player.status === model.PLAYERSTATUSES.READINGINSTRUCTIONS) {
      infoContent = (
        <Grid item xs={12}>
          <Typography
            variant='title'
            align='center'>
            Reading Instructions
          </Typography>
        </Grid>
      );
      actionButton = (
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
              onClick={() => this.finishReadingInstructions()}>
              Got It!
            </Button>
          </Grid>
        </Grid>
      );
    } else if (player.status === model.PLAYERSTATUSES.WAITING) {
      infoContent = (
        <Grid item xs={12}>
          <Typography
            variant='title'
            align='center'>
            Waiting for Other Player
          </Typography>
          <Typography
            align='center'>
            You're currently waiting for another player to
            join. Once a Turker takes up one of the other HITs,
            we'll match them to you and the game will get
            started.
          </Typography>
        </Grid>
      );
      actionButton = (
        <Grid item xs={12}>
          <Grid
            container
            className={classes.padded}
            alignContent='center'
            alignItems='center'
            justify='center'>
            <CircularProgress color='primary'/>
          </Grid>
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
              disabled>
              Play
            </Button>
          </Grid>
        </Grid>
      );
    } else if (player.status === model.PLAYERSTATUSES.READYTOPLAY) {
      infoContent = (
        <Grid item xs={12}>
          <Typography
            variant='title'
            align='center'>
            Ready to Play!
          </Typography>
          <Typography>
            Click the "Play" button down below to start playing.
          </Typography>
        </Grid>
      );
      actionButton = (
        <Grid item xs={12}>
          <Grid
            container
            className={classes.padded}
            alignContent='center'
            alignItems='center'
            justify='center'>
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
            <Button
              variant='raised'
              color='primary'
              onClick={() => this.enterGameRoom()}>
              Play
            </Button>
          </Grid>
        </Grid>
      );
    } else if (player.status === model.PLAYERSTATUSES.INACTIVE) {
      infoContent = (
        <Grid item xs={12}>
          <Typography
            variant='title'
            align='center'>
            Inactive
          </Typography>
        </Grid>
      );
      actionButton = (
        <InactiveModal
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      );
    }

    return (
      <div>
        <Paper className={`${classes.padded} ${classes.margined}`}>
          <Grid
            container
            className={classes.padded}>
            { infoContent }
            <Instructions/>
            { actionButton }
          </Grid>
        </Paper>
      </div>
    );
  }
}


export default withStyles(styles)(WaitingRoom);
