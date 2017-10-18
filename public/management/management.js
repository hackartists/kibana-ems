import { management } from 'ui/management';
import routes from 'ui/routes';
import 'plugins/security/services/shield_user';

routes.defaults(/\/management/, {
    resolve: {
        themeManagementSection: function (ShieldUser, Private, esDataIsTribe) {
            const tribeTooltip = 'Not available when using a tribe node.';
            function deregister() {
                management.deregister('themes');
            }

            function ensureRegistered() {
                const registerThemes = () => management.register('themes', {
                    display: 'Themes',
                    order: 1
                });
                const getThemes = () => management.getSection('themes');

                const themes = (management.hasItem('themes')) ? getThemes() : registerThemes();

                if (!themes.hasItem('templates')) {
                    themes.register('templates', {
                        order: 10,
                        display: 'Templates',
                        url: esDataIsTribe ? undefined : `#${TEMPLATES_PATH}`,
                        tooltip: esDataIsTribe ? tribeTooltip : undefined
                    });
                }
            }

            deregister();

            // getCurrent will reject if there is no authenticated user, so we prevent them from seeing the security
            // management screens
            //
            // $promise is used here because the result is an ngResource, not a promise itself
            return ShieldUser.getCurrent().$promise
                .then(ensureRegistered)
                .catch(deregister);
        }
    }
});
