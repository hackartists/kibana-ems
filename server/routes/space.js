export default function (baseURI, server) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
    var config = server.config();

    server.route({
        path: baseURI,
        method: 'GET',
        handler(req, reply) {
            var deviceParam = {
                index: config.get('ems.index_pattern'),
                type: 'space'
            };

            callWithRequest(req,'search',deviceParam).then(function (resp) {
                reply({
                    ok: true,
                    resp: resp
                });
            }).catch(function (resp) {
                if (resp.isBoom) {
                    reply(resp);
                } else {
                    console.error("Error while executing search",resp);
                    reply({
                        ok: false,
                        resp: resp
                    });
                }
            });
        }
    });

    server.route({
        path: baseURI + '/register',
        method: 'POST',
        handler(req, reply) {
            console.log("register space");
            console.log(req.payload);
            var space = req.payload;

            var deviceParam = {
                index: config.get('ems.index_pattern'),
                type: 'space',
                id: (new Date()).getTime(),
                body: space
            };

            callWithRequest(req,'create',deviceParam).then(function (resp) {
                reply({
                    ok: true,
                    resp: "ok"
                });
            }).catch(function (resp) {
                if (resp.isBoom) {
                    reply(resp);
                } else {
                    console.error("Error while executing search",resp);
                    reply({
                        ok: false,
                        resp: resp
                    });
                }
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

