import moment from 'moment';

export function historyController($scope, $route, $interval, $http) {
    var history = this;
    history.title = 'PNU EMS';
    history.description = 'Device page of EMS';

    history.currentTime = moment($route.current.locals.currentTime);
    history.displayTime = history.currentTime.format('HH:mm:ss');
}
