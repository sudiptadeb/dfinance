/**
 * Created by sudi-3385 on 25/10/17.
 */
angular.module('dfinance.commonComponents', [])
    .directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
