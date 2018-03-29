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
 * Either player and gameRoom can both be null, or neither should be null.
 *
 * @prop {Optional[GameRoom]} gameRoom - The game room that this view is representing.
 * @prop {Optional[Player]} player - The player using this client.
 * @prop {Controller} controller - The controller for the application.
 */
class View extends React.Component {
  render() {
    const {
      gameRoom,
      player,
      controller
    } =  this.props;

    let room = null;
    if (
      player === null
        || player.status === controller.model.PLAYERSTATUSES.WAITING
        || player.status === controller.model.PLAYERSTATUSES.READYTOPLAY
        || player.status === controller.model.PLAYERSTATUSES.INACTIVE
    ) {
      room = (
        <WaitingRoom
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      );
    } else if (player.status === controller.model.PLAYERSTATUSES.PLAYING) {
      room = (
        <GameRoom
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      );
    } else if (player.status === controller.model.PLAYERSTATUSES.BANNED) {
      room = (
        <BannedRoom
          gameRoom={gameRoom}
          player={player}
          controller={controller}/>
      );
    } else {
      throw new Error(
        `Player status (${player.status}) not recognized.`
      );
    }

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
