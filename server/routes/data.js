var dateFormat = require('dateformat');

export default function (baseURI, server) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
    var config = server.config();
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

