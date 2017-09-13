import moment from 'moment';

export function deviceController($scope, $route, $interval, $http) {
    var device = this;
    device.title = 'PNU EMS';
    device.description = 'Device page of EMS';

    device.currentTime = moment($route.current.locals.currentTime);
    device.displayTime = device.currentTime.format('HH:mm:ss');
}
