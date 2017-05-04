import ngRedux from 'ng-redux';
import rootReducer from './redux/reducers';
import * as boundActions from './bound-actions';
import 'babel-polyfill';

angular.module('arvak', ['ionic', 'ionic.service.core', 'ionic.service.push', 'ngCordova', 'ionic.service.deploy', 'ionic-datepicker', 'ion-datetime-picker',
  //'starter.controllers',
  'arvak.forms',
  'angular-cache',
  'arvak.common',
  'arvak.auth',
  'arvak.user',

  'arvak.env',
  'arvak.version',
  'arvak.pouchdb',
  'arvak.navigation',
  'arvak.network',
  'arvak.tasks',
  'arvak.location',
  'arvak.audio',
  'arvak.update',
  'arvak.appdef',

  'checklist-model',
  'ui.slider',
  'angularFileUpload',
  'templates',
  'angular-locker',
  'btford.socket-io',
  'ngMockE2E',
  'ngMessages',
  'angular-cache',
  'clientsideCommons',
  ngRedux
])
  .config(LoggerConfiguration.config)
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $ionicConfigProvider, $compileProvider, CacheFactoryProvider, $ngReduxProvider, $provide, EnvironmentConfig) {
    //Initialize REDUX store
    $ngReduxProvider.createStoreWith(rootReducer);

    //set some navigation configs for ionic.
    $ionicConfigProvider.backButton.previousTitleText(false);
    $ionicConfigProvider.backButton.icon('ion-chevron-left');
    $ionicConfigProvider.backButton.text('');
    $ionicConfigProvider.scrolling.jsScrolling(true);

    //Authentication  HTTP interceptor.  Adds auth token to each Request.  Adds 401, 500 error handling to each response.
    $httpProvider.interceptors.push('authRequestInterceptor');

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
    //$urlRouterProvider.otherwise('/forms');

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|map|geo|tel|skype):/);
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content):|data:image\//);
  })

  .run(function ($ngRedux, $animate, $ionicPlatform, $rootScope, UpdateFactory, MobileConfig, EnvironmentConfig, $templateCache, $httpBackend, paths, OnEventListener) {

    $rootScope.$on('storeAppState', OnEventListener.storeAppState);

    $rootScope.$on('performTogglePreview', OnEventListener.performTogglePreview);

    $rootScope.$on('deleteItem', OnEventListener.deleteItem);

    $rootScope.$on('navigateToView', OnEventListener.navigateToView);

    $rootScope.$on('$stateChangeError', OnEventListener.stateChangeError);

    $rootScope.$on('$stateChangeStart', OnEventListener.stateChangeStart);

    $rootScope.$on('editView', function (event, view) {
      $rootScope.$broadcast('openEditView', view);
    });

    $rootScope.$on('addView', function (event, view) {
      $rootScope.$broadcast('openAddView', view);
    });

    $rootScope.$on('register', function (event) {
      console.log('register event triggered on arvak');
      MobileConfig.registered = true;
    });

    // set theme light or dark
    $rootScope.appTheme = 'light';

    $animate.enabled(false);

    var isMockBackendEnabled = EnvironmentConfig.mockBackend;
    setMockResponses($httpBackend, isMockBackendEnabled);

    $ionicPlatform.ready(function () {

      //Remove template cache to have instant changes (only for local development)
      if (EnvironmentConfig.isLivereload) {
        $templateCache.removeAll();
      }

      // set environment for updates
      UpdateFactory.setEnvironment(EnvironmentConfig.env);
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)

      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      //iOS 8 bug
      //http://forum.ionicframework.com/t/click-a-input-field-whole-app-jumps-down-and-back-to-the-original-place/10876/15
      if (window.cordova && window.cordova.plugins.Keyboard) {
        window.cordova.plugins.Keyboard.disableScroll(true);
      }
      ionic.Platform.isFullScreen = true;
    });

  })


  .factory('authRequestInterceptor', ['$q', '$window', '$log', '$injector', 'MobileConfig', 'TokenService', 'EnvironmentConfig', 'ErrorService', function ($q, $window, $log, $injector, MobileConfig, TokenService, EnvironmentConfig, ErrorService) {
    function showAlert(message) {
      //Disable error alerts in builder mode
      if (MobileConfig.isDevice()) {
        var ionicPopup = $injector.get('$ionicPopup');
        var alertPopup = ionicPopup.alert({
          title: 'Error Alert',
          template: message,
          cssClass: 'error-message'
        });
        return alertPopup.then(function(){});
      }
      return $q.when();
    }

    return {

      // HTTP Request. Set token.
      'request': function (config) {

        var token = TokenService.getToken();

        config.headers = config.headers || {};
        if (!_.isNull(token)) {
          //console.log("X-auth");
          //console.log(token)
          config.headers[TokenService.tokenHeader] = token;
        }

        return config;
      },

      // optional method
      'responseError': ErrorService.handleServerError({
        isMockBackend: EnvironmentConfig.mockBackend,
        getAuthTokenFn: TokenService.getToken,
        showErrorFn: showAlert,
        isArvak: true
      })
    };
  }])
  .value('ArvakConfig', {
    token: function () {
      return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent('clienttoken').replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    taskStatus: {
      suspend: 1,
      cancel: 2,
      open: 3,
      //processing: 3,
      complete: 4,
      error: -1
    },
    publishStatus: {
      open: 1,
      processing: 3,
      complete: 4,
      published: 4,
      unpublished: 5,
      archived: 6,
      draft: 7,
      error: -1
    },
    formTypes: {
      general: 1,
      task: 2,
      workorder: 3
    },
    dataSourceActions: {
      login: 1,
      entityTypes: 2
    },
    getStatusLabelById: function (id) {
      var label = null;
      var idToCompare = parseInt(id);
      switch (idToCompare) {
        case 1:
          label = "Suspended";
          break;
        case 2:
          label = "Cancel";
          break;
        case 3:
          label = "Processing";
          break;
        case 4:
          label = "Completed";
          break;
        case 5:
          label = "Unpublished";
          break;
        case 6:
          label = "Archived";
          break;
        case 7:
          label = "Draft";
          break;
        case -1:
          label = "Error";
          break;
        default:
          label = null;
      }
      return label;
    },
    widgetCatTypes: {
      relationship: 7
    },
    ddTypes: {
      bool: 6,
      relationship: 15,
      first_name: 18,
      last_name: 19,
      completed_on: 21,
      order_id: 22,
      primary_email: 14,
      completed_by: 23,
      client_submit: 49,
      site_status: 30,
      profile_image: 33,
      workflow_status: 34,
      key: 35,
      geolocation: 10,
      user_assignment: 37
    },
    modal: {
      appStartDefault: {
        DisplayMenu: 'Display Menu',
        DisplayDashboard: 'Display Dashboard'
      }
    }

  });


angular.module('arvak').factory('TaskActions', boundActions.TaskActions);

function setMockResponses($httpBackend, isMockBackendEnabled) {
  var PATH_MOCK_RESPONSES = '/assets/mock_responses/e2e/';

  function getMockResponseData(jsonFilePath) {
    var request = new XMLHttpRequest();
    /*
     var url = '';
     if (ionic.Platform.isAndroid()) {
     url = '/android_asset/www/';
     }
     */
    request.open('GET', PATH_MOCK_RESPONSES + jsonFilePath, false);
    request.send(null);
    return request.response;
  }

  //Set Mock Responses for Backend-less development
  if (isMockBackendEnabled) {

    /*
     $httpBackend.whenPOST(paths.host() + paths.auth.login())
     .respond(JSON.stringify({ token: 'token123', expiresOn: new Date() }));
     */

    $httpBackend.whenGET(paths.host() + paths.app.definitions())
      .respond(getMockResponseData('api.mobile.def.apps.json'));

    $httpBackend.whenGET(paths.host() + paths.user.current())
      .respond(getMockResponseData('api.user.json'));

    $httpBackend.whenGET(paths.host() + paths.datasources.getAllDSTypes())
      .respond(getMockResponseData('api.datasources.types.json'));

    $httpBackend.whenGET(paths.host() + paths.media.bucket())
      .respond('{"status":"ok","response":"com.primotus.mediatest"}');

    $httpBackend.whenGET(paths.host() + paths.workflow.getCurrentTasks(null))
      .respond(getMockResponseData('api.workflows.workorderdefinition.userTasks.json'));

    $httpBackend.whenGET(paths.host() + paths.workorders.getProcessForms())
      .respond(getMockResponseData('api.workflows.workorderdefinition.v2.processForms.json'));

    $httpBackend.whenGET(/.*\/api\/workflows\/workorderdefinition\/userTasks?.*/g)
      .respond(getMockResponseData('api.workflows.workorderdefinition.userTasks.json'));

    $httpBackend.whenGET(/.*\/api\/workflows\/workorderdefinition\/userTasks\?tasksAfter=.*/g)
      .respond(getMockResponseData('api.workflows.workorderdefinition.userTasks.json'));

    $httpBackend.whenGET(/.*\/api\/workflows\/workorderdefinition\/v2\/processForms?.*/g)
      .respond(getMockResponseData('api.workflows.workorderdefinition.v2.processForms.json'));

    $httpBackend.whenGET(/.*\/api\/workflows\/workorderdefinition\/v2\/processForms\?procDefIds=.*/g)
      .respond(getMockResponseData('api.workflows.workorderdefinition.v2.processForms.json'));

    $httpBackend.whenGET(paths.host() + '/api/datasources/v2/instances/5')
    //$httpBackend.whenGET(/.*\/api\/datasources\/v2\/instances\/5/g)
      .respond(getMockResponseData('api.datasources.v2.instances.5.json'));

    $httpBackend.whenGET(paths.host() + '/api/forms/v2/definitions/635')
    //$httpBackend.whenGET(/.*\/api\/forms\/v2\/definitions\/635/g)
      .respond(getMockResponseData('api.forms.v2.definitions.635.json'));

    /*
     $httpBackend.whenPOST(paths.host() + '/api/workflows/workorderdefinition/completeTask')
     .respond(JSON.stringify({status: 'ok', response: {}}));

     $httpBackend.whenPOST(paths.host() + '/api/workflows/workorderdefinition/postFormWithTaskData')
     .respond(JSON.stringify({status: 'ok', response: {}}));
     */
  }

  $httpBackend.whenGET(/[\s\S]*/).passThrough();
  $httpBackend.whenPOST(/[\s\S]*/).passThrough();
  $httpBackend.whenPUT(/[\s\S]*/).passThrough();
  $httpBackend.whenDELETE(/[\s\S]*/).passThrough();

}
