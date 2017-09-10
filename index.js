import { resolve } from 'path';
import exampleRoute from './server/routes/example';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],
    name: 'ems',
    uiExports: {
      
      app: {
        title: 'Ems',
        description: 'EMS',
        main: 'plugins/ems/app'
      },
      
      
      translations: [
        resolve(__dirname, './translations/es.json')
      ],
      
      
      hacks: [
        'plugins/ems/hack'
      ],

      links: [
        {
          id: 'ems:device',
          title: 'Device',
          order: -1003,
          url: `/app/ems/#/device`,
          description: 'interactively explore your data',
          icon: 'plugins/kibana/assets/discover.svg',
        }, {
          id: 'ems:history',
          title: 'History',
          order: -1002,
          url: `/app/ems/#/history`,
          description: 'design data visualizations',
          icon: 'plugins/kibana/assets/visualize.svg',
        }
      ]
      
    },

    config(Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
      }).default();
    },

    
    init(server, options) {
      // Add server routes and initialize the plugin here
      exampleRoute(server);
    }
    

  });
};
