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
import 'jquery/dist/jquery.js';
import 'spectrum-colorpicker/spectrum.css';
import 'spectrum-colorpicker/spectrum.js';
import 'angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.js';
import 'ngmap/build/scripts/ng-map.js';
import './less/main.less';
import { deviceController } from './controllers/device_controller';
import { historyController } from './controllers/history_controller';
import spaceService from './services/spaceService';
import deviceService from './services/deviceService';
import dataService from './services/dataService';
import drawBlueprintDirective from './directives/draw_blueprint.js';
import deviceTemplate from './templates/device.html';
import historyTemplate from './templates/history.html';

uiRoutes.enable();
uiRoutes
  .when('/', {
    template: deviceTemplate
  });

uiRoutes
  .when('/device', {
    template: deviceTemplate
  });

uiRoutes
  .when('/monitor', {
    template: historyTemplate
  });

uiModules
  .get('app/ems', [
    'ngMaterial',
    'ngMessages',
    'angularSpectrumColorpicker',
    'ngMap'
  ])
  .controller('deviceController', deviceController)
  .controller('historyController', historyController)
  .service('SpaceService', spaceService)
  .service('DeviceService', deviceService)
  .service('DataService', dataService)
  .directive('drawBlueprint', drawBlueprintDirective)
  .config(function ($mdIconProvider,$mdThemingProvider){
    $mdIconProvider
      .iconSet('menu', '/plugins/ems/icons/menu.svg', 24)
      .defaultIconSet('/plugins/ems/icons/menu.svg', 24);

    $mdThemingProvider.theme('docs-dark', 'default')
      .primaryPalette('yellow')
      .dark();
  });
