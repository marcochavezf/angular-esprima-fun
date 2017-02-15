/**
 * Created by marcochavezf on 2/13/17.
 */
var formsModule = angular.module('arvak.forms');

formsModule.directive('arField', ['$http', '$compile', '$timeout', '$ionicModal', 'ModalService', '$filter', '$templateCache',
  function arField($http, $compile, $timeout, $ionicModal, ModalService, $filter, $templateCache) {

    var getTemplateUrl = function (scope, field, element) {
      if(field.displayFormat.outputOnly){
        field.validation.readOnly = true;
      }

      var type = '';
      if(_.isUndefined(field.widget.template)){
        type = field.widget.editWidget;
        field.widget.template = field.widget.editWidget;
      }else{
        type = field.widget.template;
      }
      type = type.toLowerCase();


      if(type === "number") {
        type += ":"+field.ddEntry.formatting.numberType;
      }

      var templateUrl = '';
      if( _.isUndefined(scope.model) ) {
        scope.model = { value: ''};
      }
      element.attr('data-pri-type',type);
      // Change this to dictionary object so that it can be injected at runtime.
      switch (type) {
        case 'anchor':
          //nothing.
          break;
        case 'organization-relationship':
          updateCheckboxRadioModel(scope, field);
          templateUrl = 'js/forms/templates/fields/orgrelationship.htm';
          break;
        case 'key-lookup':

          updateCheckboxRadioModel(scope, field);
          templateUrl = 'js/forms/templates/fields/keylookup.htm';
          break;
        case 'user-assignment':
          updateCheckboxRadioModel(scope, field);
          templateUrl = 'js/forms/templates/fields/user-lookup.htm';

          break;
        case 'composite':
          templateUrl = 'js/forms/templates/fields/composite.htm';
          break;
        case 'textbox':
        case 'text':
          if(field.ddEntry.ddTypeId===23){
            timePickerDate(scope, field);
            templateUrl = 'js/forms/templates/fields/date.htm';
          }else{
            templateUrl = 'js/forms/templates/fields/textbox.htm';
          }
          break;
        case 'geolocation':
          templateUrl = 'js/forms/templates/fields/geolocation.htm';
          break;
        case 'relationship':
          updateCheckboxRadioModel(scope, field);
          templateUrl = 'js/forms/templates/fields/keylookup.htm';
          break;
        case 'url':
          templateUrl = 'js/forms/templates/fields/url.htm';
          break;
        case 'section_header':
          templateUrl = 'js/forms/templates/fields/header.htm';
          break;

        case 'multiselect':
        case 'multi-select':
        case 'checkbox':
        case 'checkboxgroup':
          updateCheckboxRadioModel(scope, field);
          templateUrl = 'js/forms/templates/fields/checkbox.htm';
          break;
        case 'radiobutton':
        case 'radiogroup':
          templateUrl = 'js/forms/templates/fields/radiobutton.htm';
          break;
        case 'select':
        case 'auto-complete':
        case 'select-autocomplete':
        case 'ordering':
          templateUrl = 'js/forms/templates/fields/auto-complete.htm';
          break;
        case 'phone':
          templateUrl = 'js/forms/templates/fields/phone.htm';
          break;
        case 'email':
        case 'email-single':
        case 'email-multiple':
          templateUrl = 'js/forms/templates/fields/email.htm';
          break;
        case 'textarea':
          templateUrl = 'js/forms/templates/fields/textarea.htm';
          break;

        case 'date':

          timePickerDate(scope, field);
          templateUrl = 'js/forms/templates/fields/date.htm';
          break;
        case 'datetime':
          timePickerDatetime(scope, field);
          templateUrl = 'js/forms/templates/fields/datetime.htm';
          break;
        case 'time':
          templateUrl = 'js/forms/templates/fields/time.htm';
          break;
        case 'boolean':
        case 'true-false':


          templateUrl = 'js/forms/templates/fields/boolean.htm';
          break;
        case 'password':
          templateUrl = 'js/forms/templates/fields/password.htm';
          break;
        case 'slider':
          updateSliderModel(scope, field);
          templateUrl = 'js/forms/templates/fields/slider.htm';
          break;
        case 'range':
          updateRangeModel(scope, field);
          templateUrl = 'js/forms/templates/fields/range.htm';
          break;
        case 'number:decimal':

          templateUrl = 'js/forms/templates/fields/decimal.htm';
          break;
        case 'number:integer':
          templateUrl = 'js/forms/templates/fields/integer.htm';
          break;
        case 'number:percentage':
          templateUrl = 'js/forms/templates/fields/percentage.htm';
          break;
        case 'duration':
          updateDurationModel(scope, field);
          templateUrl = 'js/forms/templates/fields/duration.htm';
          break;
        case 'formatted text':
        case 'formatted':
          templateUrl = 'js/forms/templates/fields/desktop-only.htm';
          break;
        case 'signature':

          templateUrl = 'js/forms/templates/fields/signature.htm';
          break;
        case 'img-gallery':
          templateUrl = 'js/forms/templates/fields/img-gallery.htm';
          break;
        default:
          templateUrl = 'js/forms/templates/fields/default.htm';
          break;
      }

      return templateUrl;
    };

    var timePickerDatetime = function timePickerDatetime(scope, field) {
      scope.timePickerOptions.pickDate = true;
      scope.timePickerOptions.pickTime = true;
      scope.timePickerOptions.format   = 'MM/DD/YYYY hh:mm A';

    };
    var timePickerDate = function timePickerDate(scope, field){
      scope.timePickerOptions.pickDate = true;
      scope.timePickerOptions.pickTime = false;
      scope.timePickerOptions.format   = 'MM/DD/YYYY';
    };


    var updateRangeModel = function updateRangeModel(scope, field) {
      var res = field.ddEntry.formatting.value.split(";");
      scope.model.valueLow  =  res[0];
      scope.model.valueHigh =  res[1];
    };
    var updateSliderModel = function updateSliderModel(scope, field) {
      field.ddEntry.formatting.value = parseInt(field.ddEntry.formatting.value);
      scope.model.value  = field.ddEntry.formatting.value;
    };

    var updateCheckboxRadioModel = function updateCheckboxRadioModel(scope, field) {
      //not needed! woot.
    };

    var updateDurationModel = function updateDurationModel(scope, field) {
      scope.model.formatting = {};
      scope.model.formatting.iso_8601 = "";
      scope.model.days =0;
      scope.model.hours =0;
      scope.model.minutes =0;
      scope.model.seconds =0;

    };

    var linker = function (scope, element, attrs) {

      var templateUrl = getTemplateUrl(scope, scope.field, element);

      // attrs.$observe('ngDisplayOnly', function(value) {
      //   scope.field.validation.readOnlyNow = (value === 'true');
      // });

      if(scope.field.widget.template !== "anchor") {
        //console.log(scope.field.widget.template);

        $http.get(templateUrl,  {
          cache: $templateCache
        }).success(function (data) {
          element.html(data);
          $compile(element.contents())(scope);

          $timeout(function() {


            var type = '';
            if(_.isUndefined(scope.field.widget.template)){
              type = scope.field.widget.editWidget;
              scope.field.widget.template = scope.field.widget.editWidget;
            }else{
              type = scope.field.widget.template;
            }
            type = type.toLowerCase();





            if(type == 'checkbox'  || type == 'multi-select' || type == 'multiselect' || type == 'checkboxgroup' ) {
              scope.optionsListOrig = _.clone(scope.field.ddEntry.options.optionsList);
              $ionicModal.fromTemplateUrl("modal-checkbox.html",  {
                scope: scope,
                animation: 'slide-in-up'
              }).then(function(modal){
                scope.modal = modal;


                if(scope.field.widget.helperTemplate == 'ordering') {



                  scope.$watch('field.model.value', function(newVal, oldVal){

                    if(!_.isUndefined(newVal) && (!_.isEmpty(newVal))){
                      scope.field.model.sorted = _.map(newVal, function(item, index){
                        //console.log(index);
                        return {
                          id:item,
                          name:ModalService.findFieldName(item),
                          prefix:ModalService.findFieldByFilterId(item).prefix

                        };
                      });

                    }
                  });


                  //scope.optionsListOrig = _.clone(scope.field.ddEntry.options.optionsList);
                  scope.openModalOrderItems = function(){

                    $ionicModal.fromTemplateUrl("modal-ordering.html", {
                      scope: scope,
                      animation: 'slide-in-up'
                    }).then(function(modal){
                      scope.helperModal = modal;
                      scope.helperModal.show();
                      scope.moveItemInDialog = function(item, fromIndex, toIndex) {
                        //Move the item in the array

                        scope.field.model.sorted.splice(fromIndex, 1);
                        scope.field.model.sorted.splice(toIndex, 0, item);


                      };
                    });
                  };
                }
              });
            }

            //Select Just One
            if(type == 'radiobutton' || type == 'auto-complete' || type == 'select' || type == 'radiogroup' || type == 'select-autocomplete' || type == 'key-lookup' ||  type == 'user-assignment' || type == 'organization-relationship' ) {
              if(type==='organization-relationship'){

              }
              scope.optionsListOrig = _.clone(scope.field.ddEntry.options.optionsList);
              $ionicModal.fromTemplateUrl("modal-radio.html", function($ionicModal) {
                  scope.modal = $ionicModal;
                }, {
                  scope: scope,
                  animation: 'slide-in-up'
                }
              );
            }

            //Select Just One

            if(type == 'composite') {
              scope.mapUrl = 'http://maps.google.com/?q=';

              _.each(scope.field.ddEntry.options.compositeDefinition, function(sourceField) {
                var fullSourceField = _.find(scope.form.fields, function(field) {
                  return field.ddEntry.id === sourceField.ddEntryId;
                });
                if(fullSourceField && fullSourceField.model && fullSourceField.model.value) {
                  scope.mapUrl += fullSourceField.model.value + '+';
                }
              });

              scope.mapUrl += "&output=embed";

              $ionicModal.fromTemplateUrl("modal-map.html", function($ionicModal) {
                  scope.modal = $ionicModal;
                }, {
                  scope: scope,
                  animation: 'slide-in-up'
                }
              );
            }

            if(type == 'textarea') {
              $ionicModal.fromTemplateUrl("modal-textarea.html", function($ionicModal) {
                  scope.modal = $ionicModal;
                }, {
                  scope: scope,
                  animation: 'slide-in-up'
                }
              );
            }

            if(type == 'duration') {
              $ionicModal.fromTemplateUrl("modal-duration.html", function($ionicModal) {
                  scope.modal = $ionicModal;
                }, {
                  scope: scope,
                  animation: 'slide-in-up'
                }
              );
            }

            if(type == 'signature') {
              $ionicModal.fromTemplateUrl("modal-signature-pad.html", function($ionicModal) {
                  scope.modal = $ionicModal;
                }, {
                  scope: scope,
                  animation: 'slide-in-up'
                }
              );
            }
            if(type == 'img-gallery') {
              $ionicModal.fromTemplateUrl("modal-img-gallery.html", function($ionicModal) {
                  scope.modal = $ionicModal;
                }, {
                  scope: scope,
                  animation: 'slide-in-up'
                }
              );
            }
          }, 0);

        });
      }
    };

    var fieldDirectiveController = [ '$scope',
      function fieldDirectiveController($scope) {

        $scope.debugTemplates = false;

        $scope.timePickerOptions = {
          pickDate: false,
          pickTime: true,
          useSeconds: false
        };

        $scope.isEditMode = function () {
          return $scope.form.fieldMode.indexOf('edit') >= 0;
        };

        //These will work on model.value's that are array based, like checkbox
        $scope.$on('modal.hidden', function() {
          if($scope.originalModelValue instanceof  Array)
            $scope.model.value = $scope.originalModelValue.slice();
        });
        $scope.$on('modal.shown', function() {
          if($scope.model.value instanceof Array)
            $scope.originalModelValue = $scope.model.value.slice();
        });


        $scope.cancelModal = function cancelModal() {
          if($scope.originalModelValue instanceof Array)
            $scope.model.value = $scope.originalModelValue.slice();

          $scope.modal.hide();
        };
        $scope.saveModel = function saveModel() {
          if($scope.model.value instanceof Array)
            $scope.originalModelValue = $scope.model.value.slice();

          $timeout(function() {
            $scope.modal.hide();
          }, 300);

        };
        $scope.cancelHelperModal = function cancelHelperModal() {
          if($scope.originalModelValue instanceof Array)
            $scope.model.value = $scope.originalModelValue.slice();

          $scope.helperModal.hide();
        };

        $scope.saveHelperModel = function saveHelperModel() {
          $scope.helperModal.hide();
          var sortedValue = [];
          _.each($scope.field.model.sorted, function(item, index){

            sortedValue.push(item.id);
          });
          $scope.field.model.value = sortedValue;
        };

        $scope.getFieldLabel = function getFieldLabel(){
          if ($scope.field.displayFormat.hasPrefix) {
            return $scope.field.ddEntry.prefix;
          } else {
            return $scope.field.ddEntry.name
          }
        };

        $scope.getDateRange = function getDateRange() {
          var range = {};
          if ($scope.field.validations) {
            range = $scope.field.validations.date.range;
          } else
          if ($scope.field.ddEntry.formatting) {
            range = $scope.field.ddEntry.formatting.range;
          }
          return range;
        };

        $scope.hasValue = function hasValue(){
          var value = $scope.field.model.value;
          if (_.isString(value)){
            return value.length > 0;
          }
          return !_.isNil(value);
        };

        $scope.isReadOnly = function isReadOnly(){

          var isEditMode = $scope.form.fieldMode.indexOf('edit') >= 0;
          if (isEditMode) {

            //Set as read only if it's 'display' and section is closed/collapsed.
            if (!$scope.isSectionExpanded && $scope.field.validation.isDisplay){
              //console.log("IsREADONLY");
              return true;
            }

            return $scope.field.validation.readOnly || $scope.field.validation.readOnlyNow;

          } else {
            //'complete-view' or 'view'
            return true;
          }
        };

        $scope.filter = function filter(search) {
          search = search.toLowerCase();

          $scope.field.ddEntry.options.optionsList = $filter('filter')($scope.optionsListOrig, {$: search});
          // $scope.field.ddEntry.options.optionsList = _.filter($scope.optionsListOrig, function(item) {
          //   if ( (item.name !== null) && (item.name.toLowerCase().indexOf(search) >= 0) ) {
          //     return true;
          //   }
          //   else {
          //     return false;
          //   }
          // });
          // if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
          //     $scope.$apply();
          // }
        };


        var type = $scope.field.widget.template;

        type = type.toLowerCase();

        if (type === 'phone' && $scope.model.value) {
          $scope.model.value += ""; // stringify numbers
          $scope.model.value = $scope.model.value.replace(/[^0-9]/g, '');
          if($scope.model.value.length === 10)  { // this should always be true?
            $scope.model.value = $scope.model.value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
          }
        }

        if(type === 'boolean' || type === 'true-false'){

          $scope.field.ddEntry.options.optionsList[0].id = true;
          $scope.field.ddEntry.options.optionsList[1].id = false;
          $scope.bool = {value:false};
          if(_.isUndefined($scope.model)){
            $scope.model = {value:false};
          }

          if($scope.model && $scope.model.value === $scope.field.ddEntry.options.optionsList[0].id){

            $scope.bool.value = true;
          }else {
            $scope.model.value = $scope.field.ddEntry.options.optionsList[1].id;
            $scope.bool.value = false;

          }

          $scope.toggleBoolean = function(field, model){
            if($scope.bool.value){

              $scope.model.value = field.ddEntry.options.optionsList[0].id;
            }else{

              $scope.model.value = field.ddEntry.options.optionsList[1].id;
            }
            // console.log("model.value");
            // console.log(model.value);
          };

        }



      }]; //-fieldDirectiveController();


    return {
      template: '<div ng-cloak></div>',
      restrict: 'E',
      //replace:true,
      scope: {
        field: '=',
        fieldMode: '=',
        model: '=',
        form: '=',
        formContainer: '=',
        validation: '=',
        displayOnly: '=',
        formModel: '=',
        isSectionExpanded: '='
      },
      link: linker,
      controller: fieldDirectiveController
    };
  }
]);
