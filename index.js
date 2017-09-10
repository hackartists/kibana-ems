import { resolve } from 'path';
import exampleRoute from './server/routes/example';

export default function (kibana) {
  return new kibana.Plugin({
    id: 'ems',
    require: ['elasticsearch'],
    translations: [resolve(__dirname, './translations/es.json')],

    uiExports: {
      hacks: ['plugins/ems/hack'],
      app: {
        title: 'Ems',
        description: 'EMS',
        main: 'plugins/ems/app'
      },

      links: [
        {
          id: 'ems:device',
          title: 'Device',
          order: 1,
          url: `/app/ems/#/device`,
          description: 'interactively explore your data',
          icon: 'plugins/kibana/assets/discover.svg',
        }, {
          id: 'ems:history',
          title: 'History',
          order: 2,
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
