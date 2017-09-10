import { resolve } from 'path';
import exampleRoute from './server/routes/server';

module.exports = function(kibana) {
  return new kibana.Plugin({
    name: 'ems',
    require:['kibana','elasticsearch'],
    uiExports: {
      app: {
        title: 'EMS',
        description: 'EMS plugin',
        main: 'plugins/ems/app',
        url: '/app/ems',
        injectVars: function (server, options) {
          var config = server.config();
          return {
            kbnIndex: config.get('kibana.index'),
            esShardTimeout: config.get('elasticsearch.shardTimeout'),
            esApiVersion: config.get('elasticsearch.apiVersion')
          };
        }
      },
    },

    init: function(server, options) {
      exampleRoute(server);
    }
  });
};

// export default function (kibana) {
//   return new kibana.Plugin({
//     require: ['elasticsearch'],
//     name: 'ems',
//     uiExports: {
      
//       app: {
//         title: 'Ems',
//         description: 'EMS plugin',
//         main: 'plugins/ems/app'
//       },
      
      
//       translations: [
//         resolve(__dirname, './translations/es.json')
//       ],
      
      
//       hacks: [
//         'plugins/ems/hack'
//       ]
      
//     },

//     config(Joi) {
//       return Joi.object({
//         enabled: Joi.boolean().default(true),
//       }).default();
//     },

    
//     init(server, options) {
//       // Add server routes and initialize the plugin here
//       exampleRoute(server);
//     }
    

//   });
// };
