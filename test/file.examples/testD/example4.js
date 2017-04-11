var yms = angular.module('odin.common');

/* DateWidget */
var DateWidget = function($http, paths) {
  return {
    restrict: 'A',
    scope: { value: '=' },
    link: function (scope, element, attrs) {
      if (scope.value == null) {
        scope.value = {};
        // scope.kind = "";
        // scope.value.values = [];
      }

      var getOptionsData = function() {
        var optionsUrl = paths.controllers.meta.MetaController.getWidgetMeta('date').url;
        $http.get(optionsUrl)
          .success(function(data, status) {
            var defaultOption = { name: '-- Select Option --', value: '' };
            data.unshift(defaultOption); // Prepend

            scope.optionData = data;
          })
          .error(function(data, status) {});
      };

      var config = {
        change: function(e) {
          var el = e.sender.element;
          var index = el.hasClass('start') ? 0 : 1;
          scope.value.values[index] = el.val();
          scope.$apply();
        }
      };

      element.find('.date-picker').kendoDatePicker(config);
      element.find('.datetime-picker').kendoDateTimePicker(config);

      scope.$watch('value.kind', function(kind, old_kind) {
        if (!kind || kind !== old_kind) {
          scope.value.values = [];
        }
      });

      getOptionsData();
    },
    templateUrl: '/templates/common/widgets/dateWidget.htm',
    replace: true
  };
};

// Minification-safe injection
DateWidget.$inject = ['$http', 'paths'];

// Register our directive
yms.directive('dateWidget', DateWidget);
