export default function (baseURI, server) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
    var config = server.config();
    var sleep = require('sleep');
    var index_pattern=config.get('ems.index_pattern.data.index');
    var index_type=config.get('ems.index_pattern.data.type');
    var transaction = function(req, trans, params, callback) {
        callWithRequest(req,trans,params).then(function (resp) {
            callback(resp, null);
        }).catch(function (resp) {
            callback(resp, 'error');
        });
    };

    server.route({
        path: baseURI,
        method: 'GET',
        handler(req, reply) {
            if (!req.query.device_id){
                reply({result:false});
                return;
            }

            var params = {
                index: index_pattern,
                type: index_type,
                body:{
                    query: {
                        match: {
                            device_id: req.query.device_id
                        }
                    }
                }
            };

            transaction(req,'search', params, function(res,err) {
                var data =[];
                if (err == null) {
                    data = res.hits.hits;
                }

                reply(data);
            });
        }
    });

    server.route({
        path: baseURI,
        method: 'POST',
        handler(req, reply) {
            var data = req.payload;
            data.post_date = new Date().toISOString();//.replace(/\..+/, '');
            var params = {
                index: index_pattern,
                type: index_type,
                id: (new Date()).getTime(),
                body: data
            };

            if (server.queues) {
                var qs = server.queues.filter( function (e) {
                    var res=false;

                    for (var i=0; i< e.devices.length; i++) {
                        if (e.devices[i].device_id == data.device_id) {
                            res=true;
                            break;
                        }
                    }
                    return res;
                });

                for (var i=0; i< qs.length; i++) {
                    qs[i].data.push(data);
                }
            }

            transaction(req,'create',params, function(res,err) {
                if (err == null) {
                    reply(res);
                    return;
                }

                reply(res);
            });
        }
    });

    server.route({
        path: baseURI+"/lp/create",
        method: 'POST',
        handler(req, reply) {
            var data = req.payload;

            var q = {
                user_id: data.user_id,
                devices: data.devices,
                data: []
            };

            if (!server.queues) {
                server.queues=[];
            }

            var fq = server.queues.filter(function(e) {
                return e.user_id == data.user_id;
            });

            if (fq.length >= 1) {
                fq[0].devices = data.devices;
            } else {
                server.queues.push(q);
            }

            reply({result:"ok"});
        }
    });

    server.route({
        path: baseURI+"/lp",
        method: 'GET',
        handler(req, reply) {
            var user_id = req.query.user_id;

            var fq = server.queues.filter(function(e) {
                return e.user_id == user_id;
            })[0];

            reply({data:fq.data});
            fq.data=[];
        }
    });
}

