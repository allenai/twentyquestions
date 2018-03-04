/** A component represeting the waiting room. */

import React from 'react';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Reboot from 'material-ui/Reboot';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';


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
 * A react component for representing the waiting room.
 *
 * @prop {WaitingRoom} waitingRoom - An instance of the WaitingRoom class
 *   modeling the waiting room state.
 * @prop {Function} enterGameRoom - The controller callback for entering
 *   the game room.
 */
class WaitingRoom extends React.Component {
  render() {
    const {classes} = this.props;
    const {waitingRoom, enterGameRoom} = this.props;

    const numPlayers = this.props.waitingRoom.playerIds.length;
    const quorum = this.props.waitingRoom.quorum;
    const readyToPlay = numPlayers >= quorum;

    return (
      <div>
        <Reboot/>
        <AppBar position='static'>
          <Toolbar>
            <Typography
              variant='title'
              color='inherit'>
              Waiting Room
            </Typography>
          </Toolbar>
        </AppBar>

        <Paper className={`${classes.padded} ${classes.margined}`}>
          <Grid
            container
            className={classes.padded}>
            <Grid item xs={12}>
              <Typography
                variant='headline'
                align='center'>
                {`${numPlayers} / ${quorum} Players`}
              </Typography>
              <Typography
                variant='subheading'
                color='textSecondary'
                align='center'>
                present / required
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography
                align='center'>
                There are currently {numPlayers} players out
                of {quorum} players present. The game will start when there
                are {quorum} players.
              </Typography>
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
                onClick={enterGameRoom}
                disabled={!readyToPlay}>
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
