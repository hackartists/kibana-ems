import moment from 'moment';
import deviceHomeTemplate from '../templates/device-home.html';

export function deviceController($scope, $route, $interval, $http, $sce) {
    var device = this;
    device.title = 'PNU EMS';
    device.description = 'Device page of EMS';
    device.homeTemplate = $sce.trustAsHtml(deviceHomeTemplate);

    device.currentTime = moment($route.current.locals.currentTime);
    device.displayTime = device.currentTime.format('HH:mm:ss');
}
