import moment from 'moment';
import { uiModules } from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/autoload/styles';
import 'angular-material/angular-material.css';
import 'angular-animate/angular-animate.js';
import 'angular-aria/angular-aria.js';
import 'angular-messages/angular-messages.js';
import 'angular-material/angular-material.js';
import 'angular-sanitize/angular-sanitize.js';
import 'ngmap/build/scripts/ng-map.js';
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
  .get('app/ems', ['ngMaterial','ngMessages','ngMap'])
  .controller('deviceController', deviceController)
  .controller('historyController', historyController)
  .config(function ($mdIconProvider,$mdThemingProvider){
    $mdIconProvider
      .iconSet('menu', '/plugins/ems/icons/menu.svg', 24)
      .defaultIconSet('/plugins/ems/icons/menu.svg', 24);

    $mdThemingProvider.theme('docs-dark', 'default')
      .primaryPalette('yellow')
      .dark();
  });
