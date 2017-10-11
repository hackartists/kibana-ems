import moment from 'moment';
import 'd3/d3.js';
import deviceRegisterTemplate from '../templates/device.register.html';
import deviceListTemplate from '../templates/device.list.html';
import spaceListTemplate from '../templates/space.list.html';
import spaceRegisterTemplate from '../templates/space.register.html';
import 'plugins/security/services/shield_user';

export function deviceController($scope, $route, $interval, $http, $sce,$compile,$timeout,$mdDialog, ShieldUser, NgMap, SpaceService, DeviceService) {
    var device = this;
    var space = this;

    var drawBlueprint = function(el) {
        if(el) {
            var output = angular.element(el);
            if (device.selected_space.blueprint){
                output.html(device.selected_space.blueprint);
            } else {
                output.html("");
            }
            $compile(output.contents())($scope);
        }
    };

    var drawDeviceCircle = function(id, location, color) {
        if (location) {
            var svg = d3.select("#"+id).selectAll("svg");
            var newg = svg.append("g")
                .data([{x: location.x, y: location.y}]);

            $scope.dragrect = newg.append("circle")
                .attr("id", "active")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", 20)
                .attr("fill", color);
        }
    };

    space.spaceViewBlueprint = function() {
        var el = document.getElementById("draw_blueprint");
        drawBlueprint(el);
    };

    var devDialogBlueprint = function() {
        var el = document.getElementById("dev_dial_draw_blueprint");
        drawBlueprint(el);
    };

    device.devViewBlueprint = function() {
        var el = document.getElementById("dev_view_draw_blueprint");
        drawBlueprint(el);
        drawDeviceCircle("dev_view_draw_blueprint",device.selected_device.location,"red");
    };

    var mapTunning = function(scope) {
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

    };

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
                    device.setDeviceListTemplate();
                });
            });
        });
    };

    device.getDeviceList = function (callback) {
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

        var addDeviceCircle = function() {
            var drag = d3.behavior.drag()
                .origin(Object)
                .on("drag", function(d){
                    $scope.dragrect
                        .attr("cx", d.x = Math.max(0, Math.min(700, d3.event.x)))
                        .attr("cy", d.y = Math.max(0, Math.min(500, d3.event.y)));
                    $scope.item.location={x:d.x, y:d.y};
                });

            var svg = d3.select("#dev_dial_draw_blueprint").selectAll("svg");
            $scope.item.location={x:350, y:250};
            var newg = svg.append("g")
                .data([{x: $scope.item.location.x, y: $scope.item.location.y}]);

            $scope.dragrect = newg.append("circle")
                .attr("id", "active")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; })
                .attr("r", 20)
                .attr("fill", "red")
                .attr("cursor", "move")
                .call(drag);
        };

        var dialogDrawBlueprint = function(space_id) {
            var sp = $scope.args.spaces.filter(function(e){
                return (e.space_id == space_id);
            })[0];

            var el = document.getElementById("dev_dial_draw_blueprint");
            if(el) {
                var output = angular.element(el);
                if (sp.blueprint){
                    output.html(sp.blueprint);
                    $compile(output.contents())($scope);
                    addDeviceCircle();
                } else {
                    output.html("");
                    $compile(output.contents())($scope);
                    delete $scope.item.location;
                }
            }
        };

        $scope.openFile = function(event) {
            var input = event.target;

            var reader = new FileReader();
            reader.onload = function(){
                var data = reader.result;
                $scope.item.blueprint=data;
                var output = angular.element(document.getElementById('dial_draw_blueprint'));
                output.html(data);
                $compile(output.contents())($scope);
            };
            reader.readAsText(input.files[0]);
        };

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
            dialogDrawBlueprint($scope.item.space_id);
        };

        $scope.sp_change = function() {
            if($scope.item.parent_id && $scope.item.space_id &&
               $scope.item.parent_id != "" &&
               $scope.item.space_id !=
               $scope.args.parents.filter(function(e){
                   return (e.device_id == $scope.item.parent_id);
               })[0].space_id) {
                $scope.item.parent_id = "";
            }
            dialogDrawBlueprint($scope.item.space_id);
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
                mapTunning(scope);
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
            parents: device.parents,
            item: {}
        }, function(dev){
            dev.user_id = device.user.username;
            DeviceService.register(dev, function(res) {
                console.log(res);
                if(res.result) {
                    device.devices.push(dev);
                }
            });
        });
    };

    device.showSpaceRegisterDialog = function(ev) {
        device.showDialog(ev, spaceRegisterTemplate,{
            deviceTypes:device.deviceTypes,
            spaces : device.spaces,
            devices : device.devices,
            parents: device.parents,
            item: {}
        }, function(sp){
            sp.user_id = device.user.username;
            SpaceService.register(sp,function(res) {
                console.log(res);
                if(res.result) {
                    device.spaces.push(sp);
                }
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

        device.devViewBlueprint();
    };

    device.select_space= function(sp) {
        device.selected_space=sp;

        device.selected_devices = device.devices.filter(function(e) {
            return device.selected_space.space_id == e.space_id;
        });

        NgMap.getMap().then(function(map) {
            map.setCenter(device.selected_space.location); 
        });

        space.spaceViewBlueprint();
    };

    device.switch_to_device_view = function(dev) {
        device.setDeviceListTemplate();
        device.select_device(dev);
    };

    device.init();
}
