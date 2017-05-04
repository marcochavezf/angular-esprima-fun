var formsModule = angular.module('odin.forms');

// -----
//  FormController
// -----

// odFormController()

var odFormController = ['environment', '$http', '$log', '$scope', '$state', '$attrs', '$element', '$timeout', 'FormService', 'FormConfig', 'Dialog', '$q',  '$sce', 'paths', 'OdinConfig', 'PermissionService',
  function odFormController(environment, $http, $log, $scope, $state, $attrs, $element, $timeout, FormService, FormConfig, dialog, $q,  $sce, paths, OdinConfig, PermissionService) {
    'use strict';

    $scope.selectedForm = {};
    $scope.mobileAppUrl   = $sce.trustAsResourceUrl(environment.mobile.appUrl);
    $scope.mobileAppUrl2  = $sce.trustAsResourceUrl(environment.mobile.appUrl2);
    $scope.compositeInputTypeId = FormConfig.compositeInputTypeId;
    $scope.mobileInput = FormConfig.mobileInput;
    $scope.selectedForm = null;
    $scope.selectedModel = null;
    $scope.repeatableSections = {};

    init();

    ////////////

    $scope.getClassByNumber = function(number){
      var numClass = '';
      switch(number) {
        case 1:
          return 'one';
        case 2:
          return 'two';
        case 3:
          return 'three';
        case 4:
          return 'four';

        default:
          return '';
      }
      return numClass;
    };

    function init(){
      /* Create: displays Entry Form.
       * Edit: displays form in View mode with pencil (or 'Edit' button) to edit.
       * View: displays form in View mode with no pencil. */

      /* $scope.canEdit is set on formsController.$onInit() */
      //console.log("FormDirective - Field Mode");
      //console.log($scope.modeler);
      if($scope.form){
        if(!$scope.form.fieldMode) {
          $scope.fieldMode = $scope.form.fieldMode = 'edit';
        } else {
          $scope.fieldMode = $scope.form.fieldMode;
        }

        /* Edit and View apply to forms with existing instances (Edit we display form in 'view' mode with 'Edit' button).
         * If the form has no instances and has 'create' permission then it will be displayed in 'edit' mode. */
        var hasAnInstance = _.find($scope.model.instances, function(instance){
          return instance.id > 0;
        });
        var user = $scope.user || $scope.$root.user;
        var pemission = PermissionService.getPermissionFrom($scope.form, user);

        if (!hasAnInstance && pemission.create){
          $scope.fieldMode = 'edit';
          $scope.form.fieldMode = 'edit';
        }
        setupForm($scope.form);
      }
    }

    // getTemplate()
    $scope.getTemplate = function getTemplate() {
      return '/templates/forms/forms/includes/multiRender.htm';
    }; //- getTemplate()


    // -----
    //  Functions
    // -----

    $scope.getSectionColumnClass = function getSectionColumnClass(column) {
      return 'col-sm-' + column.width;
    };

    // getFormModel()
    $scope.getFormModel = function getFormModel() {
      if($scope.model) {
        var instance = _.find($scope.model.instances,function(dsInstance) {
          return dsInstance.instanceId > -1;
        });

        if(_.isUndefined(instance)) {
          $scope.selectedInstanceId = null;
        } else {
          $scope.selectedInstanceId = instance.id;
        }
      }

      return $scope.form;

    }; //- getFormModel()

    // -----
    //  Event Handlers
    // -----

    $scope.formProperty = 'form';

    $scope.$on('fieldMode:edit', function(){
      $scope.fieldMode = 'edit';
    });

    $scope.$on('fieldMode:view', function(){
      $scope.fieldMode = 'view';
    });

    $scope.getFieldModel = function getFieldModel(fieldId, model) {
      return _.find(model.fields, { sourceFieldId: fieldId });
    };

    // -----
    //  Watches
    // -----

    // setupForm()
    function setupForm(form) {
      if ( !form || !form.layoutJson ) {
        return;
      }

      if(_.isUndefined($scope.model))
        $scope.model = FormService.createFormData(form);

      // getItemValue()
      var getItemValue = function getItemValue(item) {
        if ( item.model ) {
          return (item.model.selected || item.model.value) || '';
        }

        return null;
      }; //- getItemValue()



      if ( _.isArray(form.layoutJson) && form.layoutJson.length > 0 ) {
        form.layoutJson[0].$$active = true;
        _.each(form.layoutJson, function(tab) {
          _.each(tab.sections, function(section) {
            if(section.repeatable) {
              setupRepeatable($scope.form, section);
            }
          });
        });

      }

    } //- setupForm()

    function setupRepeatable(form, section) {
      section = FormService.setupRepeatable(form, section);
      $scope.repeatableSections[section.id] = [];
      $scope.repeatableSections[section.id][section.cId] = section;
    }

    $scope.duplicateRepeatable = function duplicateRepeatable(tab, section) {
      var newSection = FormService.duplicateRepeatable($scope.form, tab, section);
      $scope.repeatableSections[section.id][newSection.cId] = newSection;
    };

    $scope.removeSection = function removeSection(tab, removingSection) {
      FormService.removeRepeatable($scope.form, tab, removingSection);
      delete $scope.repeatableSections[removingSection.id][removingSection.cId];
    };

    $scope.isEditMode = function isEditMode(){
      return $scope.fieldMode.indexOf('edit') >= 0;
    };

    $scope.showRepeaterAddButton = function showRepeaterAddButton(section){
      if ($scope.isEditMode()) {
        var showRepeater = section.repeatable && section.cId >= $scope.repeatableSections[section.id].length - 1;
        return showRepeater;
      } else {
        return false;
      }
    };

    //On new form loaded,  we look through the widgets and detect if the widget dictId and value have been stored in the model.  If not, we add.
    $scope.$watch('form', function(form) {

      console.log("form update happening");
      if($scope.modeler && $scope.form){
        $scope.fieldMode = 'edit';
        $scope.form.fieldMode = 'edit';
      }

    });

    $scope.renderFormDialog = function renderFormDialog(formInfo) {
      var renderFormDialogObj = dialog({
        templateUrl: '/templates/forms/dialogs/renderFormDialog.htm',
        controller: 'renderFormDialogController',
        data: {
          ui:{
            saveButtonLabel:"Submit Form"
          },
          properties:{
            formDefId: formInfo.formDefId,
            instanceId: formInfo.instanceId
          }
        }
      });

      renderFormDialogObj.onClose = function(result) {
        if ( result !== false ) {
          console.log("renderFormSubmit ");
          console.log(result);
        }
      };
    };
  }]; //- odFormController()

// -----
//  Form Direictve
// -----

// odForm()
formsModule.directive('odForm', function odForm() {
  'use strict';
  return {
    restrict: 'A',
    require: '^form',
    scope: {
      formId: '=',
      model: '=',
      form:'=',
      modeler: '='
    },
    controller: odFormController,
    link: function(scope, element, attrs, ngForm) {
      scope.formContainer = ngForm;
    },
    templateUrl: '/templates/forms/forms/formDirective.htm'
  };
}); //- odForm()
