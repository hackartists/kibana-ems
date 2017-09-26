import moment from 'moment';
import deviceRegisterTemplate from '../templates/device.register.html';
import deviceListTemplate from '../templates/device.list.html';
import spaceListTemplate from '../templates/space.list.html';
import testDialogTemplate from '../templates/test.html';
import 'plugins/security/services/shield_user';

export function deviceController($scope, $route, $interval, $http, $sce,$compile,$timeout,$mdDialog, ShieldUser, NgMap) {
    var device = this;
    device.title = 'PNU EMS';
    device.description = 'Device page of EMS';
    device.space = {};

    device.addMarker = function(event) {
        var ll = event.latLng;
        device.space.location={lat:ll.lat(),lng:ll.lng()};
    }

    $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyBewkiCX67bKGcuLZ8z-DbGbzW8S9PxMvw";

    device.init = function () {
        device.setDeviceListTemplate();
    };

    device.setTemplate = function(tmpl) {
        var cv = angular.element(document.getElementById("cv"));
        cv.html(tmpl);
        $compile(cv.contents())($scope);
        NgMap.getMap().then(function(map) {
            $timeout(() => {google.maps.event.trigger(map, 'resize')}, 1000)
        });
    };

    function DialogController($scope, $mdDialog) {
        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }

    device.showDialog = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            template: testDialogTemplate,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });

        // var parentEl = angular.element(document.body);
        // $mdDialog.show({
        //     parent: parentEl,
        //     targetEvent: ev,
        //     template:deviceRegisterTemplate,
        //     locals: {
        //         items: $scope.items
        //     },
        //     controller:DialogController
        // });
        // function DialogController($scope, $mdDialog, items) {
        //     $scope.items = items;
        //     $scope.cancel = function() {
        //         $mdDialog.hide();
        //     };

        //     $scope.register_device = function() {
        //     };
        // }
    };

    device.cancel = function(t) {
        $mdDialog.cancel();
        device.setDeviceListTemplate();
    };

    device.setDeviceListTemplate = function() {
        device.setTemplate(deviceListTemplate);
    };

    device.setDeviceRegisterTemplate = function() {
        device.setTemplate(deviceRegisterTemplate);
    };

    device.setSpaceListTemplate = function() {
        device.setTemplate(spaceListTemplate);
    };

    device.setSpaceRegisterTemplate = function() {
        device.setTemplate(spaceRegisterTemplate);
    };

    device.select_device= function(dev) {
        device.selected_device=dev;
        device.selected_space = device.spaces.filter(function(e) {
            return device.selected_device.space_id == e.space_id
        })[0];

        device.selected_children = device.devices.filter(function(e) {
            return device.selected_device.device_id == e.parent_id
        });
    };

    device.select_space= function(sp) {
        device.selected_space=sp;

        device.selected_devices = device.devices.filter(function(e) {
            return device.selected_space.space_id == e.space_id
        });
    };

    device.switch_to_device_view = function(dev) {
        device.setDeviceListTemplate();
        device.select_device(dev);
    };

    device.selected_children=[];

    device.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    device.init();

    device.selected_device = {device_name:"Plug1",type:2,user_id:"jseokchoi",space_id:"sp1",device_id:"dv1",parent_id:"sm1",ip_addr:"127.0.0.1",setup_date:"2017-01-01"};

    device.selected_space = {name:"Home", space_id:"0", location:"00", user_id:"jseokchoi",location:{lat:"35.2337171", lng:"129.0773478"}};

    device.devices = [
        {device_name:"Plug1",type:2,user_id:"jseokchoi",space_id:"sp0",device_id:"dv1",parent_id:"sm1",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Plug2",type:2,user_id:"jseokchoi",space_id:"sp0",device_id:"dv2",parent_id:"sm2",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Plug3",type:2,user_id:"jseokchoi",space_id:"sp1",device_id:"dv3",parent_id:"sm3",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Plug4",type:2,user_id:"jseokchoi",space_id:"sp1",device_id:"dv4",parent_id:"sm4",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Meter1",type:1,user_id:"jseokchoi",space_id:"sp0",device_id:"sm1",parent_id:"gw1",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Meter2",type:1,user_id:"jseokchoi",space_id:"sp0",device_id:"sm2",parent_id:"gw1",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Meter3",type:1,user_id:"jseokchoi",space_id:"sp1",device_id:"sm3",parent_id:"gw2",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Meter4",type:1,user_id:"jseokchoi",space_id:"sp1",device_id:"sm4",parent_id:"gw2",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Gateway1",type:0,user_id:"jseokchoi",space_id:"sp0",device_id:"gw1",parent_id:"",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        {device_name:"Gateway2",type:0,user_id:"jseokchoi",space_id:"sp1",device_id:"gw2",parent_id:"",ip_addr:"127.0.0.1",setup_date:"2017-01-01"}
    ];

    device.user = ShieldUser.getCurrent();

    device.deviceTypes = [{name:"Gateway", value:0},
                         {name:"Smart meter", value:1},
                         {name:"Smart plug", value:2}].map(function(el) {
                             return {name: el.name,
                                     value: el.value};
                         });

    device.spaces = [{name:"Home", space_id:"sp0", user_id:"jseokchoi", location:{lat:"35.2337171", lng:"129.0773478"}},
                     {name:"Office", space_id:"sp1", user_id:"jseokchoi", location:{lat:"35.2337171", lng:"129.0773478"}},
                     {name:"School", space_id:"sp2", user_id:"jseokchoi", location:{lat:"35.2337171", lng:"129.0773478"}}]
        .map(function(el) {
            return {name: el.name,
                    space_id:el.space_id,
                    location:el.location,
                    user_id:el.user_id};
        });

    device.parents = [
        {type:0, space_id:"0", user_id:"jseokchoi", device_id:"d0", device_name:"G/W 1", parent_id:"", ip_addr:"127.0.0.1", setup_date:"2017-10-01"},
        {type:0, space_id:"1", user_id:"jseokchoi", device_id:"d1", device_name:"G/W 2", parent_id:"", ip_addr:"127.0.0.1", setup_date:"2017-10-02"},
        {type:0, space_id:"2", user_id:"jseokchoi", device_id:"d2", device_name:"G/W 3", parent_id:"", ip_addr:"127.0.0.1", setup_date:"2017-10-03"}]
        .map(function(el) {
            return {
                device_name: el.device_name,
                device_id: el.device_id
            };
        });
}
