/** A component for handling inactive players. */

import React from 'react';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/Styles';

import model from '../../model';


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
 * A react component for handling inactive players.
 *
 * @prop {GameRoom} gameRoom - The game room.
 * @prop {Player} player - The player for this client.
 * @prop {Controller} controller - The controller for the application.
 */
class InactiveModal extends React.Component {
  constructor(props) {
    super(props);

    const {player} = this.props;

    this.state = {
      open: player.status === model.PLAYERSTATUSES.INACTIVE
    };
  }

  handleOpen() {
    this.setState({open: true});
  }

  handleClose() {
    const {controller} = this.props;

    this.setState({open: false});

    controller.takePlayerAction(model.PLAYERACTIONS.GOACTIVE);
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
                You've Gone Inactive
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                id='inactive-modal-description'
                variant='subheading'>
                You've gone inactive. Close this modal to get matched with a game.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant='raised'
                color='primary'
                onClick={() => this.handleClose()}>
                Close
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Modal>
    );
  }
}


export default withStyles(styles)(InactiveModal);
