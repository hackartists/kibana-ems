import chrome from 'ui/chrome';

export default function($http) {
    var baseURI = "/api/ems/data";
    var uri = {
        getData: {uri:chrome.addBasePath(baseURI + "/"), method:"GET"}
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

    this.callAPI = function(req, callback) {
        $http(req).then(function successCallback(res) {
            callback({result:true, data:res.data});
        }, function errorCallback(res) {
            callback({result:false, data:res.data});
        });
    };
}
