/**
 * Created by marcochavezf on 1/17/17.
 */
/**
 * This module serves as an abstract layer to dispatch redux actions after getting data from
 * impure/asynchronous functions (functions that could output different results in every call: userTasks from server, current userId, viewId, etc.)
 * https://en.wikipedia.org/wiki/Pure_function
 * PD: This module could be replaced/renamed/merged with TaskService.
 */
import * as reduxActions from '../redux/actions';
import * as taskHelper from './taskHelperService';

export function TaskActions($http, $interval, $rootScope, paths, UserService, $q, $ngRedux, PouchService, NavigationService, ArvakConfig, TaskService, FormService, ConnectionService, $timeout, ErrorService) {

  var  service = {
    buildMenu: buildMenu,
    buildNextView:buildNextView,
    cancelAutoPolling: cancelAutoPolling,
    createAddTaskAction: createAddTaskAction,
    dataLoading: dataLoading,
    flushTasks: flushTasks,
    loadStoredReduxState: loadStoredReduxState,
    loadAndPrepareAllTasks: loadAndPrepareAllTasks,
    getLatestAfterSubmit: getLatestAfterSubmit,
    getCurrentState:getCurrentState,
    getFilteredTasks: getFilteredTasks,
    getUserTasks: getUserTasks,
    pauseAutoPolling: pauseAutoPolling,
    populateMissingFieldValues: populateMissingFieldValues,
    processUnsentTasks: processUnsentTasks,
    removeTask: removeTask,
    removeViews: removeViews,
    setAutoPolling: setAutoPolling,
    subscribeUserTasks: subscribeUserTasks,
    stop: stop,
    transformAllTasks: transformAllTasks,
    unsubscribeUserTasks: unsubscribeUserTasks,
    updateTasks: updateTasks
  };

  var previousStateStored;
  var unsubscribeUserTasksFunctions = [];
  var _dataLoading = false;
  var pollingTasksInterval = null;
  var isAutoPollingRunning = false;
  var isProcessUnsentTasksRunning = false;
  var isGetLatestAfterSubmitRunning = false;

  init();

  return service;

  //////////////////

  function pauseAutoPolling(pause){
    isAutoPollingRunning = pause;
  }

  function stop(){
    unsubscribeUserTasks();
    cancelAutoPolling();
    shutdownTaskService();
  }

  function init() {

    function persist(state) {
      if (_.isEqual(previousStateStored, state)) {
        return;
      }
      var userId = $rootScope.user.id.fieldValue;
      var appDefId = NavigationService.getAppState().id;
      var stateKey = userId + ':' + appDefId;
      console.log("writing to pouch");
      console.log(stateKey);
      PouchService.putDoc({
        _id: stateKey,
        state
      }, PouchService.reduxState)
        .then(function (response) {
          // console.log('Successful Persist');
          // console.log(state);
          previousStateStored = state;
        })
        .catch(function (err) {
          console.log('Pouch persist error');
          console.log(err);
          return $q.reject(err);
        });
    }

    var debouncePersist = _.debounce(persist, 2500, {'trailing': true});
    $ngRedux.subscribe(() => {
      var state = getCurrentState();
      debouncePersist(state);
    });
  }

  function loadStoredReduxState(){
    //Retrieve last redux state from pouchDB
    var userId = $rootScope.user.id.fieldValue;
    var appDefId = NavigationService.getAppState().id;
    var stateKey = userId + ':' + appDefId;
    return PouchService.getDoc(stateKey, PouchService.reduxState)
      .then(function (doc) {
        var state = doc.state;
        if (_.isUndefined(state)){
          return;
        }

        //Load Tasks and views only if there were tasks stored by userId
        if (state.tasks) {
          $ngRedux.dispatch(reduxActions.loadTasks(state.tasks, userId, appDefId));
        }
      })
      .catch(function (err) {
        throw err;
        // console.log(err);
      });
  }

  function unsubscribeUserTasks(){
    unsubscribeUserTasksFunctions.forEach(function(unsubscribe){
      unsubscribe();
    });
    unsubscribeUserTasksFunctions = [];
  }

  function subscribeUserTasks(listener){
    var unsubscribe = $ngRedux.subscribe(_.debounce(function(){
      getUserTasks().then(listener);
    }, 400));
    unsubscribeUserTasksFunctions.push(unsubscribe);
  }

  function getUserTasks(){
    var state = getCurrentState();
    return $q.when(state.tasks);
  }

  function getFilteredTasks(viewId){
    var state = getCurrentState();
    var view = state.views[viewId];
    var userTasks = state.tasks;
    var filteredTasks = taskHelper.getTasks(view.list, userTasks.instances);
    return $q.when(filteredTasks);
  }

  function getCurrentState(){
    var reduxState = $ngRedux.getState();
    var userId = $rootScope.user.id.fieldValue;
    var appDefId = NavigationService.getAppState().id;
    var stateKey = userId + ':' + appDefId;
    return _.mapValues(reduxState, function(reducer){
      return reducer[stateKey] || {};
    });
  }

  function buildNextView(view, parentFilters, tasks){
    //console.log('BOUND ACTION: BUILD View');
    var userId = $rootScope.user.id.fieldValue;
    var appDefId = NavigationService.getAppState().id;
    var filters = [...parentFilters];
    switch (view.viewType) {

      case 'task':

        var itemFilter = {statusId:ArvakConfig.taskStatus.open, formId: view.taskFilter, id:view.id};
        filters.push(taskHelper.createFilter(itemFilter));
        var taskViewAction = {id:expandedFolderItem.id, filters:filters, tasks:tasks, userId:userId, appDefId:appDefId};
        $ngRedux.dispatch(reduxActions.buildView(taskViewAction));

        break;
      case 'filtered':

        var itemFilter = {statusId:ArvakConfig.taskStatus.open, fields:[], id:view.id};
        itemFilter.fields.push({id:view.taskFilter });
        filters.push(taskHelper.createFilter(itemFilter));
        var taskViewAction = {id:view.id, filters:filters, tasks:tasks, userId:userId, appDefId:appDefId};
        $ngRedux.dispatch(reduxActions.buildView(taskViewAction));

        break;
      case 'form':

        var taskViewAction = {id:view.id, filters:filters, tasks:tasks, userId:userId, appDefId:appDefId};
        $ngRedux.dispatch(reduxActions.buildView(taskViewAction));

        break;
      case 'table':

        var taskViewAction = {id:view.id, filters:filters, tasks:tasks, userId:userId, appDefId:appDefId};
        $ngRedux.dispatch(reduxActions.buildView(taskViewAction));

        break;

      case 'error':
        var taskViewAction = {id:view.id, filters:filters, tasks:tasks, userId:userId, appDefId:appDefId};
        $ngRedux.dispatch(reduxActions.buildView(taskViewAction));
        break;

      case 'unsent':
        var taskViewAction = {id:view.id, filters:filters, tasks:tasks, userId:userId, appDefId:appDefId};
        $ngRedux.dispatch(reduxActions.buildView(taskViewAction));
        break;
    }
  }

  function processUnsentTasks() {
    if (!ConnectionService.isOnline() || isProcessUnsentTasksRunning) {
      return $q.when(false);
    }
    //console.log('Starte processUnsent');
    _dataLoading = true;
    isProcessUnsentTasksRunning = true;

    //Get taskForms
    var processIds = NavigationService.getAppState().properties.processIds;
    return TaskService.getProcessForms(processIds).then(function (response) {

      //Get user tasks
      var taskForms = response.formdefwithtasks;
      return getUserTasks().then(function (userTasks) {

        //Get completed tasks
        var state = getCurrentState();
        var unsentView = state.views.unsent;
        //No unsent view attached yet
        if (_.isUndefined(unsentView)){
          return;
        }
        var completeTasks = taskHelper.getTasks(unsentView.list, userTasks.instances);

        //Append task form if it doesn't exist
        var unsentPromises = [];
        _.each(completeTasks, function (completeTask) {
          var taskToSubmit = Object.assign({}, completeTask);
          if (_.isUndefined(taskToSubmit.form)) {
            taskToSubmit.form = taskHelper.getTaskFormById(taskToSubmit.taskdata.formKey, taskForms)
          }
          unsentPromises.push(FormService.taskSubmitJob(taskToSubmit));
        });

        //Submit tasks
        return $q.all(unsentPromises).then(function (response) {
          //console.log("This is happening");
          _.each(response, function (response) {

            var instance = response.instance;
            if (response.status === 200){
              //onSuccess, remove task
              removeTask(instance)
                .catch(function(error){

                  throw error;
                });

            } else {
              //onError:  change status to error and update task
              handleErroredTask({ task: instance, error: response });
            }
          });

          _dataLoading = false;
          return response;
        })
          .catch(function(errorResponse){
            handleErroredTask(errorResponse);
          });
      });
    }).catch(function(error){
      _dataLoading = false;
      throw error;
    }).finally(function(){
      isProcessUnsentTasksRunning = false;
    })
  }

  function handleErroredTask(errorResponse){
    var instance = errorResponse.task;
    var deferred = $q.defer();

    try {
      /* We need to populate the 'error' property for error message in Error Queue (errorTaskTableController.js:198) */
      instance.error = _.pick(errorResponse.error, ['data', 'status', 'statusText']);
      /* If we get a time out error (504 or -1) we want to send this task to Unsent Queue to try again.
       * We don't consider 502 because it could be breaking something in backend and we want to avoid replicating 502 requests. */
      switch (errorResponse.error.status) {
        case 504:
        case -1:
          instance.taskdata.statusId = ArvakConfig.taskStatus.complete;
          break;

        default:
          instance.taskdata.statusId = ArvakConfig.taskStatus.error;
      }
      return updateTasks([instance])
        .catch(function(error){
          //console.log(error);
          deferred.reject(error);
        });
      deferred.resolve(instance);
    } catch (e) {
      deferred.reject(e);
    }
    return deferred.promise;
  }

  function buildMenu(tasks = {}) {
    //console.log('BOUND ACTION: BUILD MENU');

    var menu = Object.assign({}, NavigationService.getViewById('menu'));

    menu.items = _.map(menu.items, function (item) {
      return Object.assign({}, NavigationService.getViewById(item));
    });

    var userId = $rootScope.user.id.fieldValue;
    var appDefId = NavigationService.getAppState().id;
    var state = getCurrentState();

    //Add unsent view
    if (_.isUndefined(state.views.unsent)){
      buildNextView({ id: 'unsent', viewType: 'unsent' }, [{statusId: ArvakConfig.taskStatus.complete}], tasks);
    }
    //Add error view
    if (_.isUndefined(state.views.error)){
      buildNextView({ id: 'error', viewType: 'error' }, [{statusId: ArvakConfig.taskStatus.error}], tasks);
    }

    var taskViews = [];
    _.each(menu.items, function (expandedItem) {

      switch (expandedItem.viewType) {
        case 'folder':
          expandedItem.items = _.map(expandedItem.items, function (item) {
            return Object.assign({}, NavigationService.getViewById(item));

          });
          _.each(expandedItem.items, function (expandedFolderItem) {
            switch (expandedFolderItem.viewType) {

              case 'task':
                var filters = [];
                var itemFilter = {statusId:ArvakConfig.taskStatus.open, id:expandedFolderItem.id};
                itemFilter.formId = expandedFolderItem.taskFilter;
                filters.push(taskHelper.createFilter(itemFilter));
                var taskViewAction = {id:expandedFolderItem.id, filters:filters, tasks:tasks, userId:userId, appDefId:appDefId};
                $ngRedux.dispatch(reduxActions.buildView(taskViewAction));

                break;


            }
          });
          break;

        case 'task':
          var filters = [];
          var itemFilter = {statusId:ArvakConfig.taskStatus.open, id:expandedItem.id};
          itemFilter.formId = expandedItem.taskFilter;
          filters.push(taskHelper.createFilter(itemFilter));
          var taskView = {id:expandedItem.id, filters:filters, tasks:tasks};
          break;
      }
    });
  }

  function createAddTaskAction(task) {
    //console.log('ACTION: ADD_TASK');
    $ngRedux.dispatch(reduxActions.addTask(Object.assign({}, task)));
  }

  function getTasksFromServer(lastSyncTime) {
    var endpoint = paths.host() + paths.workflow.getCurrentTasks(lastSyncTime);
    return $http.get(endpoint).then(function (response) {

      //Saving last time (milliseconds) we get tasks from server.
      var milliseconds = (new Date).getTime();
      return UserService.getUserSettings().then(function (userSettings) {
        userSettings.general.lastSyncTime = milliseconds;
        userSettings.general.openTaskIds = response.data.response.openTaskIds;

        return UserService.setUserSettings(userSettings).then(function(){
          var tasks = response.data.response.tasks;
          return tasks;
        });
      });
    })
      .catch(function(error){
        //return [];
        throw error;
      });
  }

  function addSystemFields(instance){
    //Add Task Status
    var status = TaskService.getInstanceStatus(instance);
    var fieldValue = ArvakConfig.getStatusLabelById(status);
    var taskStatusField = {sourceFieldId:'task', dsTypeId:'status', fieldName: 'Task Status', fieldNameAlias:'Task Status', fieldValue: fieldValue };
    instance.dsim.instances.push({
      type: 'system',
      dsTypeId: taskStatusField.dsTypeId,
      fields: [taskStatusField]
    });

    //Add Task Name
    if(instance && instance.taskdata){
      var fieldValue = instance.taskdata.name;
      var taskNameField = {sourceFieldId:'task', dsTypeId:'name', fieldName: 'Task Name', fieldNameAlias:'Task Name', fieldValue: fieldValue };
      instance.dsim.instances.push({
        dsTypeId: taskNameField.dsTypeId,
        type: 'system',
        fields: [taskNameField]
      });
    }

    //Add Work Order Status
    var statusSourceFields = instance.statusSourceFields;
    if (statusSourceFields) {
      var instField = _.find(instance.instFields, function(field){
        return _.find(statusSourceFields, function(statusSrcFld){
          return statusSrcFld.sourceField.dsTypeId === instance.dsTypeId
            && statusSrcFld.sourceField.sourceFieldId === field.sourceFieldId;
        });
      });
      if (instField) {
        fieldValue = ArvakConfig.getStatusLabelById(instField.fieldValue);
        var workOrderStatusField = {sourceFieldId:'workorder', dsTypeId:'status', fieldName: 'Work Order Status', fieldNameAlias:'Work Order Status', fieldValue: fieldValue};
        instance.dsim.instances.push({
          type: 'system',
          dsTypeId: workOrderStatusField.dsTypeId,
          fields: [workOrderStatusField]
        });
      }
    }
    return instance;
  }

  function transformAllTasks(tasks) {
    var transformedTasks = [];
    _.each(tasks, function (task) {
      if (_.isEmpty(task)){
        return;
      }
      //Add system fields
      var taskWithSystemFields = addSystemFields(task);
      //Add dsim.fields and dsim.fieldDict
      var transformedTask = transformTask(taskWithSystemFields);
      transformedTasks.push(transformedTask);
    });
    //console.log("transformAllTasks");
    return $q.when(transformedTasks)
      .catch(function(err){ throw err;});
  }

  function transformTask(task) {
    var clonedTask = _.cloneDeep(task);
    clonedTask.dsim.fields = [];
    clonedTask.dsim.fieldDict = {};

    _.each(clonedTask.dsim.instances, function (instance) {

      _.each(instance.fields, function (field) {
        field.dsTypeId = instance.dsTypeId;
        clonedTask.dsim.fields.push(field);
        clonedTask.dsim.fieldDict[field.sourceFieldId + ':' + field.dsTypeId] = field;
      });
      clonedTask.dsim.instances = _.reject(clonedTask.dsim.instances, function (instance) {
        return (instance.type && instance.type==="system");

      });

    });

    return clonedTask;
  }

  function formatUserTasksReduxModel(tasks) {
    var userTasks = {
      list: [],
      instances: {}
    };
    _.each(tasks, function (task) {
      var taskId = task.taskdata.id;
      userTasks.instances[taskId] = task;
      userTasks.list.push(taskId);
    });
    return $q.when(userTasks);
  }

  function formatFieldValue(taskField, processField, task){
    //Bool format
    if(_.isBoolean(taskField.fieldValue)){
      if(taskField.fieldValue){

        taskField.fieldLabel = 'True';
      }else{
        taskField.fieldLabel = 'False';
      }
    } else

    //referred field data.  Used for displaying key lookups
    if(!_.isEmpty(taskField.referredInstKeyData) && taskField.referredInstKeyData[0].fieldValue){
      //taskField.fieldValue = taskField.referredInstKeyData[0].fieldValue;
      taskField.fieldLabel = taskField.referredInstKeyData[0].fieldValue;
    } else

    //optionLabel
    if(taskField.optionLabel){    //
      taskField.fieldLabel = taskField.optionLabel;
      //taskField.fieldValue = taskField.optionLabel;
    }

    if (_.isNil(processField)) {
      return;
    }

    //populate composite fields
    if (processField.compositeDefinition) {
      var fieldValue = '';

      //get composite values from task.dsim
      _.each(processField.compositeDefinition, function (compSourceField) {

        var srcFldIdAndDsTypeId = compSourceField.sourceFieldId + ':' + processField.sourceField.dsTypeId;
        var field = task.dsim.fieldDict[srcFldIdAndDsTypeId];
        if (field) {
          fieldValue += (field.optionLabel || field.fieldValue) + ' ';
        }
      });

      taskField.fieldValue = _.trim(fieldValue);
      taskField.compositeDefinition = processField.compositeDefinition;
    } else

    //Format date field
    if(processField && (processField.ddTypeId === ArvakConfig.ddTypes.completed_on || processField.widgetTemplate === 'datetime') ){

      var date = moment(parseInt(taskField.fieldValue));
      if (date.isValid()) {
        //taskField.fieldValue = date.format('MM/DD/YYYY HH:mm');
        taskField.fieldLabel = date.format('MM/DD/YYYY HH:mm');
      } else {
        taskField.fieldLabel = '-';
        //taskField.fieldValue = '-';
      }
    } else

    //Append user name (Completed By field)
    if(processField.ddTypeId === ArvakConfig.ddTypes.completed_by){

      if(taskField.userInfo && _.isArray(taskField.userInfo)){
        UserService.getUser().then(function(userData){
          var firstNameSourceFieldId = userData['firstName'].sourceFieldId;
          var lastNameSourceFieldId = userData['lastName'].sourceFieldId;
          var firstName = _.find(taskField.userInfo, function(userField){
            return userField.sourceFieldId === firstNameSourceFieldId;
          });
          var lastName = _.find(taskField.userInfo, function(userField){
            return userField.sourceFieldId === lastNameSourceFieldId;
          }) ;
          taskField.fieldLabel = firstName.fieldValue + ' ' + lastName.fieldValue;
          //taskField.fieldValue = firstName.fieldValue + ' ' + lastName.fieldValue;
        });

      }
    }
  }

  function populateMissingFieldValues(tasks) {
    var processIds = NavigationService.getAppState().properties.processIds;
    return TaskService.getProcessFields(processIds).then(function (processFields) {
      return TaskService.getProcessForms(processIds).then(function (response) {

        _.each(tasks, function (task) {

          //Append missing fields from task forms to task fields
          var formDef = _.find(response.formdefwithtasks, function(formDef){
            return formDef.formDefModel.id === parseInt(task.taskdata.formKey);
          });

          if (formDef) {
            formDef.formDefModel.fields.forEach(function(taskFormField){
              var sourceField = taskFormField.sourceField;
              var srcFieldIdDsTypeId = sourceField.sourceFieldId + ':' + sourceField.dsTypeId;
              if (_.isUndefined(task.dsim.fieldDict[srcFieldIdDsTypeId])){
                var newTaskField = {
                  dsTypeId: sourceField.dsTypeId,
                  fieldName: taskFormField.name,
                  fieldNameAlias: '',
                  fieldValue: '',
                  sourceFieldId: sourceField.sourceFieldId
                };
                task.dsim.fields.push(newTaskField);
                task.dsim.fieldDict[srcFieldIdDsTypeId] = newTaskField;
              }
            });
          }

          _.each(task.dsim.fields, function (taskField) {

            //get process field with same sourceFieldId and dsTypeId from taskField.
            var processField = _.find(processFields, {
              sourceField: {sourceFieldId: taskField.sourceFieldId, dsTypeId: taskField.dsTypeId}
            });

            formatFieldValue(taskField, processField, task);
          });
        });

        return tasks;
      })
    })
      .catch(function(error){
        throw error;
      });
  }


  function getLastSyncTime() {
    return UserService.getUserSettings().then(function (userSettings) {
      //console.log('Last sync time');
      var date = moment(userSettings.general.lastSyncTime);


      //console.log(date.format('MMMM Do YYYY, h:mm:ss a'));
      return userSettings.general.lastSyncTime;
    })
      .catch(function(error){
        throw error;
      });
  }

  /**
   *
   * @param task
   * @returns {*}
   */
  function removeTask(task){

    var userId = $rootScope.user.id.fieldValue;
    var appDefId = NavigationService.getAppState().id;
    $ngRedux.dispatch(reduxActions.removeTask(task, userId, appDefId));
    return $q.when();

  }

  function removeViews(){
    var userId = $rootScope.user.id.fieldValue;
    var appDefId = NavigationService.getAppState().id;
    $ngRedux.dispatch(reduxActions.removeViews(userId, appDefId));
  }

  /**
   *
   * @param tasks
   */
  function updateTasks(tasks){
    var cleanTasks = _.map(tasks, (task)=> _.pick(task, ['dsim', 'taskdata', 'form', 'error']));
    return transformAllTasks(cleanTasks)
      .then(populateMissingFieldValues)
      .then(formatUserTasksReduxModel)
      .then(function (userTasks) {
        var userId = $rootScope.user.id.fieldValue;
        var appDefId = NavigationService.getAppState().id;
        $ngRedux.dispatch(reduxActions.upsertTasks(userTasks, userId, appDefId));
      }).catch(function(error){
        _dataLoading = false;
        throw error;
      });
  }

  function dataLoading() {
    return _dataLoading;
  }

  /**
   * 1. pulling in tasks from server
   * 2. transforming
   * 3. emitting properly formed LOAD_TASKS (Replace existing tasks).
   */
  function loadAndPrepareAllTasks() {
    _dataLoading = true;
    return getTasksFromServer()
      .then(transformAllTasks)
      .then(populateMissingFieldValues)
      .then(formatUserTasksReduxModel)
      .then(function (userTasks) {


        var userId = $rootScope.user.id.fieldValue;
        var appDefId = NavigationService.getAppState().id;
        //$ngRedux.dispatch(reduxActions.loadTasks(userTasks, userId, appDefId));
        getUserTasks().then(function(userTasksObj){
          var scrubbedServerTasks = {list:[], instances:{}};
          if(!_.isUndefined(userTasksObj.instances)){
            _.each(userTasks.list, function(clientId){
              var currentTask = userTasksObj.instances[clientId];
              if(currentTask){
                if(currentTask.taskdata.statusId === ArvakConfig.taskStatus.open){
                  scrubbedServerTasks.list.push(clientId);
                  scrubbedServerTasks.instances[clientId] = userTasks.instances[clientId];
                }
              }else{
                scrubbedServerTasks.list.push(clientId);
                scrubbedServerTasks.instances[clientId] = userTasks.instances[clientId];
              }
            })
          }else{
            scrubbedServerTasks = userTasks;
          }
          $ngRedux.dispatch(reduxActions.upsertTasks(scrubbedServerTasks, userId, appDefId));
        });

        _dataLoading = false;
        return true;



      }).catch(function(error){
        _dataLoading = false;
        throw error;


      })
  }

  /**
   *  Get new tasks from last sync time and upsert them to the existing ones
   * @returns {*}
   */
  function getLatestAfterSubmit() {
    if (!ConnectionService.isOnline() || isGetLatestAfterSubmitRunning) {
      return $q.when([]);
    }
    _dataLoading = true;
    isGetLatestAfterSubmitRunning = true;
    return $timeout(function () {}, 3000)
      .then(getLastSyncTime)
      .then(getTasksFromServer)
      .then(transformAllTasks)
      .then(populateMissingFieldValues)
      .then(formatUserTasksReduxModel)
      .then(function (userTasks) {

        var userId = $rootScope.user.id.fieldValue;
        var appDefId = NavigationService.getAppState().id;

        //$ngRedux.dispatch(reduxActions.upsertTasks(userTasks, userId, appDefId));
        return UserService.getUserSettings().then(function (userSettings) {
          //console.log("GET LATEST");

          var userOpenTasks = userSettings.general.openTaskIds;
          return getUserTasks().then(function (userTasksObj) {
            //Remove stale tasks
            var removeIds = _.difference(userTasksObj.list, userOpenTasks);
            //var removeIds = _.without.apply(_, userTasksObj.list.concat(userOpenTasks));
            var tasksForRemoval = {};
            _.each(removeIds, function (taskId) {
              tasksForRemoval[taskId] = userTasksObj.instances[taskId];
            });

            _.each(tasksForRemoval, function (taskToRemove) {
              //console.log("removing");
              $ngRedux.dispatch(reduxActions.removeTask(taskToRemove, userId, appDefId));
            });
            var scrubbedServerTasks = {list: [], instances: {}};
            if (!_.isUndefined(userTasksObj.instances)) {
              _.each(userTasks.list, function (clientId) {
                var currentTask = userTasksObj.instances[clientId];
                if (currentTask) {
                  if (currentTask.taskdata.statusId === ArvakConfig.taskStatus.open) {
                    scrubbedServerTasks.list.push(clientId);
                    scrubbedServerTasks.instances[clientId] = userTasks.instances[clientId];
                  }
                } else {
                  scrubbedServerTasks.list.push(clientId);
                  scrubbedServerTasks.instances[clientId] = userTasks.instances[clientId];
                }
              })
            } else {
              scrubbedServerTasks = userTasks;
            }
            return $ngRedux.dispatch(reduxActions.upsertTasks(scrubbedServerTasks, userId, appDefId));
          });
        });

      }).catch(function (error) {
        return $q.reject(error);
      }).finally(function(){
        _dataLoading = false;
        isGetLatestAfterSubmitRunning = false;
      });
  }

  function flushTasks(){
    if (!ConnectionService.isOnline()) {
      return $q.when(false);
    }
    //Clean lastSyncTime
    UserService.getUserSettings().then(function (userSettings) {
      userSettings.general.lastSyncTime = null;
      UserService.setUserSettings(userSettings);
    });

    var userId = $rootScope.user.id.fieldValue;
    var appDefId = NavigationService.getAppState().id;
    $ngRedux.dispatch(reduxActions.flushTasks(userId, appDefId));
  }

  function setAutoPolling(){
    //Auto polling tasks every 30 seconds
    var interval = 30 * 1000; //30 seconds
    pollingTasksInterval = $interval(function(){
      if (ConnectionService.isOnline() && !isAutoPollingRunning){
        processUnsentTasks()
          .then(getLatestAfterSubmit)
          .catch(function(error){
            console.log("error in polling");
            return $q.reject(error);




          })
          .finally(function(){
            isAutoPollingRunning = false;
          });
      }
    }, interval);
  }

  function cancelAutoPolling(){
    if (pollingTasksInterval) {
      $interval.cancel(pollingTasksInterval);
      pollingTasksInterval = null;
    }
  }
}
