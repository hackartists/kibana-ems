import { resolve } from 'path';
import mainRoute from './server/routes';

export default function (kibana) {
  return new kibana.Plugin({
    id: 'ems',
    require: ['elasticsearch'],
    name: 'ems',
    configPrefix: 'ems',
    uiExports: {
      
      app: {
        title: 'Ems',
        description: 'EMS',
        main: 'plugins/ems/app',
        listed: false
      },

      links: [
        {
          id: 'ems:device',
          title: 'Device',
          order: 1,
          url: `/app/ems#/device`,
          description: 'interactively explore your data',
          icon: 'plugins/kibana/assets/discover.svg',
        }, {
          id: 'ems:history',
          title: 'History',
          order: 2,
          url: `/app/ems#/history`,
          description: 'design data visualizations',
          icon: 'plugins/kibana/assets/visualize.svg',
        }
      ],
      
      translations: [
        resolve(__dirname, './translations/es.json')
      ],
      
      
      hacks: [
        'plugins/ems/hack'
      ]
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        index_pattern: Joi.string().default('ems')
      }).default();
    },

    
    init(server, options) {
      // Add server routes and initialize the plugin here
      mainRoute(server);
    }
    

  });
};
