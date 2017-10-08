export default function (baseURI, server) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
    var config = server.config();
    var index_pattern=config.get('ems.index_pattern.device.index');
    var index_type=config.get('ems.index_pattern.device.type');
    var dt_index_pattern=config.get('ems.index_pattern.device_type.index');
    var dt_index_type=config.get('ems.index_pattern.device_type.type');
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
            if (!req.query.user_id){
                reply({result:false});
                return;
            }

            var params = {
                index: index_pattern,
                type: index_type,
                body:{
                    query: {
                        match: {
                            user_id: req.query.user_id
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
        path: baseURI + "/types",
        method: 'GET',
        handler(req, reply) {
            var params = {
                index: dt_index_pattern,
                type: dt_index_type
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
        path: baseURI + '/register',
        method: 'POST',
        handler(req, reply) {
            var device = req.payload;
            var params = {
                index: index_pattern,
                type: index_type,
                id: (new Date()).getTime(),
                body: device
            };

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
        path: baseURI + '/modify',
        method: 'POST',
        handler(req, reply) {
            console.log("/modify");
            console.log(req.payload);
            var device = req.payload.device;
            var id = req.payload.id;
            var params = {
                index: index_pattern,
                type: index_type,
                id: id,
                body: {doc:device}
            };

            transaction(req,'update',params, function(res,err) {
                reply(res);
            });
        }
    });

    server.route({
        path: baseURI + '/test',
        method: 'GET',
        handler(req, reply) {
            console.log("test function");
            reply({ time: (new Date()).toISOString() });
        }
    });
}

