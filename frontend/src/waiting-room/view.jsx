/** A view for rendering the data. */

import React from 'react';

import WaitingRoom from './components/WaitingRoom';


/**
 * The UI layer of the application.
 *
 * @prop {WaitingRoom} waitingRoom - An instance of the WaitingRoom class
 *   modeling the waiting room state.
 * @prop {Function} enterGameRoom - The controller callback for entering
 *   the game room.
 */
class WaitingRoomView extends React.Component {
  render() {
    const {
      waitingRoom,
      enterGameRoom
    } = this.props;

    return (
      <WaitingRoom
        waitingRoom={waitingRoom}
        enterGameRoom={enterGameRoom}/>
    );
  }
}


export default WaitingRoomView;
