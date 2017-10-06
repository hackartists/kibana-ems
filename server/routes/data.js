export default function (baseURI, server) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
    var config = server.config();
    var index_pattern=config.get('ems.index_pattern');
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
                type: 'data',
                body:{
                    query: {
                        match: {
                            device_id: req.query.device_id
                        }
                    }
                }
            };

            transaction(req,'search', params, function(res,err) {
                if (err == null) {
                    res = res.hits.hits;
                }

                reply(res);
            });
        }
    });

    server.route({
        path: baseURI,
        method: 'POST',
        handler(req, reply) {
            var data = req.payload;
            data.create_at = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
            var params = {
                index: index_pattern,
                type: 'data',
                id: (new Date()).getTime(),
                body: data
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
}

