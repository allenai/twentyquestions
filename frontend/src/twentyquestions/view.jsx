/** A view for rendering the data. */

import React from 'react';
import AppBar from 'material-ui/AppBar';
import CssBaseline from 'material-ui/CssBaseline';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import { withStyles } from 'material-ui/Styles';

import WaitingRoom from './components/WaitingRoom';
import GameRoom from './components/GameRoom';
import BannedRoom from './components/BannedRoom';


/**
 * The UI layer of the application.
 *
 * @prop {GameRoom} gameRoom - The game room that this view is representing.
 * @prop {String} player - The player using this client.
 * @prop {Controller} controller - The controller for the application.
 */
class View extends React.Component {
  render() {
    const {
      gameRoom,
      player,
      controller
    } =  this.props;

    const roomToDisplay = {
      WAITING: 'waitingRoom',
      READYTOPLAY: 'waitingRoom',
      PLAYING: 'gameRoom',
      INACTIVE: 'waitingRoom',
      BANNED: 'bannedRoom'
    }[player.status];

    const room = {
      waitingRoom: (
        <WaitingRoom
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      ),
      gameRoom: (
        <GameRoom
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      ),
      bannedRoom: (
        <BannedRoom
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      )
    }[roomToDisplay];

    return (
      <div>
        <CssBaseline/>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="title" color="inherit">
              20 Questions
            </Typography>
          </Toolbar>
        </AppBar>

        {room}

      </div>
    );
  }
}


export default View;
