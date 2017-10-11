import chrome from 'ui/chrome';

export default function($http, $interval) {
    var baseURI = "/api/ems/data";
    var uri = {
        getData: {uri:chrome.addBasePath(baseURI + "/"), method:"GET"},
        pollingCreate: {uri:chrome.addBasePath(baseURI + "/lp/create"), method:"POST"},
        pollingData: {uri:chrome.addBasePath(baseURI + "/lp"), method:"GET"}
    };

    this.getData = function(device_id, callback) {
        var u = uri.getData;

        var req = {
            method: u.method,
            url: u.uri + "?device_id="+device_id
        };

        this.callAPI(req,function(res) {
            if(res.result){
                var data = [];

                for (var i=0; i<res.data.length; i++) {
                    var item = res.data[i]._source;
                    item._id = res.data[i]._id;
                    data.push(item);
                }

                callback(device_id,data);
            }
        });
    };

    this.polling = function(user_id, devices, callback) {
        var u = uri.pollingCreate;

        var req = {
            method: u.method,
            url: u.uri,
            data: {user_id:user_id,devices:devices}
        };

        this.callAPI(req,function(res) {
            var pollingData= function() {
                var u = uri.pollingData;

                var req = {
                    method: u.method,
                    url: u.uri + "?user_id="+user_id
                };

                $http(req).then(function successCallback(res) {
                    if(res.data.data.length >0) {
                        callback(res.data.data);
                    }
                }, function errorCallback(res) {
                });
            };

            $interval(pollingData, 1000);
        });

    };

    this.callAPI = function(req, callback) {
        $http(req).then(function successCallback(res) {
            callback({result:true, data:res.data});
        }, function errorCallback(res) {
            callback({result:false, data:res.data});
        });
    };
}
