/** App entry point. */

import GameModel from './game-room/model';
import GameView from './game-room/view';
import GameController from './game-room/controller';
import WaitingRoomModel from './waiting-room/model';
import WaitingRoomView from './waiting-room/view';
import WaitingRoomController from './waiting-room/controller';

import settings from './settings';


/** Routes for the app. */
const routes = [
  [
    settings.waitingRoomUrlRegex,
    new WaitingRoomController(WaitingRoomView, WaitingRoomModel)
  ],
  [
    settings.gameRoomUrlRegex,
    new GameController(GameView, GameModel)
  ]
];


// match the correct URL and then initialize the controller
for (let i = 0; i < routes.length; i++) {
  const [urlPattern, controller] = routes[i];
  if (urlPattern.test(window.location.href)) {
    controller.initialize();
    break;
  }
}
