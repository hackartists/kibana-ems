import deviceRoute from './device';
import spaceRoute from './space';
import dataRoute from './data';

export default function (server) {
  var baseURI = '/api/ems';

  var subRoutes = [
    {uri: '/device', handler: deviceRoute},
    {uri: '/space', handler: spaceRoute},
    {uri: '/data', handler: dataRoute}
  ];

  for (var i=0; i< subRoutes.length; i++) {
    subRoutes[i].handler(baseURI + subRoutes[i].uri, server);
  }

  server.route({
    path: '/api/ems/example',
    method: 'GET',
    handler(req, reply) {
      reply({ time: (new Date()).toISOString() });
    }
  });

}
