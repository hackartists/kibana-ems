export default function (baseURI, server) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
    var config = server.config();
    var index_pattern=config.get('ems.index_pattern.space.index');
    var index_type=config.get('ems.index_pattern.space.type');
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
        path: baseURI + '/register',
        method: 'POST',
        handler(req, reply) {
            var space = req.payload;

            var params = {
                index: index_pattern,
                type: index_type,
                id: (new Date()).getTime(),
                body: space
            };

            transaction(req,'create',params, function(res,err) {
                reply(res);
            });
        }
    });

    server.route({
        path: baseURI + '/test',
        method: 'GET',
        handler(req, reply) {
            reply({ time: (new Date()).toISOString() });
        }
    });
}

