/** A view for rendering the data. */

import React from 'react';

import WaitingRoom from './components/WaitingRoom';


/**
 * The UI layer of the application.
 *
 * @prop {WaitingRoom} waitingRoom - An instance of the WaitingRoom class
 *   modeling the waiting room state.
 * @prop {WaitingRoomController} controller - The controller for the
 *   waiting room.
 */
class WaitingRoomView extends React.Component {
  render() {
    const {
      waitingRoom,
      controller
    } = this.props;

    return (
      <WaitingRoom
        waitingRoom={waitingRoom}
        controller={controller}/>
    );
  }
}


export default WaitingRoomView;
