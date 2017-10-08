import moment from 'moment';
import 'd3/d3.js';
import 'plugins/security/services/shield_user';

export function historyController($scope, $route, $compile, $interval, $http, $interpolate, $timeout, DeviceService, ShieldUser, DataService, SpaceService) {
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
                            var c = new Date(a.create_at);
                            var d = new Date(b.create_at);
                            return c-d;
                        });
                        history.device_data.push({device_id:device_id,data:data});
                        c_len--;
                        if (!c_len) {
                            history.getSpaces(function(data){
                                history.autoSelectSpaces();
                                $scope.$watch('$scope.selected_devices',function(){history.autoSelectSpaces();},true);
                            });
                            history.getChartOptions();
                            history.chart();
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
        history.chart(space.space_id);
    };

    var drawDeviceCircle = function(id, devices) {
        var svg = d3.select("#"+id).selectAll("svg");

        var circles = svg.selectAll("circle")
            .data(devices)
            .enter()
            .append("circle");
        circles
            .attr("id", "active")
            .attr("cx", function(d,i) { return d.location.x; })
            .attr("cy", function(d,i) { return d.location.y; })
            .attr("r", 20)
            .attr("fill", function(d,i) {return d.color;});

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
        var exp = $interpolate('{{sp.space_id}}');
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

    history.drawRealtimeView = function(space) {
        history.drawBlueprint(space);
    };

    history.drawAllRealtimeViews = function() {
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

    history.convertLabelToPixel = function(labels, data) {
    };

    history.drawCircles = function(svg,data) {
        var circles = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle");

        circles
            .attr("cx", 0)
            .attr("cy", history.chartOptions.svg_height);
        circles
            .transition()
            .delay(function(d, i) {
                return i * 100;
            })
            .duration(3000)
            .attr("cx", function(d, i) {
                return history.chartOptions.point_x(i);
            })
            .attr("cy", function(d, i) {
                return history.chartOptions.point_y(d);
            })
            .attr("r", function(d) {
                return history.chartOptions.circle_size;
            });
    };

    history.drawYLabels = function(svg, labels) {
        svg.selectAll("text")
            .data(labels)
            .enter()
            .append("text")
            .text(function(d) {
                return ""+d;
            })
            .attr("x", function(d,i) {
                return history.chartOptions.point_x(i);
            })
            .attr("y", function(d) {
                return history.chartOptions.svg_height-(history.chartOptions.padding/2);
            });
    };

    history.generateCoordinates = function() {
    };

    history.drawAxis = function(svg,dataset) {
        var xScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) { return d[0]; })])
            .range([0, history.chartOptions.svg_width]);
        var yScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function(d) { return d[1]; })])
            .range([0, history.chartOptions.svg_height]);

        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient("bottom")
            .ticks(5);

        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient("left")
            .ticks(5);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (history.chartOptions.svg_height - history.chartOptions.padding) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + history.chartOptions.padding + ",0)")
            .call(yAxis);
    };

    history.chart = function(id) {
        //var svg = d3.select("#history-svg");//.append("svg:svg");
        var data = [10, 15, 25, 120, 300, 100, 400, 30, 450];
        history.chartOptions.labels = data;
        //history.chartOptions.svg_width= d3.select("#history-chart").clientWidth;
        var svg = d3.select("#"+id+"_history-chart")
            .append("svg:svg")
            .attr("width",history.chartOptions.svg_width)
            .attr("height", history.chartOptions.svg_height);
        history.drawCircles(svg,data);
        history.drawAxis(svg,data);
        //history.drawYLabels(svg,history.chartOptions.labels);

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
