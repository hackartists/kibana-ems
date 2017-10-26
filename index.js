import { resolve } from 'path';
import mainRoute from './server/routes';

export default function (kibana) {
  return new kibana.Plugin({
    id: 'ems',
    require: ['elasticsearch'],
    name: 'ems',
    configPrefix: 'ems',
    uiExports: {
     // managementSections: ['plugins/ems/management'],
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
          icon: 'plugins/kibana/assets/discover.svg'
        }, {
          id: 'ems:history',
          title: 'Monitoring',
          order: 2,
          url: `/app/ems#/monitor`,
          description: 'design data visualizations',
          icon: 'plugins/kibana/assets/visualize.svg'
        }
      ],
      translations: [
        resolve(__dirname, './translations/es.json')
      ]
      // hacks: [
      //   'plugins/ems/hack'
      // ]
    },

    config(Joi) {
      const { array, boolean, number, object, string } = Joi;

      return object({
        enabled: boolean().default(true),
        index_pattern: object({
          enabled: boolean().default(true),
          device: object({
            enabled: boolean().default(true),
            index: string().default("ems-dev"),
            type: string().default("device")
          }),
          device_type: object({
            enabled: boolean().default(true),
            index: string().default("ems-dt"),
            type: string().default("device_type")
          }),
          space: object({
            enabled: boolean().default(true),
            index: string().default("ems-sp"),
            type: string().default("space")
          }),
          data: object({
            enabled: boolean().default(true),
            index: string().default("ems-data"),
            type: string().default("data")
          })
        })
      }).default();
    },

    
    init(server, options) {
      // Add server routes and initialize the plugin here
      mainRoute(server);
    }
    

  });
};
