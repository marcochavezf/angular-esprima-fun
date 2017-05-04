/**
 * Created by marcochavezf on 2/12/17.
 */
angular.module('myStatefulFilterApp', [])
  .filter('decorate', ['decoration', function(decoration) {

    function decorateFilter(input) {
      return decoration.symbol + input + decoration.symbol;
    }
    decorateFilter.$stateful = true;

    return decorateFilter;
  }]);
