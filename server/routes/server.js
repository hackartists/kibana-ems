moudle.exports = function (server) {

  server.route({
    path: '/api/ems/example',
    method: 'GET',
    handler: function(req, reply) {
      reply({ time: (new Date()).toISOString() });
    }
  });

  server.route({
    path: '/api/ems/config',
    method: 'GET',
    handler: function(req, reply) {
      reply({
        ok: true,
        config: require('../../ems.json')
      });
    }
  });

}
