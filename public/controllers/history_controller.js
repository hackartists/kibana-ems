import moment from 'moment';
import 'd3/d3.js';
import 'plugins/security/services/shield_user';
import 'jscolor-picker/jscolor.js';
import 'chart.js';
import colorTemplate from '../templates/color_picker.html';

export function historyController($scope, $route, $compile, $interval, $http, $mdDialog, $interpolate, $timeout, DeviceService, ShieldUser, DataService, SpaceService) {
    var history = this;
    history.title = 'PNU EMS';
    history.description = 'Device page of EMS';
    $scope.selected_devices=[];
    history.selected_spaces=[];
    history.spaces=[];
    history.group=[];
    history.device_data=[];
    history.filterSelected = true;
    history.chartOptions = {};

    $scope.$watch(function(scope) { return scope.selected_devices.length; },
                  function(newValue, oldValue) {
                      console.log(newValue);
                      console.log(oldValue);
                      history.drawAllRealtimeViews();
                  });

    history.getChartOptions = function(){
        history.chartOptions = {
            circle_size: 2,
            svg_width:1000,
            svg_height:500,
            padding: 10,
            labels: [],
            point_y: function(y) {
                return history.chartOptions.svg_height - y - history.chartOptions.padding;
            },
            point_x: function(x) {
                return (history.chartOptions.svg_width-(history.chartOptions.padding*2))/history.chartOptions.labels.length * x + history.chartOptions.padding;
            }
        };
    };

    history.init = function() {
        ShieldUser.getCurrent(function(user){
            history.user=user;
            history.getDeviceList(function(devs){
                var c_len=history.devices.length;
                for (var i=0; i<history.devices.length; i++) {
                    $scope.selected_devices.push(history.devices[i]);
                    DataService.getData(history.devices[i].device_id, function(device_id,data){
                        data.sort(function(a,b){
                            var c = new Date(a.post_date);
                            var d = new Date(b.post_date);
                            return c-d;
                        });
                        history.device_data.push({device_id:device_id,data:data});
                        c_len--;
                        if (!c_len) {
                            history.getSpaces(function(data){
                                history.autoSelectSpaces();
                            });
                            //history.getChartOptions();
                            //history.chart();
                        }
                    });
                }
            });
        });
    };

    history.autoSelectSpaces = function() {
        history.selected_spaces = [];
        for(var k=0; k< history.spaces.length; k++){
            var e = history.spaces[k];
            var will_checked=false;
            for (var i=0; i< $scope.selected_devices.length; i++) {
                if(e.space_id == $scope.selected_devices[i].space_id) {
                    will_checked=true;
                    break;
                }
            }

            if(will_checked){
                var exist=false;
                for (var i=0; i< history.selected_spaces.length; i++){
                    if(e.space_id == history.selected_spaces[i].space_id){
                        exist=true;
                        break;
                    }
                }
                if(!exist){
                    history.selected_spaces.push(e);
                }
            }
        }
    };

    history.drawBlueprintFromSpaceID = function(space_id){
        var space = history.selected_spaces.filter(function(e){
            return e.space_id == space_id;
        })[0];

        var group = history.group.filter(function(e){
            return e.space.space_id == space.space_id;
        });

        if (!group.length) {
            history.group.push({space:space});
        }

        history.drawBlueprint(space);
    };

    history.drawChartFromSpaceID = function(space_id){
        var space = history.selected_spaces.filter(function(e){
            return e.space_id == space_id;
        })[0];

        var group = history.group.filter(function(e){
            return e.space.space_id == space.space_id;
        });

        if (!group.length) {
            history.group.push({space:space});
        }

        //history.chart(space.space_id);
        history.drawLineChart(space);
    };

    var drawDeviceCircle = function(id, devices) {
        var svg = d3.select("#"+id).selectAll("svg");

        var circles = svg.selectAll("circle")
            .data(devices)
            .enter()
            .append("circle");
        circles
            .attr("id", function(d) { return d.device_id; })
            .attr("cx", function(d,i) { return d.location.x; })
            .attr("cy", function(d,i) { return d.location.y; })
            .attr("r", 20)
            .attr("fill", function(d,i) {return d.color;})
            .on("click", function(d) {
                var s = this;
                showDialog(function(color){
                    d.color=color;
                    s.attributes[4].value=d.color;
                    deviceChartUpdate(d);
                });
            });

        var texts = svg.selectAll("text")
            .data(devices)
            .enter()
            .append("text");
        texts
            .attr("x", function(d,i) { return d.location.x; })
            .attr("y", function(d,i) { return d.location.y+30; })
            .attr("text-anchor", "middle")
            .text(function(d) { return d.device_name; });
    };

    function DialogController($scope, $mdDialog, $timeout) {
        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.select = function() {
            $mdDialog.hide($scope.color);
        };

        $scope.toRGB = function(color) {
            $scope.color=color.toHexString();
        };
    }

    var showDialog = function(callback) {
        $mdDialog.show({
            controller: DialogController,
            template: colorTemplate,
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        }).then(function(item) {
            callback(item);
        }, function() {});
    };

    var deviceChartUpdate = function(device) {
        var g = history.group.filter(function(e) {
            var s = e.devices.filter(function(d){
                return d.device_id == device.device_id;
            });

            return s.length > 0;
        })[0];

        var ds = g.config.data.datasets.filter(function(e){
            return e.label == device.device_name;
        })[0];
        ds.backgroundColor= device.color;
        ds.borderColor= device.color;
        g.chart.update();
    };

    history.selectSpaceDevices = function(space) {
        var group = history.group.filter(function(e){
            return e.space.space_id == space.space_id;
        })[0];

        group.devices = $scope.selected_devices.filter(function(e){
            return e.space_id == group.space.space_id;
        });

        for(var i=0; i< group.devices.length; i++) {
            group.devices[i].color = "#" + Math.floor(Math.random() * 0xffffff).toString(16);
        }
    };

    history.drawBlueprint = function(space) {
        var id=space.space_id+"_history_view_blueprint";
        var el = document.getElementById(id);
        if(el) {
            var output = angular.element(el);
            if (space.blueprint){
                output.html(space.blueprint);
            } else {
                output.html("");
            }
            $compile(output.contents())($scope);
        }

        history.selectSpaceDevices(space);

        var group = history.group.filter(function(e){
            return e.space.space_id == space.space_id;
        })[0];

        drawDeviceCircle(id,group.devices);
    };

    history.drawLineChart = function(space) {
        var datasets = [];

        var group = history.group.filter(function(e){
            return e.space.space_id == space.space_id;
        })[0];

        for(var i=0; i < group.devices.length; i++) {
            var device = group.devices[i];
            var data = [];
            device.data = data;

            datasets.push({
                label: device.device_name,
                backgroundColor: device.color,
                borderColor: device.color,
                data: data,
                fill: false
            });
        }

        var config = {
            type: 'line',
            data: {
                labels: [],
                datasets: datasets
            },
            options: {
                responsive: true,
                title:{
                    display:true,
                    text:space.name + ' Device Line Chart'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Time series'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Value'
                        }
                    }]
                }
            }
        };

        var ctx = document.getElementById(space.space_id+"_history-chart").getContext("2d");
        group.chart = new Chart(ctx, config);
        group.config = config;

        DataService.polling(history.user.username, $scope.selected_devices, function(data) {
            var new_x=new Date().toISOString();
            for (var i=0; i< history.group.length; i++) {
                var g = history.group[i];
                var remove = false;

                if (g.config.data.labels.length > 29) {
                    remove=true;
                    g.config.data.labels.shift();
                }

                g.config.data.datasets.forEach(function(dataset) {
                    var d = $scope.selected_devices.filter(function(e) {
                        return e.device_name == dataset.label;
                    })[0];
                    var fd = data.filter(function(e){ return e.device_id == d.device_id; });

                    if (remove) {
                        dataset.data.shift();
                    }

                    for (var s=0; s < fd.length; s++) {
                        dataset.data.push(fd[s].value);
                        if (g.config.data.labels.length < dataset.data.length) {
                            g.config.data.labels.push(new_x);
                        }
                    }
                });

                g.chart.update();
            }
        });
    };

    history.drawRealtimeView = function(space) {
        history.drawBlueprint(space);
        history.drawLineChart(space);
    };

    history.drawAllRealtimeViews = function() {
        for (var i=0; i< history.group.length; i++) {
            history.group[i].chart.destroy();
        }
        history.group=[];
        history.autoSelectSpaces();

        for(var i=0; i < history.selected_spaces.length; i++) {
            var space = history.selected_spaces[i];
            history.group.push({space:space});
            history.drawRealtimeView(space);
        }
    };

    history.getSpaces = function (callback) {
        SpaceService.getSpaceList(history.user.username, function(data) {
            history.spaces = data;
            if(callback){
                callback(data);
            }
        });
    };

    history.getDeviceList = function (callback) {
        DeviceService.getDeviceList(history.user.username, function(data){
            history.devices=data;
            if(callback) {
                callback(history.devices);
            }
        });
    };

    history.querySearch = function (criteria) {
        var res=history.devices;

        if (criteria) {
            res = history.devices.filter(history.createFilterFor(criteria));
        }

        return res;
    };

    history.createFilterFor = function (query) {
        var lowercaseQuery = angular.lowercase(query);

        return function (device) {
            return (device.device_name.toLowerCase().indexOf(lowercaseQuery) != -1);
        };
    };

    history.init();
}
