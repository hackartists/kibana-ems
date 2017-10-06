import chrome from 'ui/chrome';

export default function($http) {
    var baseURI = "/api/ems/device";
    var uri = {
        register: {uri:chrome.addBasePath(baseURI + "/register"), method:"POST"},
        modify: {uri:chrome.addBasePath(baseURI + "/modify"), method:"POST"},
        getDeviceList: {uri:chrome.addBasePath(baseURI + "/"), method:"GET"},
        getDeviceTypes: {uri:chrome.addBasePath(baseURI + "/types"), method:"GET"},
        test: {uri:chrome.addBasePath(baseURI + "/test"), method:"GET"}
    };

    this.register = function(device, callback) {
        var u = uri.register;

        var req = {
            method: u.method,
            url: u.uri,
            data: device
        };

        this.callAPI(req,callback);
    };

    this.modify = function(id, device, callback) {
        var u = uri.modify;

        var req = {
            method: u.method,
            url: u.uri,
            data: {id:id, device:device}
        };

        this.callAPI(req,callback);
    };

    this.getDeviceList = function(user_id, callback) {
        var u = uri.getDeviceList;

        var req = {
            method: u.method,
            url: u.uri + "?user_id="+user_id
        };

        this.callAPI(req,function(res) {
            if(res.result){
                var data = [];

                for (var i=0; i<res.data.length; i++) {
                    var item = res.data[i]._source;
                    item._id = res.data[i]._id;
                    data.push(item);
                }

                callback(data);
            }
        });
    };

    this.getDeviceTypes = function(callback) {
        var u = uri.getDeviceTypes;

        var req = {
            method: u.method,
            url: u.uri
        };

        this.callAPI(req,function(res) {
            if(res.result){
                var data = [];

                for (var i=0; i<res.data.length; i++) {
                    data.push(res.data[i]._source);
                }

                callback(data);
            }
        });
    };

    this.test = function(callback) {
        var u = uri.test;

        var req = {
            method: u.method,
            url: u.uri
        };

        this.callAPI(req,callback);
    };

    this.callAPI = function(req, callback) {
        $http(req).then(function successCallback(res) {
            callback({result:true, data:res.data});
        }, function errorCallback(res) {
            callback({result:false, data:res.data});
        });
    };
}
