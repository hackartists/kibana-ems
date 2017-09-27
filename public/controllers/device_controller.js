import moment from 'moment';
import deviceRegisterTemplate from '../templates/device.register.html';
import deviceListTemplate from '../templates/device.list.html';
import spaceListTemplate from '../templates/space.list.html';
import spaceRegisterTemplate from '../templates/space.register.html';
import testDialogTemplate from '../templates/test.html';
import 'plugins/security/services/shield_user';

export function deviceController($scope, $route, $interval, $http, $sce,$compile,$timeout,$mdDialog, ShieldUser, NgMap) {
    var device = this;
    device.title = 'PNU EMS';
    device.description = 'Device page of EMS';
    device.space = {};

    $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyBewkiCX67bKGcuLZ8z-DbGbzW8S9PxMvw";

    device.init = function () {
        device.setDeviceListTemplate();
    };

    device.setTemplate = function(tmpl) {
        var cv = angular.element(document.getElementById("cv"));
        cv.html(tmpl);
        $compile(cv.contents())($scope);
        NgMap.getMap().then(function(map) {
            google.maps.event.trigger(map, 'resize');
        });
    };

    function DialogController($scope, $mdDialog, $timeout, NgMap, params) {
        $scope.item = {};
        $scope.args = params;

        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.register = function() {
            $mdDialog.hide($scope.item);
        };

        $scope.addMarker = function(event) {
            var ll = event.latLng;
            $scope.item.location={lat:ll.lat(),lng:ll.lng()};
            NgMap.getMap().then(function(map) {
                google.maps.event.trigger(map, 'resize');
                map.setCenter($scope.item.location); 
            });
        }
    }

    device.showDialog = function(ev,tmpl, callback) {
        
        $mdDialog.show({
            controller: DialogController,
            template: tmpl,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
                params : {
                    deviceTypes:device.deviceTypes,
                    spaces : device.spaces,
                    parents: device.parents
                },
            },
            onComplete:function(scope, element){
                var el = document.getElementById("space_map")
                if(el) {
                    var mapOptions = {
                        zoom: 14,
                        center: {lat:35.2337171, lng:129.0773478},
                        disableDefaultUI: true
                    };
                    var map = new google.maps.Map(document.getElementById("space_map"), mapOptions);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: {lat:35.2337171, lng:129.0773478}
                    });
                }
            },
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function(item) {
            callback(item);
        }, function() {});

    
    };

    device.showDeviceRegisterDialog = function(ev) {
        device.showDialog(ev, deviceRegisterTemplate, function(dev){
        });
    };

    device.showSpaceRegisterDialog = function(ev) {
        device.showDialog(ev, spaceRegisterTemplate, function(sp){
        });
    };

    device.setDeviceListTemplate = function() {
        device.setTemplate(deviceListTemplate);
    };


    device.setSpaceListTemplate = function() {
        device.setTemplate(spaceListTemplate);
    };

    device.select_device= function(dev) {
        device.selected_device=dev;
        device.selected_space = device.spaces.filter(function(e) {
            return device.selected_device.space_id == e.space_id
        })[0];

        device.selected_children = device.devices.filter(function(e) {
            return device.selected_device.device_id == e.parent_id
        });

        NgMap.getMap().then(function(map) {
            map.setCenter(device.selected_space.location); 
        });
    };

    device.select_space= function(sp) {
        device.selected_space=sp;

        device.selected_devices = device.devices.filter(function(e) {
            return device.selected_space.space_id == e.space_id
        });

        NgMap.getMap().then(function(map) {
            map.setCenter(device.selected_space.location); 
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

    device.spaces = [{name:"Home", space_id:"sp0", user_id:"jseokchoi", location:{lat:35.2337171, lng:129.0773478}},
                     {name:"Office", space_id:"sp1", user_id:"jseokchoi", location:{lat:35.2337171, lng:129.0773478}},
                     {name:"School", space_id:"sp2", user_id:"jseokchoi", location:{lat:35.2337171, lng:129.0773478}}]
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
