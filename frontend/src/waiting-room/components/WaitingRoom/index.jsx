/** A component represeting the waiting room. */

import React from 'react';
import AppBar from 'material-ui/AppBar';
import Button from 'material-ui/Button';
import CssBaseline from 'material-ui/CssBaseline';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';

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
 * A react component for representing the waiting room.
 *
 * @prop {WaitingRoom} waitingRoom - An instance of the WaitingRoom class
 *   modeling the waiting room state.
 * @prop {WaitingRoomController} controller - The controller for the
 *   waiting room.
 */
class WaitingRoom extends React.Component {
  render() {
    const {classes} = this.props;
    const {waitingRoom, controller} = this.props;

    const readyToPlay =
      waitingRoom.state === WaitingRoomModel.STATES.READYTOPLAY;

    return (
      <div>
        <CssBaseline/>
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
              { readyToPlay ?
                  <Grid container>
                    <Grid item xs={12}>
                      <Typography
                        variant='headline'
                        align='center'>
                          Ready to Play!
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
      </div>
    );
  }
}


export default withStyles(styles)(WaitingRoom);
