/** A component for setting players to inactive. */

import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Modal from 'material-ui/Modal';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';

import model from '../../model';
import settings from '../../settings';


/** Style rules to apply to the component. */
const styles = theme => ({
  modal: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  margined: {
    margin: theme.spacing.unit
  },
  padded: {
    padding: theme.spacing.unit * 2
  }
});


/**
 * A react component for setting players to inactive.
 *
 * @prop {GameRoom} gameRoom - The game room.
 * @prop {Player} player - The player for this client.
 * @prop {Controller} controller - The controller for the application.
 */
class InactivityWarning extends React.Component {
  constructor(props) {
    super(props);

    const {player} = this.props;

    this.state = {
      open: false,
      countDownToWarning: settings.SECONDSTOWARNING,
      countDownToRespond: settings.SECONDSTORESPOND
    };
  }

  handleOpen() {
    this.setState({open: true});
  }

  handleClose() {
    const {controller} = this.props;

    this.setState({
      open: false,
      countDownToWarning: settings.SECONDSTOWARNING,
      countDownToRespond: settings.SECONDSTORESPOND
    });
  }

  decrement() {
    const {player, gameRoom, controller} = this.props;

    let playersTurn = null;
    if (player.playerId === gameRoom.game.askerId) {
      playersTurn = (
        gameRoom.game.state === model.STATES.ASKQUESTION
          || gameRoom.game.state === model.STATES.MAKEGUESS
      );
    } else if (player.playerId === gameRoom.game.answererId) {
      playersTurn = (
        gameRoom.game.state === model.STATES.CHOOSESUBJECT
          || gameRoom.game.state === model.STATES.PROVIDEANSWER
          || gameRoom.game.state === model.STATES.ANSWERGUESS
      );
    }

    if (playersTurn) {
      if (this.state.countDownToWarning > 0) {
        // waiting for the player to take their turn
        this.setState({
          countDownToWarning: this.state.countDownToWarning - 1
        });
      } else if (this.state.countDownToRespond > 0) {
        // make sure the inactivity check is open and decrement the time
        // to respond
        this.setState({
          open: true,
          countDownToRespond: this.state.countDownToRespond - 1
        });
      } else {
        // time is up, set the player to inactive
        this.setState({
          open: false,
          countDownToWarning: settings.SECONDSTOWARNING,
          countDownToRespond: settings.SECONDSTORESPOND
        });
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
    const {player, controller} = this.props;

    return (
      <Modal
        aria-labelledby='inactive-modal-label'
        aria-describedby='inactive-modal-description'
        open={this.state.open}
        onClose={() => this.handleClose()}>
        <Paper
          className={`${classes.modal} ${classes.padded}`}>
          <Grid container>
            <Grid item xs={12}>
              <Typography
                id='inactive-modal-label'
                variant='title'>
                Leaving Game in {this.state.countDownToRespond} seconds
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                id='inactive-modal-description'
                variant='subheading'>
                Looks like you've gone inactive. Click "I'm Still Here"
                to stay in the game.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='raised'
                color='primary'
                onClick={() => this.handleClose()}>
                I'm Still Here
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Modal>
    );
  }
}


export default withStyles(styles)(InactivityWarning);
