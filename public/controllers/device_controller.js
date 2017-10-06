import moment from 'moment';
import deviceRegisterTemplate from '../templates/device.register.html';
import deviceListTemplate from '../templates/device.list.html';
import spaceListTemplate from '../templates/space.list.html';
import spaceRegisterTemplate from '../templates/space.register.html';
import 'plugins/security/services/shield_user';

export function deviceController($scope, $route, $interval, $http, $sce,$compile,$timeout,$mdDialog, ShieldUser, NgMap, SpaceService, DeviceService) {
    var device = this;

    device.title = 'PNU EMS';
    device.description = 'Device page of EMS';

    device.space = {};

    $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyBewkiCX67bKGcuLZ8z-DbGbzW8S9PxMvw";

    device.init = function () {
        device.getDeviceTypes();

        ShieldUser.getCurrent(function(user){
            device.user=user;
            device.getSpaces(function(data){
                device.getDeviceList(function(devs){
                    device.select_device(device.devices[0]);
                });
            });
        });

        device.setDeviceListTemplate();
    };

    device.getDeviceList = function (callback) {
        // device.devices = [
        //     {device_name:"Plug1",type:2,user_id:"jseokchoi",space_id:"sp0",device_id:"dv1",parent_id:"sm1",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Plug2",type:2,user_id:"jseokchoi",space_id:"sp0",device_id:"dv2",parent_id:"sm2",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Plug3",type:2,user_id:"jseokchoi",space_id:"sp1",device_id:"dv3",parent_id:"sm3",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Plug4",type:2,user_id:"jseokchoi",space_id:"sp1",device_id:"dv4",parent_id:"sm4",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Meter1",type:1,user_id:"jseokchoi",space_id:"sp0",device_id:"sm1",parent_id:"gw1",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Meter2",type:1,user_id:"jseokchoi",space_id:"sp0",device_id:"sm2",parent_id:"gw1",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Meter3",type:1,user_id:"jseokchoi",space_id:"sp1",device_id:"sm3",parent_id:"gw2",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Meter4",type:1,user_id:"jseokchoi",space_id:"sp1",device_id:"sm4",parent_id:"gw2",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Gateway1",type:0,user_id:"jseokchoi",space_id:"sp0",device_id:"gw1",parent_id:"",ip_addr:"127.0.0.1",setup_date:"2017-01-01"},
        //     {device_name:"Gateway2",type:0,user_id:"jseokchoi",space_id:"sp1",device_id:"gw2",parent_id:"",ip_addr:"127.0.0.1",setup_date:"2017-01-01"}
        // ];
        DeviceService.getDeviceList(device.user.username, function(data){
            device.devices=data;
            if(callback) {
                callback(device.devices);
            }
        });
    };

    device.getDeviceTypes = function () {
        DeviceService.getDeviceTypes(function(data) {
            device.deviceTypes = data;
        });
    };

    device.getSpaces = function (callback) {
        SpaceService.getSpaceList(device.user.username, function(data) {
            device.spaces = data;
            if(callback){
                callback(data);
            }
        });
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
        $scope.item = params.item;
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

        $scope.dt_change = function() {
            $scope.args.parents = $scope.args.devices.filter(function(e){
                return (e.type == ($scope.item.type - 1));
            });
        };

        $scope.pr_change = function() {
            $scope.item.space_id = $scope.args.parents.filter(function(e){
                return (e.device_id == $scope.item.parent_id);
            })[0].space_id;
        };

        $scope.sp_change = function() {
            if($scope.item.parent_id != "" &&
               $scope.item.space_id !=
               $scope.args.parents.filter(function(e){
                return (e.device_id == $scope.item.parent_id);
            })[0].space_id) {
                $scope.item.parent_id = "";
            }
        };

        $scope.addMarker = function(location,map) {
            $scope.item.location={lat:location.lat(),lng:location.lng()};
            if ($scope.marker) {
                $scope.marker.setMap(null);
            } 
            $scope.marker = new google.maps.Marker({
                position: location,
                map: map
            });

        };
    }

    device.showDialog = function(ev,tmpl,params,callback) {
        $mdDialog.show({
            controller: DialogController,
            template: tmpl,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            locals: {
                params : params
            },
            onComplete:function(scope, element){
                var el = document.getElementById("space_map");
                if(el) {
                    var mapOptions = {
                        zoom: 14,
                        center: {lat:35.2337171, lng:129.0773478},
                        mapTypeControl: true
                    };
                    var map = new google.maps.Map(document.getElementById("space_map"), mapOptions);
                    google.maps.event.addListener(map, 'click', function(event) {
                        scope.addMarker(event.latLng, map);
                    });
                }
            },
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function(item) {
            callback(item);
        }, function() {});
    };

    device.modify = function(ev) {
        device.showDialog(ev, deviceRegisterTemplate, {
            deviceTypes:device.deviceTypes,
            spaces : device.spaces,
            devices : device.devices,
            parents: device.parents,
            item: device.selected_device,
            action: 'Modify'
        }, function(dev){
            var id = dev._id;
            delete dev._id;

            DeviceService.modify(id,dev, function(res) {
                console.log(res);
            });
        });
    };

    device.showDeviceRegisterDialog = function(ev) {
        device.showDialog(ev, deviceRegisterTemplate, {
            deviceTypes:device.deviceTypes,
            spaces : device.spaces,
            devices : device.devices,
            parents: device.parents
        }, function(dev){
            dev.user_id = device.user.username;
            DeviceService.register(dev, function(res) {
                console.log(res);
                device.getDeviceList(function(data){});
            });
        });
    };

    device.showSpaceRegisterDialog = function(ev) {
        device.showDialog(ev, spaceRegisterTemplate,{
            deviceTypes:device.deviceTypes,
            spaces : device.spaces,
            devices : device.devices,
            parents: device.parents
        }, function(sp){
            sp.user_id = device.user.username;
            SpaceService.register(sp,function(res) {
                console.log(res);
                device.getSpaces();
            });
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
            return device.selected_device.space_id == e.space_id;
        })[0];

        device.selected_children = device.devices.filter(function(e) {
            return device.selected_device.device_id == e.parent_id;
        });

        NgMap.getMap().then(function(map) {
            map.setCenter(device.selected_space.location); 
        });
    };

    device.select_space= function(sp) {
        device.selected_space=sp;

        device.selected_devices = device.devices.filter(function(e) {
            return device.selected_space.space_id == e.space_id;
        });

        NgMap.getMap().then(function(map) {
            map.setCenter(device.selected_space.location); 
        });
    };

    device.switch_to_device_view = function(dev) {
        device.setDeviceListTemplate();
        device.select_device(dev);
    };

    device.init();
}
