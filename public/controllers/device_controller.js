import moment from 'moment';
import deviceHomeTemplate from '../templates/device-home.html';
import deviceListTemplate from '../templates/device.list.html';
import 'plugins/security/services/shield_user';

export function deviceController($scope, $route, $interval, $http, $sce,$compile, ShieldUser, NgMap) {
    var device = this;
    device.title = 'PNU EMS';
    device.description = 'Device page of EMS';
    device.homeTemplate = deviceHomeTemplate;

    device.currentTime = moment($route.current.locals.currentTime);
    device.displayTime = device.currentTime.format('HH:mm:ss');

    device.markers=[];

    NgMap.getMap().then(function(map) {
        console.log(map.getCenter());
        console.log('markers', map.markers);
        console.log('shapes', map.shapes);
    });

    device.addMarker = function(event) {
        var ll = event.latLng;
        device.markers.push({lat:ll.lat(), lng: ll.lng()});
    }

    $scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=AIzaSyBewkiCX67bKGcuLZ8z-DbGbzW8S9PxMvw";

    device.init = function () {
        device.setDeviceListTemplate();
    };

    device.setDeviceListTemplate = function() {
        var cv = angular.element(document.getElementById("cv"));
        cv.html(deviceListTemplate);
        $compile(cv.contents())($scope);
    };

    device.setDeviceHomeTemplate = function() {
        var cv = angular.element(document.getElementById("cv"));
        cv.html(deviceHomeTemplate);
        $compile(cv.contents())($scope);
    }

    device.select_device= function(dev) {
        device.selected_device=dev;
        device.selected_space = device.spaces.filter(function(e) {
            return device.selected_device.space_id == e.space_id
        })[0];

        device.selected_children = device.devices.filter(function(e) {
            return device.selected_device.device_id == e.parent_id
        });
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

    device.spaces = [{name:"Home", space_id:"sp0", location:"00", user_id:"jseokchoi", location:{lat:"35.2337171", lng:"129.0773478"}},
                     {name:"Office", space_id:"sp1", location:"00", user_id:"jseokchoi", location:{lat:"35.2337171", lng:"129.0773478"}},
                     {name:"School", space_id:"sp2", location:"00", user_id:"jseokchoi", location:{lat:"35.2337171", lng:"129.0773478"}}]
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
