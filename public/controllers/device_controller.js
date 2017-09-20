import moment from 'moment';
import deviceHomeTemplate from '../templates/device-home.html';

export function deviceController($scope, $route, $interval, $http, $sce,$compile) {
    var device = this;
    device.title = 'PNU EMS';
    device.description = 'Device page of EMS';
    device.homeTemplate = deviceHomeTemplate;

    device.currentTime = moment($route.current.locals.currentTime);
    device.displayTime = device.currentTime.format('HH:mm:ss');

    device.init = function () {
        var cv = angular.element(document.getElementById("cv"));
        cv.html(device.homeTemplate);
        //var wv = angular.element(document.getElementById("wv"));
        $compile(cv.contents())($scope);
        //$compile(wv.contents())($scope);
        //$scope.$apply();
    };

    device.init();

    $scope.user = {
        title: 'Developer',
        email: 'ipsum@lorem.com',
        firstName: '',
        lastName: '',
        company: 'Google',
        address: '1600 Amphitheatre Pkwy',
        city: 'Mountain View',
        state: 'CA',
        biography: 'Loves kittens, snowboarding, and can type at 130 WPM.\n\nAnd rumor has it she bouldered up Castle Craig!',
        postalCode: '94043'
    };

    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
                     'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
                     'WY').split(' ').map(function(state) {
                         return {abbrev: state};
                     });
}
