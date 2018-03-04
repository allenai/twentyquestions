/* App entry point. */

import Model from './js/model';
import View from './js/view';
import Controller from './js/controller';


const controller = new Controller(
  View,
  Model
);


controller.initializeWaitingRoom();
