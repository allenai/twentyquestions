/** A component represeting the waiting room. */

import React from 'react';
import AppBar from 'material-ui/AppBar';
import CssBaseline from 'material-ui/CssBaseline';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';

import PlayForm from '../PlayForm';


/** Style rules to apply to the component. */
const styles = theme => ({});


/**
 * A react component for representing the waiting room.
 *
 * @prop {WaitingRoom} waitingRoom - An instance of the WaitingRoom
 *   class modeling the waiting room state.
 * @prop {WaitingRoomController} controller - The controller for the
 *   waiting room.
 */
class WaitingRoom extends React.Component {
  render() {
    const {classes} = this.props;
    const {waitingRoom, controller} = this.props;

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

        <PlayForm
          waitingRoom={waitingRoom}
          controller={controller} />
      </div>
    );
  }
}


export default withStyles(styles)(WaitingRoom);
