import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/autoload/styles';
import './less/main.less';
import { deviceController } from './controllers/device_controller';
import { historyController } from './controllers/history_controller';
import template from './templates/index.html';
import deviceTemplate from './templates/device.html';
import historyTemplate from './templates/history.html';

uiRoutes.enable();
uiRoutes
  .when('/', {
    template: template,
  });

uiRoutes
  .when('/device', {
    template: deviceTemplate,
  });

uiRoutes
  .when('/history', {
    template: historyTemplate,
  });

uiModules
  .get('app/ems', [])
  .controller('deviceController', deviceController)
  .controller('historyController', historyController);
