/** App entry point. */

import Model from './twentyquestions/model';
import View from './twentyquestions/view';
import Controller from './twentyquestions/controller';


const controller = new Controller(View, Model);

// Initialize the application
controller.initialize();
