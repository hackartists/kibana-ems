export default function (baseURI, server) {
    var routeHandlers = [
        {uri:'/register',method:'POST',handler:register},
        {uri:'/',method:'GET',handler:getDeviceList}
    ];

    for (var i=0; i < routeHandlers.length; i++) {
        var r = routeHandlers[i];
        server.route({
            path: baseURI + r.uri,
            method: r.method,
            handler(req, reply) {
                r.handler(server, req,reply);
            }
        });
    }
}

function register(server, req, reply) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
    var config = server.config();
    var device = req.body.device;

    var deviceParam = {
        index: config.get('ems.index_pattern'),
        type: 'device',
        body: device
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

function getDeviceList(server, req, reply) {
    const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
    var config = server.config();
    var device = req.body.device;

    var deviceParam = {
        index: config.get('ems.index_pattern'),
        type: 'device'
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
