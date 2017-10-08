export default function($timeout) {
    return {
        restrict: "A",
        scope: {cb:'&callbackFn'},
        link: function(scope, element, attrs) {
            attrs.$observe('id', function(val) {
                console.log(attrs.id);
                var id=attrs.id.replace("_history_view_blueprint","").replace("_history-chart","");
                scope.cb({id:id});
            });
        }
    };
}
