(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  require("./dmn/dmn");
  require("./dmn/services/dataSourceHelper");
  require("./dmn/services/sharedInterfaces");
  require("./dmn/services/dmnSharedInterfaces");
  require("./dmn/services/decisionTable");
  require("./dmn/services/apiService");
  require("./dmn/services/apiColl");
  require("./dmn/services/decisionTableService");
  require("./dmn/controllers/cardsController");
  require("./dmn/controllers/builderController");
  require("./dmn/directives/decisionTableDirective");
  require("./dmn/directives/sharedToolTipDirective");
  require("./dmn/directives/inputEntryBuilderDirective");
  require("./dmn/directives/fieldsSelectorSidebarDirective");
  
},{"./dmn/controllers/builderController":2,"./dmn/controllers/cardsController":3,"./dmn/directives/decisionTableDirective":5,"./dmn/directives/fieldsSelectorSidebarDirective":6,"./dmn/directives/inputEntryBuilderDirective":7,"./dmn/directives/sharedToolTipDirective":8,"./dmn/dmn":9,"./dmn/services/apiColl":10,"./dmn/services/apiService":11,"./dmn/services/dataSourceHelper":12,"./dmn/services/decisionTable":13,"./dmn/services/decisionTableService":14,"./dmn/services/dmnSharedInterfaces":15,"./dmn/services/sharedInterfaces":17}],2:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var moment = require("moment");
  var dialogHelper_1 = require("./dialogHelper");
  var BuilderController = (function () {
    function BuilderController($scope, $state, $stateParams, $rootScope, $q, $timeout, $uibModal, flash, OdinConfig, $injector, DialogTriggerService) {
      var _this = this;
      this.$scope = $scope;
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.$rootScope = $rootScope;
      this.$q = $q;
      this.$timeout = $timeout;
      this.$uibModal = $uibModal;
      this.flash = flash;
      this.OdinConfig = OdinConfig;
      this.$injector = $injector;
      this.DialogTriggerService = DialogTriggerService;
      this.titleEditable = true;
      this.editTitle = function () { return dialogHelper_1.DialogHelper.calldialog(_this.$uibModal, _this.entDef, _this.config.dialogs.edit, { name: _this.entDef.name, icon: _this.entDef.icon })
        .then(function (newSettings) {
          var me = _this;
          var ent = _this.entDef;
          var $rootScope = _this.$rootScope;
          ent.name = newSettings.name;
          ent.icon = newSettings.icon;
          $rootScope.pageIcon = ent.icon;
          $rootScope.pageTitle = ent.name;
        }); };
      this.delete = function () {
        var me = _this;
        var vm = _this;
        var ent = vm.entDef;
        jQuery.SmartMessageBox({
          title: 'Remove?', content: 'Are you sure you want to remove ' + ent.name + '?', buttons: '[No][Yes]', audio: false
        }, function (result) { if (result === 'Yes') {
          me.coll.deleteOne(ent.id).then(function (res) { me.goToList(); });
        } });
      };
      this.copy = function () {
        var me = _this;
        var vm = _this;
        var ent = vm.entDef;
        dialogHelper_1.DialogHelper.calldialog(_this.$uibModal, ent, _this.config.dialogs.copy, { name: 'Copy of ' + ent.name, icon: ent.icon })
          .then(function (res) {
            var coll = me.coll;
            return coll.cloneOne(ent.id, { name: res.name, icon: res.icon }).then(function (ent) {
              me.$state.go(me.config.routes.builder, { id: ent.id });
            }).catch(function () { me.flash.error = 'Failed to save definition'; });
          });
      };
      this.isPublished = function () {
        var vm = _this;
        var me = _this;
        return (vm.entDef) && (vm.entDef.statusId === me.OdinConfig.status.published);
      };
      this.publish = function (updating) {
        var vm = _this;
        var me = _this;
        vm.entDef.statusId = me.OdinConfig.status.published;
        vm.save();
      };
      this.openPermissions = function openPermissions() {
        var vm = this;
        vm.publish(true);
      };
      this.openSettings = function openSettings() {
        // Copy this from reporter module if desired
      };
      this.unpublish = function unpublish() {
        var vm = this;
        var me = this;
        vm.isUnpublishing = true;
        vm.entDef.statusId = me.OdinConfig.status.draft;
        vm.entDef.roles = null;
        vm.save().then(function () {
          vm.isUnpublishing = false;
        });
      };
      this.goToList = function () {
        _this.$state.go(_this.config.routes.cards);
      };
      this.save = function () {
        // return this.$q.when(true);
        var vm = _this;
        var me = _this;
        // let currstatus = vm.entDef.statusId;
        vm.saving = true;
        return me.coll.save(vm.entDef.id)
          .catch(function (err) { }) // handled internally, added to allow continuatio of interval.
          .finally(function () {
            vm.saving = false;
          });
      };
      // TODO may be moved outside of controller to ApiColl/ApiColls
      this.autoSaveIntervalInSeconds = 5;
      this.autoSaveInterval = function () {
        var vm = _this;
        var me = _this;
        var prom = me.$q.when(true);
        if (vm.entDef.dirty > 0 && !vm.saving && moment().diff(moment(vm.entDef.lastDirty), 'seconds', true) > _this.autoSaveIntervalInSeconds) {
          prom = vm.save();
        }
        prom.then(function () { me.autoSaveIntervalTimeoutFn = me.$timeout(vm.autoSaveInterval, 1000); });
      };
      this.init = function () {
        var me = _this;
        var vm = _this;
        var s = me.$scope;
        var $rootScope = me.$rootScope;
        me.configAll = me.$state.current.data.viewConfig;
        me.config = me.configAll[me.configAll.viewKey];
        me.svc = me.$injector.get(me.config.serviceName);
        $rootScope.pageTitle = me.config.pageTitle;
        $rootScope.module = me.configAll.pageModule;
        $rootScope.pageIcon = me.config.pageIcon;
        me.$scope.$on('$destroy', function (event) {
          if (me.autoSaveIntervalTimeoutFn)
            me.$timeout.cancel(me.autoSaveIntervalTimeoutFn);
        });
        vm.saving = false;
        vm.id = +me.$stateParams.id;
        return me.svc.init().then(function () {
          me.coll = me.svc[me.config.serviceCollectionName];
          me.coll.findOne(vm.id, { cache: false }).then(function (ent) {
            vm.entDef = ent;
            vm.fieldsDisabled = true;
            if (me.entPropWatch)
              me.entPropWatch();
            me.entPropWatch = s.$watchGroup([function () { return vm.entDef.name; }, function () { return vm.entDef.icon; }], function (newEnt, oldEnt) {
              $rootScope.pageTitle = me.config.pageTitle + ent.name;
              $rootScope.pageIcon = ent.icon;
            });
            if (me.autoSaveIntervalTimeoutFn)
              me.$timeout.cancel(me.autoSaveIntervalTimeoutFn);
            vm.autoSaveInterval();
          });
        });
      };
      this.init();
    }
    return BuilderController;
  }());
  exports.BuilderController = BuilderController;
  angular
    .module('odin.dmn')
    .controller('BuilderController', BuilderController);
  
},{"./dialogHelper":4,"moment":19}],3:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
// import * as angular from 'angular';
  var moment = require("moment");
  var _ = require("lodash");
  var dialogHelper_1 = require("./dialogHelper");
  var CardsController = (function () {
    function CardsController($scope, $rootScope, $http, $state, $filter, $uibModal, DataSourceService, Dialog, MenuService, DialogTriggerService, $q, flash, FilterService, OdinConfig, $injector, $log) {
      "ngInject";
      var _this = this;
      this.$rootScope = $rootScope;
      this.$state = $state;
      this.$uibModal = $uibModal;
      this.Dialog = Dialog;
      this.DialogTriggerService = DialogTriggerService;
      this.flash = flash;
      this.OdinConfig = OdinConfig;
      this.$injector = $injector;
      this.$log = $log;
      this.init = function () {
        var me = _this;
        var vm = _this;
        var $rootScope = me.$rootScope;
        me.configAll = me.$state.current.data.viewConfig;
        me.config = me.configAll[me.configAll.viewKey];
        me.builderRoute = me.config.routes.builder;
        me.svc = me.$injector.get(me.config.serviceName);
        $rootScope.pageTitle = me.config.pageTitle;
        $rootScope.pageIcon = me.config.pageIcon;
        $rootScope.module = me.configAll.pageModule;
        vm.statuses = me.OdinConfig.status;
        // vm.selectedDecisionTable = null;
        vm.sorts = [
          { name: 'Alphabetical', value: 'name', order: false },
          { name: 'Last Modified', value: 'modifiedTs.time', order: true }
        ];
        vm.filters = [
          { name: 'All', value: null },
          { name: 'Drafts', value: me.OdinConfig.status.draft },
          { name: 'Published', value: me.OdinConfig.status.published }
        ];
        vm.filter = {
          search: '',
          sortBy: 'name',
          sortOrder: false,
          filterBy: null
        };
        vm.ents = [];
        return me.svc.init().then(function () {
          var scoll = me.coll = me.svc[me.config.serviceCollectionName];
          return _this.reload();
        });
      };
      this.reload = function () {
        var me = _this;
        var vm = _this;
        var filter = { select: { id: true, name: true, icon: true, statusId: true, roles: true, type: true, modifiedTs: true } };
        me.coll.find({ cache: false, filter: filter }).then(function (ents) {
          vm.ents = ents;
          me.reloadLocal();
        });
      };
      this.reloadLocal = function () {
        var me = _this;
        var vm = _this;
        // this.$log.debug('get all definitions');
        vm.entsByType = _.groupBy(me.ents, function (ent) {
          return ent.type || 'All';
        });
        // entsByType[1] = _.groupBy(entsByType[1], function (ent: any) {
        //   if (!_.isUndefined(ent.dataSources[0])) {
        //     return ent.dataSources[0].dataSourceName;
        //   } else {
        //     return 'No Data Source';
        //   }
        // });
        // entsByType[2] = { '': entsByType[2] };
        // entsByType[3] = { '': entsByType[3] };
        // entsByType[4] = { '': entsByType[4] };
      };
      this.create = function () {
        var me = _this;
        var options = me.config.dialogs.create.options;
        me.DialogTriggerService.openNewDialog(options)
          .then(function (ent) {
            if (ent === false)
              return;
            ent.type = ent.formTypeId;
            me.coll.create(ent)
              .then(function (result) {
                me.$state.go(me.builderRoute, { id: result.id });
              }).catch(function () { me.flash.error = 'Failed to save definition'; });
          });
      };
      this.delete = function (ent) {
        var me = _this;
        jQuery.SmartMessageBox({
          title: 'Remove?', content: 'Are you sure you want to remove ' + ent.name + '?', buttons: '[No][Yes]', audio: false
        }, function (result) { if (result === 'Yes') {
          me.coll.deleteOne(ent.id).then(function (res) { me.reloadLocal(); });
        } });
      };
      this.copy = function (ent) {
        var me = _this;
        dialogHelper_1.DialogHelper.calldialog(_this.$uibModal, ent, _this.config.dialogs.copy, { name: 'Copy of ' + ent.name, icon: ent.icon })
          .then(function (res) {
            var coll = me.coll;
            coll.findOne(ent.id, { cache: false }).then(function () {
              return coll.cloneOne(ent.id, { name: res.name, icon: res.icon }).then(function (ent) {
                me.design(ent);
              }).catch(function () { me.flash.error = 'Failed to save definition'; });
            });
          });
      };
      this.design = function (ent) {
        var me = _this;
        _this.$state.go(me.builderRoute, { id: ent.id });
      };
      this.getUpdateTime = function getUpdateTime(ent) {
        if (ent && ent.modifiedTs && ent.modifiedTs.time)
          return moment(ent.modifiedTs.time).calendar(); // TODO modifiedTs
      };
      var me = this;
      me.init();
    }
    return CardsController;
  }());
  exports.CardsController = CardsController;
  angular
    .module('odin.dmn')
    .controller('CardsController', CardsController);
  
},{"./dialogHelper":4,"lodash":18,"moment":19}],4:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var DialogHelper = (function () {
    function DialogHelper() {
    }
    return DialogHelper;
  }());
  DialogHelper.calldialog = function ($uibModal, ent, config, model) {
    var modalInstance = $uibModal.open({
      templateUrl: config.templateUrl,
      controller: function ($scope, $uibModalInstance) {
        $scope.title = config.title;
        $scope.model = model;
        $scope.cancel = function () { $uibModalInstance.dismiss('cancel'); };
        $scope.ok = function () { $uibModalInstance.close($scope.model); };
      }
    });
    return modalInstance.result;
  };
  exports.DialogHelper = DialogHelper;
  
},{}],5:[function(require,module,exports){
  'use strict';
  var __assign = (this && this.__assign) || Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
  Object.defineProperty(exports, "__esModule", { value: true });
// import * as angular from 'angular';
  var _sh = require("../services/dmnSharedInterfaces");
  angular.module('odin.dmn')
    .directive('decisionTable', ['$timeout', 'decisionTableService', '$compile', 'dataSourceHelper',
      function ($timeout, decisionTableService, $compile, dsh) {
        var $log = dsh.$log;
        'use strict';
        return {
          restrict: 'E',
          // controllerAs: 'dtCtrl', bindToController: true,
          templateUrl: '/templates/dmn/directives/decisionTableDirective.htm',
          scope: {
            dtId: '@',
            dtHeight: '@'
          },
          link: function (scope, element, attrs) {
          },
          controller: ['$scope', '$uibPosition', function ($scope, $uibPosition) {
            var vm = $scope;
            var s = $scope;
            var svc = vm.svc = decisionTableService;
            var rs = dsh.$rootScope;
            var getAgCellById = function (cellId) {
              return angular.element(document.getElementById(cellId)).closest('.ag-cell');
            };
            vm.toNextCell = function (dir) {
              var prevcid = vm.selectedCell.eleId;
              var cell = getAgCellById(prevcid);
              var ncell = null;
              if (dir > 0)
                ncell = cell.next();
              else
                ncell = cell.prev();
              ncell.children().first().click();
              // (<any>vm.gridOptions).api.tabToNextCell();
            };
            vm.changeSelectedCell = function (rid, cid, prop) {
              // angular.element('#'+cellid).scope().rowNode
              vm.showToolTip = (prop !== _sh.DecisionTableFieldPropType.description);
              vm.selectedCell = {
                dt: vm.dt,
                eleId: vm.getCellId(cid, rid),
                dtId: vm.dtId,
                fieldId: cid, ruleIx: rid, prop: prop,
                entry: vm.dt.getCellEntry(rid, cid, prop)
              };
              // vm.selectedCellId = vm.selectedCell.id;
            };
            vm.stopEditing = function () {
              vm.gridOptions.api['stopEditing']();
              vm.selectedCell = {}; // .id = '';
            };
            // vm.selectedCellId = {
            //     get function() { debugger; return vm.selectedCell.id; },
            //     set function(val) { vm.selectedCell.id = val; }
            // }
            vm.selectedCell = {};
            // Object.defineProperty(vm, 'selectedCellId', {
            //     get : function() { $log.debug(this.selectedCell.id); return this.selectedCell.id; },
            //     set : function(val) { vm.selectedCell.id = val; }
            // });
            vm.drag = {
              onRowPostCreate: function (params) {
                var $row = angular.element(params.eRow);
                var rowData = params.node.data;
                var dtId = vm.dtId;
                var ix = params.rowIndex;
                var jdata = JSON.stringify({ dtId: dtId, ix: ix });
                $row.attr('ng-drop', 'true');
                $row.attr('ng-drop-success', 'drag.onDropSuccess(' + jdata + ', $data, $event, $target)');
                $row.attr('ng-drag', 'true');
                $row.attr('ng-drag-data', jdata);
                var rowScope = s.$new(false); // TODO warning check if previous scopes are drestroyed or do it.
                $compile($row)(rowScope);
              },
              onDropSuccess: function (destData, originData, $event, $target) {
                // let ele = $event.event.toElement
                if (originData.dtId === destData.dtId) {
                  vm.dt.rules.move(originData.ix, destData.ix);
                }
              }
            };
            var init = function () {
              vm.style = new Style(s);
              vm.ctRowsToBeAdded = 1;
              // vm.hitPoliciesNames = <any>_sh.DecisionTableHitPolicy;
              // vm.hitPolicies = Object.keys(_sh.DecisionTableHitPolicy).filter(k => parseInt(k)).map(o => parseInt(o));
              vm.hitPolicies = [];
              Object.keys(_sh.DecisionTableHitPolicy).filter(function (k) { return parseInt(k); }).map(function (o) { vm.hitPolicies[o] = _sh.DecisionTableHitPolicy[o]; });
              vm.gridOptions = __assign({ appScopeProvider: vm, angularCompileRows: true, angularCompileHeaders: true, rowHeight: vm.style.rowHeight, headerHeight: vm.style.headerHeight, suppressContextMenu: true, enableSorting: false, showToolPanel: false, toolPanelSuppressPivot: true, toolPanelSuppressValues: true, enableFilter: false,
                // suppressRowClickSelection: true,
                suppressMenuHide: true, enableColResize: true, context: null }, {
                processRowPostCreate: vm.drag.onRowPostCreate
              }, { rowSelection: 'multiple', rowDeselection: true, suppressRowClickSelection: false, onSelectionChanged: vm.onSelectionChanged });
              svc.init().then(function () {
                // watchers
                s.$watch(function () { return vm.dtId; }, function () { return reload(); });
              });
            };
            var descriptionCellRenderer = function (params) {
              var entry = params.value;
              var cid = params.column.colId;
              var rid = params.rowIndex;
              if (!entry) {
                return '';
              }
              return "<div class='dmn-cell'><span>" + entry.v + "</span></div>";
            };
            var ixRuleCellRenderer = function (params) {
              var val = params.value;
              var rid = params.rowIndex;
              // <input type="checkbox" ng-model="selectedRules[' + rid + ']">&nbsp;
              return '<span ng-drag-handle ><span class="fa fa-bars"></span><span>&nbsp;&nbsp;' + val + '</span> </span>'; // <button data-ng-click="drag(this)" class="btn btn-default">D</button> // ng-drag="true"
            };
            //                     let hitpolicyHeaderCellRenderer = function (params) {
            //                         let val = params.value;
            //                         let rid = params.rowIndex;
            //                     };
            vm.getCellId = function (cid, rid) {
              return "dmn-dt-cell|" + s.$id + "|" + vm.dtId + "|" + cid + "|" + rid;
            };
            var entryCellRenderer = function (params) {
              var entry = params.value;
              var cid = params.column.colId;
              var rid = params.rowIndex;
              if (!entry) {
                return '';
              }
              var feelV = entry.expression.feelV;
              if (typeof feelV !== 'string') {
                if (feelV.then) {
                  feelV.then(function (newData) {
                    params.node.setDataValue(params.column.colId, entry);
                  });
                }
                return "<div class='dmn-cell'><span></span></div>";
              }
              return "<div class='dmn-cell'><span>" + entry.expression.feelV + "</span></div>";
            };
            // let rulesWatch, inWatch, outWatch;
            var onListenerCancel;
            var reload = function () {
              $log.debug('dmn dt - reload');
              svc.dts.findOne(vm.dtId).then(function (dt) {
                vm.dt = dt;
                if (!dt) {
                  $log.debug("dmn td id:'" + vm.dtId + "' doesnt exists");
                  return;
                }
                if (onListenerCancel)
                  onListenerCancel(); // TODO hook to scope destroy
                var emitKey = dt.__classId + '-' + dt.id;
                onListenerCancel = rs.$on(emitKey, function (ctx, info) {
                  if (!info.locs || (info.locs && info.locs.some(function (o) { return o === _sh.EmitDmnLocations.rules; })))
                    vm.refreshGrid();
                });
                vm.refreshGrid();
              });
            };
            var setRowsData = function (dt) {
              vm.gridOptions.api.setRowData(getRowsData(dt));
              vm.gridOptions.api.hideOverlay();
            };
            // TODO pending refresh data per cell https://www.ag-grid.com/javascript-grid-refresh/#gsc.tab=0 w/ setDataValue(colKey, newValue)
            var rulesWatch;
            vm.refreshGrid = function () {
              vm.refreshGridRows();
              vm.refreshGridColumns();
            };
            vm.refreshGridRows = function () {
              vm.selectedRules = [];
              vm.style.gridChangeUpdate();
              setRowsData(vm.dt);
            };
            vm.refreshGridColumns = function () {
              vm.gridOptions.api.setColumnDefs(getColDef(vm.dt));
            };
            var getRowsData = function (dt) {
              return vm.rowsData = dt.rules.arr.map(function (rule, ix) { return __assign({ ix: ix, description: rule.description }, rule.inputEntries, rule.outputEntries, { _rule: rule }); });
            };
            vm.addNewRule = function () {
              Array(vm.ctRowsToBeAdded).slice().map(function () { return vm.dt.pushRule(); });
              vm.ctRowsToBeAdded = 1;
            };
            vm.deleteSelectedRules = function () {
              var res = [];
              vm.selectedRules.map(function (r, ix) { if (vm.selectedRules[ix])
                res.push(ix); });
              vm.dt.rules.delByIxs(res);
            };
            vm.onSelectionChanged = function () {
              var selectedRows = vm.gridOptions.api.getSelectedRows();
              var selectedRowsString = '';
              vm.selectedRules.length = 0;
              selectedRows.map(function (selectedRow, index) {
                vm.selectedRules[selectedRow.ix] = true;
              });
            };
            var getHeaderName = function (id, ty) {
              var dt = vm.dt;
              var field = dsh.getField(id);
              // let fldsbyid = dt.getFieldsByIdAndInOut(id, ty);
              // if (fldsbyid && fldsbyid.length > 1) {
              return field.sourceField.dsTypeName + ' - ' + field.ddEntry.name;
              // } else {
              //     return field.ddEntry.name;
              // }
            };
            var getColDef = function (dt) {
              var cfg = { suppressMenu: true, supperssSorting: true, suppressMovable: true };
              var cfgIn = { suppressMenu: true, supperssSorting: true, suppressMovable: false };
              var cfgOut = {};
              var cfgInOut = { suppressResize: false };
              var cfgRuleIx = { suppressSizeToFit: true, suppressResize: false };
              var inp = _sh.DecisionTableFieldPropType.inputEntries;
              var ous = _sh.DecisionTableFieldPropType.outputEntries;
              var colFields = [
                {
                  headerName: 'Inputs', headerClass: 'dmn-head-cell-group',
                  children: dt.fields.inputs.map(function (it) { return __assign({ headerName: getHeaderName(it.id, inp), field: it.id, editable: true }, cfgIn, cfgInOut, { cellRenderer: entryCellRenderer, headerClass: 'dmn-head-cell-in', cellClass: 'dmn-cell', cellEditor: CellEditor, cellEditorParams: { vm: vm, ty: inp } }); })
                },
                {
                  headerName: 'Output', headerClass: 'dmn-head-cell-group',
                  children: dt.fields.outputs.map(function (it) { return __assign({ headerName: getHeaderName(it.id, ous), field: it.id, editable: true }, cfgOut, cfg, cfgInOut, { cellRenderer: entryCellRenderer, headerClass: 'dmn-head-cell-out', cellClass: 'dmn-cell', cellEditor: CellEditor, cellEditorParams: { vm: vm, ty: ous } }); })
                }
              ];
              // let pa : ag.grid.ColDef= {headerCellRenderer};
              var columnDefs = [__assign({ headerName: 'Rule', field: 'ix', headerClass: 'dmn-head-cell-group', cellRenderer: ixRuleCellRenderer, headerCheckboxSelection: true, checkboxSelection: true, width: 65 }, cfgRuleIx, cfg)].concat(colFields, [__assign({ headerName: 'Description', field: _sh.DecisionTableFieldPropType.description, headerClass: 'dmn-head-cell-group', cellRenderer: descriptionCellRenderer, cellEditor: CellEditor, cellEditorParams: { vm: vm, ty: _sh.DecisionTableFieldPropType.description }, editable: true }, cfg)]);
              return columnDefs;
            };
            init();
          }]
        };
      }
    ]);
  var Style = (function () {
    function Style(s) {
      var _this = this;
      this.s = s;
      this.gridChangeUpdate = function () {
        _this.updateGridHeight(_this.vm.dt.rules.arr.length);
      };
      this.unit = 'px';
      this.headerHeight = 40;
      this.rowHeight = 30;
      this.vm = s;
    }
    Style.prototype.updateGridHeight = function (rows) {
      if (this.vm.dtHeight !== 'fixed') {
        this.gridHeight = ((this.rowHeight) * rows + (this.headerHeight) * 2 + 25) + this.unit;
      }
      else {
        this.dtHeight = 'calc(100% - 80px)';
        this.gridHeight = '100%';
      }
    };
    ;
    return Style;
  }());
// http://fdietz.github.io/recipes-with-angular-js/common-user-interface-patterns/editing-text-in-place-using-html5-content-editable.html
  angular.module('odin.dmn').
  directive('contenteditable', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        function read() {
          ngModel.$setViewValue(element.text().trim());
        }
        ngModel.$render = function () {
          element.text(ngModel.$viewValue || '');
        };
        element.spellcheck = false;
        element.bind('keypress', function (e) {
          var code = e.keyCode || e.which;
          if (code === 13) {
            e.preventDefault();
          }
        });
        // element.bind('paste', function(){
        //     $('br,p', this).replaceWith(' ');
        // });
        element.bind('blur keyup change', function (event) {
          scope.$apply(read);
          if (event.keyCode === 13) {
            element.text(ngModel.$viewValue);
            element.blur();
          }
        });
      }
    };
  });
// https://www.ag-grid.com/javascript-grid-cell-editing/?framework=all#gsc.tab=0
  var CellEditor = (function () {
    function CellEditor() {
      var _this = this;
      this.init = function (params) {
        var me = _this;
        var vm = me.vm = me.s = params.vm;
        me.ty = params.ty;
        // create the cell
        var e = _this.eInput = document.createElement('input');
        e.className = 'ag-cell-edit-input';
        e.addEventListener('keydown', _this.onKeyDown);
        me.cid = params.column.colId;
        me.rid = params.node.childIndex; // rowIndex;
        me.rule = params.node.data._rule;
        params.node.setSelected(true);
        // params.eGridCell.id = me.cellId = vm.getCellId(me.cid, me.rid);
        e.id = me.cellId = vm.getCellId(me.cid, me.rid);
        if (me.ty === _sh.DecisionTableFieldPropType.description) {
          me.entryDesc = params.value;
          e.value = me.entryDesc.v;
        }
        else {
          me.entryExp = params.value;
          var feelV = me.entryExp.expression.feelV;
          _this.update(feelV);
          e.setAttribute('readonly', '');
        }
      };
      this.update = function (feelV) {
        var e = _this.eInput;
        if (typeof feelV !== 'string') {
          if (feelV.then) {
            feelV.then(function (fv) {
              e.value = fv;
            });
          }
          else {
            e.value = ''; // error
          }
        }
        else {
          e.value = feelV;
        }
      };
      this.getGui = function () {
        return this.eInput;
      };
      this.afterGuiAttached = function () {
        var me = _this;
        me.vm.changeSelectedCell(me.rid, me.cid, me.ty);
        if (me.entryExp) {
          // handle CellEditor editor update
          var exp_1 = me.exp = me.vm.selectedCell.entry.expression;
          if (_this.expressionWatch) {
            _this.expressionWatch();
          }
          ;
          _this.expressionWatch = me.s.$watch(function () { return exp_1.feelV; }, function () {
            _this.update(exp_1.feelV);
          });
        }
        _this.eInput.focus();
        // $log.debug('after att', me.vm.selectedCellId);
        me.s.$apply();
      };
      this.updateBulk = function () {
        var me = _this;
        var vm = me.vm;
        // if (vm.bulkOn) {
        var rulesIx = [];
        vm.selectedRules.map(function (flg, ix) { if (flg && me.rid !== ix)
          rulesIx.push(ix); });
        var bulk = vm.dt.bulkUpdate(me.rid, rulesIx, me.cid, me.ty);
        if (bulk) {
          vm.refreshGridRows();
          var cpyselected_1 = vm.selectedRules.slice(); // to bypass change event that reset array selection while setSelecting
          vm.gridOptions.api.forEachNode(function (node) {
            if (cpyselected_1[node.data.ix]) {
              node.setSelected(true);
            }
          });
        }
      };
      this.getValue = function () {
        if (_this.entryDesc) {
          _this.entryDesc.v = _this.eInput.value;
          _this.updateBulk();
          return _this.entryDesc;
        }
        else {
          _this.updateBulk();
          return _this.entryExp; // this.eInput.value;
        }
      };
      this.destroy = function () {
        // but this example is simple, no cleanup, we could
        // even leave this method out as it's optional
      };
      this.isPopup = function () {
        return false;
      };
    }
    CellEditor.prototype.onKeyDown = function (event) {
      var key = event.which || event.keyCode;
      if (key === 37 || key === 39) {
        event.stopPropagation();
      }
    };
    return CellEditor;
  }());
  
},{"../services/dmnSharedInterfaces":15}],6:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var _ = require("lodash");
  (function () {
    'use strict';
    angular.module('odin.dmn')
      .directive('fieldsSelectorSidebar', ['$timeout', 'dataSourceHelper', 'FieldService',
        function ($timeout, dataSourceHelper, FieldService) {
          return {
            restrict: 'E',
            templateUrl: '/templates/dmn/directives/fieldsSelectorSidebarDirective.htm',
            scope: {
              // serviceId: '@service', collId: '@coll', itemId: '@item', datasourcesId: '@datasources', // can be changed to json $eval
              options: '='
            },
            controller: ['$scope', '$injector', '$q', function ($scope, $injector, $q) {
              var vm = $scope;
              var s = $scope;
              var init = function () {
                var svc = vm.svc = $injector.get(vm.options.service);
                var svccoll = svc[vm.options.coll]; // collection that contains object that contains fieldsByMode collection
                vm.formTypeId = 4; // TODO check with ray
                vm.dataSourceOptions = [];
                vm.fieldsByMode = {};
                vm.selected = { flatDataSources: [] };
                return svc.init().then(function () {
                  var proms = [];
                  proms.push(dataSourceHelper.initDataSourceTypes().then(function (dataSourceOptions) { return vm.dataSourceOptions = dataSourceOptions; }));
                  proms.push(svccoll.findOne(vm.options.item).then(function (ent) { vm.entDef = ent; vm.fieldsByMode = ent[vm.options.fieldsByS]; }));
                  return $q.all(proms).then(function () {
                    updateDatasourceTypeSelector();
                    vm.updateDataSourceTypes();
                  });
                });
              };
              // refresh ui-select datasourcetypes
              var updateDatasourceTypeSelector = function () {
                var fields = [];
                vm.options.selectors.map(function (selector) {
                  Array.prototype.push.apply(fields, vm.fieldsByMode[selector.coll]);
                });
                vm.selected.flatDataSources = dataSourceHelper.getFlatDataSourcesWithTypes(fields);
              };
              vm.loadedDataSourceTypes = [];
              ////////////// TODO this may be replaced by dics to improve perf
              vm.isSelectedByField = function (field, mode) {
                var res = vm.isSelected(dataSourceHelper.getFieldSelector(field), mode);
                return res;
              };
              vm.isSelected = function (fieldS, mode) {
                var ds = vm.fieldsByMode[mode];
                var res = findFieldSelectorIndex(ds, fieldS) !== -1;
                return res;
              };
              //////////////
              var findFieldSelectorIndex = function (fs, fld) {
                return _.findIndex(fs, function (f) { return f.id === fld.id && f.dsId === fld.dsId; });
              };
              var colls = vm.options.selectors.map(function (selector) { return selector.coll; });
              vm.toggleField = function (field, selector) {
                var fld = dataSourceHelper.getFieldSelector(field);
                var curcoll = selector.coll;
                var curfs = vm.fieldsByMode[curcoll];
                var add = function (fs, fld) { return fs.push(fld); };
                var remove = function (fs, fld) {
                  var ix = findFieldSelectorIndex(fs, fld);
                  if (ix >= 0)
                    fs.splice(ix, 1);
                };
                var grp = selector.grp;
                if (!vm.isSelected(fld, curcoll)) {
                  add(curfs, fld);
                  if (grp) {
                    // remove grouped
                    colls.map(function (coll) {
                      if (coll !== curcoll) {
                        var otherselector = _.find(vm.options.selectors, function (sel) { return sel.coll === coll; });
                        if (otherselector.grp === grp) {
                          var otherfs = vm.fieldsByMode[coll];
                          remove(otherfs, fld);
                        }
                      }
                    });
                  }
                }
                else {
                  remove(curfs, fld);
                }
              };
              vm.updateDataSourceTypes = function () {
                dataSourceHelper.getDatasourceFields(vm.selected.flatDataSources, vm.formTypeId).then(function (dataSourceTypesWithFields) {
                  vm.loadedDataSourceTypes = dataSourceTypesWithFields;
                });
              };
              init();
            }]
          };
        }
      ]);
  })();
  
},{"lodash":18}],7:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var _ = require("lodash");
  var _sh = require("../services/dmnSharedInterfaces");
  angular.module('odin.dmn')
    .directive('inputEntryBuilder', [function () {
      'use strict';
      return {
        restrict: 'E',
        scope: {
          selectedCell: '=',
          onTab: '&',
          refreshAfterEmit: '@'
        },
        templateUrl: '/templates/dmn/directives/inputEntryBuilderDirective.htm',
        link: function (scope, element, attrs) {
          var vm = scope;
          // tab test
          var searchInput = element.querySelectorAll('input.ui-select-search');
          searchInput.on('keydown', function (event) {
            if (event.keyCode === 9) {
              var dir = 1;
              if (event.shiftKey) {
                dir = -1;
              }
              if (vm.onTab)
                vm.onTab({ dir: dir });
            }
          });
          ///
        },
        controller: ['$scope', '$rootScope', '$element', '$timeout', '$parse', 'DataSourceServiceV2', 'decisionTableService', function ($scope, $rootScope, $element, $timeout, $parse, DataSourceServiceV2, dtsvc) {
          var vm = $scope;
          var s = $scope;
          vm.fieldMode = 'define';
          $rootScope.$on(vm.refreshAfterEmit, function () { vm.refresh(); });
          s.$watch(function () { return vm.selectedCell.dtId; }, function () {
            vm.refresh();
          });
          vm.refresh = function () {
            if (!(vm.selectedCell && vm.selectedCell.eleId))
              return;
            if (vm.selectedCell.prop === _sh.DecisionTableFieldPropType.description)
              return;
            vm.expression = vm.selectedCell.entry.expression;
            refreshFromTo();
            vm.field = getField();
          };
          var fields = [];
          var getField = function () {
            var k = vm.expression.field.key;
            if (fields[k])
              return fields[k];
            var field = _.cloneDeep(vm.expression.field);
            if (field.widget.id === _sh.widgets.radiogroup || field.widget.id === _sh.widgets.trueFalse) {
              field.widget = {
                'id': 9,
                'name': 'checkbox',
                'widgetCategoryTypeId': 1,
                'widgetCategoryTypeName': 'Lists',
                'template': 'checkboxgroup',
                'domainDictionaryTypeId': 1
              };
            }
            return fields[k] = field;
          };
          var ws = [];
          var refreshFromTo = function () {
            ws.map(function (w) { return w(); });
            ws = [];
            if (vm.expression.model.length === 0)
              vm.expression.model.push({});
            // workaround to avoid from.value/to.value inside model;
            var w;
            if (!vm.fromValue)
              vm.fromValue = {};
            if (!vm.toValue)
              vm.toValue = {};
            w = s.$watch(function () { return vm.expression.model[0].from; }, function () {
              vm.fromValue.value = vm.expression.model[0].from;
            });
            ws.push(w);
            w = s.$watch(function () { return vm.expression.model[0].to; }, function () {
              vm.toValue.value = vm.expression.model[0].to;
            });
            ws.push(w);
            w = s.$watch(function () { return vm.fromValue.value; }, function () {
              if (vm.fromValue.value !== undefined)
                vm.expression.model[0].from = vm.fromValue.value;
            });
            ws.push(w);
            w = s.$watch(function () { return vm.toValue.value; }, function () {
              if (vm.toValue.value !== undefined)
                vm.expression.model[0].to = vm.toValue.value;
            });
            ws.push(w);
          };
          var init = function () {
          };
          init();
        }]
      };
    }]);
  
},{"../services/dmnSharedInterfaces":15,"lodash":18}],8:[function(require,module,exports){
  'use strict';
// import { DecisionTableColl, DecisionTableService, DecisionTable, DecisionTableEntry } from '../services/decisionTableService';
  angular.module('odin.dmn')
    .directive('sharedToolTip', ['$interval', '$log',
      function ($interval, $log) {
        'use strict';
        return {
          restrict: 'E',
          templateUrl: '/templates/dmn/directives/sharedToolTipDirective.htm',
          scope: {
            elementId: '@',
            onClose: '&',
            useElementWidth: '@',
            placement: '@' //  over + options from  $uibPosition placement (at angular bootstra position.js)
          },
          link: function (scope, element, attrs) {
          },
          transclude: true,
          controller: ['$scope', '$uibPosition', '$rootScope', function ($scope, $uibPosition, $rootScope) {
            /// https://github.com/angular-ui/bootstrap/blob/master/src/position/position.js
            var vm = $scope;
            var s = $scope;
            var init = function () {
              vm.style = { top: '-1000px', left: '-1000px', show: false, width: null };
              vm.emitOpenKey = 'shared-tool-tip-open-' + s.$id;
              vm.emitCloseKey = 'shared-tool-tip-close-' + s.$id;
              vm.close = function () {
                vm.style.show = false;
                if (vm.checkTargetInterval) {
                  $interval.cancel(vm.checkTargetInterval);
                  vm.checkTargetInterval = null;
                }
                vm.targetTop = vm.targetLeft = null;
                vm.elementId = '';
                $rootScope.$emit(vm.emitCloseKey, { id: s.$id, open: false });
                vm.onClose();
              };
              s.$watch(function () { return vm.elementId; }, function (newVal, oldVal) {
                $log.debug('changed', vm.elementId);
                if (vm.elementId) {
                  // vm.close(); vm.elementId = newVal;
                  refreshTarget();
                  refreshTip();
                }
              });
              vm.checkTargetInterval = null;
              vm.targetTop = null;
              vm.targetLeft = null;
              var refreshTarget = function () {
                if (vm.elementId) {
                  vm.targetElement = angular.element(document.getElementById(vm.elementId));
                  if (!vm.targetElement[0])
                    return;
                  vm.checkTargetInterval = $interval(function () {
                    // close if parent moves, could be follwer.
                    var offs = vm.targetElement.offset();
                    var top = offs.top;
                    var left = offs.left;
                    if (!((!vm.targetTop) || (vm.targetTop === top && vm.targetLeft === left))) {
                      vm.close();
                    }
                    vm.targetTop = top;
                    vm.targetLeft = left;
                  }, 100);
                }
              };
              var refreshTip = function () {
                var targetElement = vm.targetElement;
                if (!vm.targetElement[0])
                  return;
                var hostElement = targetElement;
                var appendToBody = true;
                var placement = vm.placement = vm.placement || 'bottom';
                var placementbis = placement;
                var offsetY = 0;
                if (placement === 'over') {
                  placementbis = 'bottom';
                  offsetY = -hostElement[0].getHeight();
                }
                var ttPosition = $uibPosition.positionElements(hostElement, targetElement, placementbis, appendToBody);
                vm.style.top = (ttPosition.top + offsetY) + 'px';
                vm.style.left = ttPosition.left + 'px';
                vm.style.show = true;
                if (vm.useElementWidth === 'true') {
                  vm.style.width = targetElement.css('width');
                }
                $rootScope.$emit(vm.emitOpenKey, { id: s.$id, open: true });
              };
            };
            init();
          }]
        };
      }
    ]);
  
},{}],9:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var _ = require("lodash");
  (function () {
    'use strict';
    var dialogs = {
      edit: {
        templateUrl: '/templates/reporter/layout/reportSettingsModal.htm',
        title: 'Edit Form Name And Icon'
      },
      copy: {
        templateUrl: '/templates/reporter/layout/reportSettingsModal.htm',
        title: 'Edit Form Name And Icon'
      },
      create: { options: { ui: { title: 'Create Decision Table', showIcon: true, showFormType: false } } }
    };
    /// CONFIG
    // BASE
    var dt = { pageTitle: '', pageIcon: 'fa-table', serviceName: 'decisionTableService', serviceCollectionName: 'dts', dialogs: dialogs, routes: { builder: 'root.admin.designDmnDtDef', cards: 'root.admin.dmnDtList' } };
    var dtBaseModuleConfig = { viewKey: 'dt', pageModule: 'dmn', dt: dt };
    // DT
    var dtCardsViewConfig = _.cloneDeep(dtBaseModuleConfig);
    var dtBuilderViewConfig = _.cloneDeep(dtBaseModuleConfig);
    dtCardsViewConfig.dt.pageTitle = 'DMN - Decision Tables';
    dtBuilderViewConfig.dt.pageTitle = 'DMN - Decision Table Builder: ';
    /// END - CONFIG
    angular.module('odin.dmn', ['ui.bootstrap', 'agGrid', 'ngDraggable', 'ui.select', 'ngSanitize'])
      .config(['$stateProvider',
        function reporterModuleConfig($stateProvider) {
          $stateProvider
            .state(dtBaseModuleConfig.dt.routes.cards, {
              url: '/dmn/dt',
              controller: 'CardsController',
              templateUrl: '/templates/dmn/layout/cards.htm',
              controllerAs: 'ctrl',
              data: { viewConfig: dtCardsViewConfig }
            })
            .state(dtBaseModuleConfig.dt.routes.builder, {
              url: '/dmn/dt/:id/builder',
              controller: 'BuilderController',
              templateUrl: '/templates/dmn/layout/builder.htm',
              controllerAs: 'ctrl',
              data: { viewConfig: dtBuilderViewConfig }
              // resolve: {
              //   dmnDef: ['$stateParams', function($stateParams) {
              //     return {
              //       id: $stateParams.id,
              //       statusId: 4,
              //       type: 1,
              //       name: 'Test DMN',
              //       icon: 'fa-rocket',
              //       inputs: [],
              //       outputs: []
              //     };
              //   }]/*['$stateParams' ,'PermissionsEnforcer', 'ReporterService', function($stateParams, PermissionsEnforcer, ReporterService) {
              //     return PermissionsEnforcer.watch( ReporterService.getDefinition($stateParams.id) );
              //   }]*/
              // }
            }); /*
           .state('root.viewReport', {
           url: '/reports/:id',
           controller: 'ReportsViewerController',
           templateUrl: '/templates/reporter/layout/reportViewer.htm',
           resolve: {
           reportDef: ['$stateParams' ,'PermissionsEnforcer', 'ReporterService', function($stateParams, PermissionsEnforcer, ReporterService) {
           return PermissionsEnforcer.watch( ReporterService.getDefinition($stateParams.id) );
           }],
           selectView: ['$stateParams' ,'PermissionsEnforcer', 'ReporterService', function($stateParams) {
           if($stateParams.selectCollection) {
           return {
           selectCollection: $stateParams.selectCollection,
           detailFilter: $stateParams.detailFilter || [],
           facetFilter: $stateParams.facetFilter || []
           };
           }
           else {
           return null;
           }
           }]
           },
           params: {
           selectCollection: null,
           detailFilter: null,
           facetFilter: null
           }
           });*/
        }
      ]);
  })();
  
},{"lodash":18}],10:[function(require,module,exports){
  "use strict";
  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
  var __assign = (this && this.__assign) || Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
  Object.defineProperty(exports, "__esModule", { value: true });
  var _sh = require("../services/dmnSharedInterfaces");
  var _ = require("lodash");
  var ApiCollRead = (function () {
    function ApiCollRead(dsh, entity, classId) {
      var _this = this;
      this.dsh = dsh;
      this.entity = entity;
      this.classId = classId;
      this.optsDefault = { cache: true };
      // --- cached from server results to local
      this.saveAllLocal = function (ents) {
        var me = _this;
        // me.arr.length = 0;Object.keys(this.dic).map(key=>delete this.dic[key]);
        // Array.prototype.push.apply(me.arr, ents);
        ents.map(function (ent) { return _this.saveLocal(ent); });
        return me.arr;
      };
      this.saveLocal = function (ent) {
        if (!_this.dic[ent.id]) {
          ent.dirty = 0;
          _this.delLocal(ent.id); // cleaning reenforcement
          _this.arr.push(ent);
          return _this.$q.when(_this.dic[ent.id] = ent);
        }
        else {
          var oent_1 = _this.dic[ent.id];
          return oent_1.translator.fromDto(ent.translator.toDto(), false)
            .then(function () {
              ent.id = -1;
              ent.dispose();
              oent_1.dirty = 0;
              return oent_1;
            });
        }
      };
      this.delLocal = function (id) {
        if (_this.dic[id]) {
          _this.arr.splice(_.findIndex(_this.arr, function (it) { return it.id === id; }), 1);
          _this.dic[id].id = -1;
          _this.dic[id].dispose();
          delete _this.dic[id];
        }
      };
      this.getLocal = function (id) {
        return _this.dic[id];
      };
      ///---
      this.dic = {};
      this.arr = [];
      this.$q = dsh.$q;
      this.findOneProm = this.$q.when(true);
      this.api = dsh.apiService.getInstance(this.classId, this.entity);
    }
    ApiCollRead.prototype.init = function () { };
    ApiCollRead.prototype.findOne = function (id, opts) {
      var _this = this;
      opts = __assign({}, this.optsDefault, opts);
      return this.findOneProm.then(function () {
        if (opts && opts.cache)
          if (_this.getLocal(id))
            return _this.getLocal(id);
        return _this.findOneProm = _this.api.findOne(id, opts).then(function (ent) { return _this.saveLocal(ent); });
      });
    };
    ;
    ApiCollRead.prototype.find = function (opts) {
      opts = __assign({}, this.optsDefault, opts);
      var me = this;
      if ((opts && opts.cache) && me.arr && me.arr.length > 0)
        return me.$q.when(me.arr); // TODO better cache is need it
      return me.api.find(opts).then(function (ents) {
        return me.saveAllLocal(ents);
      });
    };
    ;
    return ApiCollRead;
  }());
  exports.ApiCollRead = ApiCollRead;
  var ApiColl = (function (_super) {
    __extends(ApiColl, _super);
    function ApiColl() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    ApiColl.prototype.create = function (nent) {
      var _this = this;
      var prom = this.$q.when(nent);
      if (!nent.translator) {
        prom = this.entity.getNew().then(function (res) { res.name = nent.name; res.icon = nent.icon; return res; }); // TODO full merge pending, need to creeate from translator dto / other dto
        // throw new Error('translator not available, ApiColl not correctly initiated, entity is missing or doesnt have translator.');
      }
      return prom.then(function (ent) {
        ent.id = -1;
        ent.name = ent.name || 'no name';
        ent.icon = ent.icon || 'fa-cogs';
        ent['statusId'] = _this.dsh.apiService.OdinConfig.status.draft;
        return _this.api.create(ent).then(function (ndt) { return _this.saveLocal(ndt); });
      });
    };
    ApiColl.prototype.update = function (ent) {
      return this.api.update(ent, { reload: false })
        .then(function () { ent.dirty = 0; return ent; }); // .then((ndt) => this.saveLocal(ndt)); //
    };
    ApiColl.prototype.deleteOne = function (id) {
      var _this = this;
      return this.api.deleteOne(id).then(function () { return _this.delLocal(id); }).then(function () { return { status: 'ok' }; });
    };
    ;
    ApiColl.prototype.cloneOne = function (id, entProps) {
      var _this = this;
      return this.findOne(id).then(function (ent) {
        return ent.clone().then(function (nent) {
          _.merge(nent, entProps); /// { ...(<any>ent), ...entProps }
          return _this.create(nent);
        });
      });
    };
    ApiColl.prototype.save = function (id) {
      var _this = this;
      var me = this;
      var ent = this.dic[id];
      if (!ent)
        throw new Error("save error: invalid id (" + id + ")");
      return this.update(ent)
        .catch(function (err) {
          return me.findOne(id, { cache: false })
            .then(function (ent) {
              ent.emitChange({ ty: _sh.EmitSharedType.reload });
              return _this.$q.reject({ ok: false, status: _sh.ResultStatusType.reloaded, ent: ent });
            });
        });
      ;
    };
    return ApiColl;
  }(ApiCollRead));
  exports.ApiColl = ApiColl;
  
},{"../services/dmnSharedInterfaces":15,"lodash":18}],11:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var _sh = require("../services/dmnSharedInterfaces");
  var ApiService = (function () {
    function ApiService($q, $http, paths, CacheFactory, OdinConfig, $log) {
      this.$q = $q;
      this.$http = $http;
      this.paths = paths;
      this.CacheFactory = CacheFactory;
      this.OdinConfig = OdinConfig;
      this.$log = $log;
    }
    ApiService.prototype.getInstance = function (classId, entity) {
      return new ApiHelper(classId, entity, this.$q, this.$http, this.paths, this.CacheFactory, this.OdinConfig, this.$log);
    };
    return ApiService;
  }());
  exports.ApiService = ApiService;
  (function () {
    /*jshint esnext:true */
    'use strict';
    angular.module('odin.dmn').service('apiService', ['$q', '$http', 'paths', 'CacheFactory', 'OdinConfig', '$log', ApiService
    ]);
  })();
  var httpMethod;
  (function (httpMethod) {
    httpMethod[httpMethod["put"] = 0] = "put";
    httpMethod[httpMethod["post"] = 1] = "post";
    httpMethod[httpMethod["delete"] = 2] = "delete";
    httpMethod[httpMethod["get"] = 3] = "get";
  })(httpMethod || (httpMethod = {}));
  var ApiHelper = (function () {
    function ApiHelper(classId, entity, $q, $http, paths, CacheFactory, OdinConfig, $log) {
      var _this = this;
      this.classId = classId;
      this.entity = entity;
      this.$q = $q;
      this.$http = $http;
      this.paths = paths;
      this.CacheFactory = CacheFactory;
      this.OdinConfig = OdinConfig;
      this.$log = $log;
      this.update = function (item, opts) {
        if (opts === void 0) { opts = { reload: false }; }
        return _this.call(httpMethod.put, item, opts);
      };
      this.create = function (item) { return _this.call(httpMethod.post, item); };
      this.deleteOne = function (id) { return _this.call(httpMethod.delete, { id: id }); };
      this.findOne = function (id, opts) { return _this.call(httpMethod.get, { id: id }); };
      this.find = function (opts) { return _this.call(httpMethod.get, [], opts); };
      this.cloneOne = function (id, entProps) { throw new Error('Implemented at ApiColl Class'); };
      this.save = function (id, entProps) { throw new Error('Implemented at ApiColl Class'); };
      this.call = function (meth, item, opts) {
        var me = _this;
        var dto = null;
        if (!(meth === httpMethod.get || meth === httpMethod.delete)) {
          dto = item.translator.toDto();
        }
        // return me.$httpFake({
        return me.$http({
          url: _this.getHttpPath(meth, item),
          method: httpMethod[meth],
          // headers: me.defaultHeaders,
          data: dto
        }).then(function (res) { return me.parseResult(meth, res, opts); })
          .catch(me.parseError);
      };
      this.parseResult = function (meth, res, opts) {
        // TODO check what needs to be cached
        var ent = res.data.response;
        switch (meth) {
          case httpMethod.put:
            if (!(opts && opts.reload))
              return; // only saving as default, reloading when opts.reload = true
          case httpMethod.post:
          case httpMethod.get:
            if (ent instanceof Array) {
              var ents = ent;
              if (opts.filter && opts.filter.select) {
                var filter_1 = opts.filter;
                ents = ents.map(function (ent) {
                  var nent = {};
                  Object.keys(filter_1.select).map(function (prop) { return nent[prop] = ent[prop]; }); // TODO only filtering first level selection, need deep map;
                  return nent;
                });
              }
              ;
              return _this.$q.all(ents.map(function (ent) {
                return _this.entity.translator.fromDto(ent, true).then(function (ent1) { ent1.dirty = 0; return ent1; });
              }));
            }
            else {
              return _this.entity.translator.fromDto(ent, true).then(function (ent1) { ent1.dirty = 0; return ent1; });
            }
          default:
            break;
        }
      };
      this.parseError = function (error) {
        _this.$log.debug(error);
        throw error;
      };
      this.getHttpPath = function (meth, item) {
        var clinfo = _sh.ClassIdInfo[_this.classId];
        var pmk = clinfo.module;
        var pathKey = clinfo.path;
        var path = pmk && _this.paths[pmk] ? _this.paths[pmk][pathKey] : null;
        var url = path ? path.definition() : clinfo.url;
        if (meth === httpMethod.put || meth === httpMethod.delete || meth === httpMethod.get) {
          if (item instanceof Array) {
            if (meth !== httpMethod.get)
              throw new Error('bulk ' + httpMethod[meth] + ' not implemented');
          }
          else {
            url = url + '/' + item.id;
          }
        }
        return url;
      };
    }
    return ApiHelper;
  }());
  exports.ApiHelper = ApiHelper;
  
},{"../services/dmnSharedInterfaces":15}],12:[function(require,module,exports){
  "use strict";
  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var _sh = require("../services/sharedInterfaces");
  var _ = require("lodash");
  var DataSourceHelper = (function () {
    // static $inject: Array<string> = [];
    function DataSourceHelper($q, $timeout, DataSourceServiceV2, FieldService, $rootScope, DataSourceService, apiService, $log) {
      'ngInject';
      var _this = this;
      this.$q = $q;
      this.$timeout = $timeout;
      this.DataSourceServiceV2 = DataSourceServiceV2;
      this.FieldService = FieldService;
      this.$rootScope = $rootScope;
      this.DataSourceService = DataSourceService;
      this.apiService = apiService;
      this.$log = $log;
      this.refreshFields = function (allFields) {
        var dss = _.uniq(allFields.map(function (v) { return { dsTyId: _this.getDSTypeFromFieldS(v), dsId: v.dsId }; }), function (v) { return v.dsId + ':' + v.dsTyId; });
        var dssv2 = dss.map(function (ds) { return { dataSourceId: ds.dsId, dsTypeId: ds.dsTyId }; });
        return _this.initDs(dssv2);
      };
      this.getFieldIdWDs = function (field) {
        return field.id + ':' + field.dsId;
      };
      this.getField = function (compoFieldId) {
        var fld = _this.DataSourceServiceV2.getField(compoFieldId);
        fld.sourceField = fld.sourceField || {};
        // fld.sourceField.dsTypeId = parseInt(compoFieldId.split(':')[1]); // TODO disabled until fix getfield / fld.sourceField.dsTypeId || parseInt(compoFieldId.split(':')[1]); // HOT FIX
        return fld;
      };
      this.getFieldSelector = function (field) {
        var me = _this;
        var fl = new _sh.FieldSelector();
        fl.id = me.FieldService.getCompositeId(field.sourceField);
        fl.dsId = field.sourceField.dataSourceId;
        return fl;
      };
      this.getDSTypeFromFieldS = function (field) {
        return parseInt(field.id.split(':')[1]);
      };
      this.getFieldDefer = function (compoFieldId) {
        if (!compoFieldId)
          return;
        var fldid = compoFieldId.split(':');
        if (fldid.length < 2)
          throw new Error('fieldId is not valid, please review ');
        var sourceField = { sourceFieldId: fldid[0], dsTypeId: fldid[1] };
        return this.DataSourceServiceV2.getDeferredField(sourceField).catch(function (err) {
          debugger;
          throw err;
        });
      };
      this.lookupKeys = {};
      this.lookupRelationshipKeys = function (instanceId, compoFieldId) {
        var me = _this;
        if (me.lookupKeys[compoFieldId] && me.lookupKeys[compoFieldId][instanceId])
          return _this.$q.when(me.lookupKeys[compoFieldId][instanceId]);
        return _this.DataSourceServiceV2.lookupRelationshipKeys(instanceId, compoFieldId)
          .then(function (result) {
            var keyField = result.instFields[0];
            me.lookupKeys[compoFieldId] = me.lookupKeys[compoFieldId] || {};
            return me.lookupKeys[compoFieldId][instanceId] = keyField ? keyField.fieldValue : '';
          });
      };
      this.initDataSourceTypes = function () {
        var me = _this;
        if (me.flatDataSourcesWithType)
          return me.$q.when(_this.flatDataSourcesWithType);
        return _this.DataSourceServiceV2.getDataSourcesWithTypes() // http get
          .then(function (result) {
            var flat = _.sortBy(result.response, function (item) {
              return item.name.toLowerCase();
            });
            var dataSourceOptions = [];
            _.forEach(flat, function (ds) {
              _.forEach(ds.dataSourceTypes, function (type) {
                var ftype = {};
                ftype.name = (type.name === 'No Type') ? ds.name : type.name;
                ftype.dsName = ds.name;
                ftype.dsTypeId = type.id;
                ftype.uniqueId = ds.id + '_' + type.id;
                ftype.dataSourceId = ds.id;
                dataSourceOptions.push(ftype);
              });
            });
            return me.flatDataSourcesWithType = dataSourceOptions;
          });
      };
      this.getFlatDataSourcesWithTypes = function (fields, flatDSWithType) {
        if (flatDSWithType === void 0) { flatDSWithType = null; }
        var me = _this;
        flatDSWithType = flatDSWithType || me.flatDataSourcesWithType;
        if (!flatDSWithType)
          throw new Error('flatDataSourcesWithType is missing.');
        // let dss = (<any>_.uniq)(fields, (fld) => fld.dsId).map(fld => fld.dsId);
        var dupflat = [];
        fields.map(function (field) {
          var dsopts = flatDSWithType.filter(function (dsopts) { return dsopts.dataSourceId === field.dsId && dsopts.dsTypeId === me.getDSTypeFromFieldS(field); });
          if (!(dsopts.length === 1)) {
            console.error('datasource duplication, pls check');
          }
          dupflat.push(dsopts[0]);
        });
        return _.uniq(dupflat);
      };
      this.getDatasourceFields = function (dataSourceList, formTypeId) {
        var me = _this;
        return me.initDs(dataSourceList).then(function (dss) {
          // let dss: sh.DataSourceTypesV2[] = result.dataSourceTypes;
          return _.map(dss, function (dsType) {
            var groupedFields = me.filterAndGroupInputOptions(dsType.ddList, dsType.type, formTypeId);
            dsType['groupedFields'] = groupedFields;
            // dsType.type //
            return dsType;
          });
        })
          .catch(function (err) {
            debugger;
            throw err;
          });
      };
      this.initDs = function (dssv2) {
        return _this.DataSourceServiceV2.initDataSources(dssv2)
          .then(function (res) {
            var dst = res.dataSourceTypes;
            dst.map(function (ds) { return ds.type.uniqueId = ds.type.dataSourceId + '_' + ds.type.id; }); // add uniqueId
            return dst;
          })
          .catch(function (err) {
            debugger;
            throw err;
          });
      };
      this.filterAndGroupInputOptions = function (ddList, dsType, formTypeId) {
        var groupedFields = _.groupBy(ddList, function (field) {
          return field.widget.widgetCategoryTypeName;
        });
        return groupedFields;
      };
      this.getDateRangeString = function (fromTime, toTime, format) {
        return _this.FieldService.getDateRangeString(fromTime, toTime, format);
      };
      this._promColl = {};
      // get proces defs
      this.getAllProcessDefs = function () { return _this.getDefsByProp('getAllProcessDefs', new ProcessDefs(_this)); };
      // get task defs
      this.getAllTaskDefs = function () { return _this.getDefsByProp('getAllTaskDefs', new TaskDefs(_this)); };
    }
    DataSourceHelper.prototype.getDefsByProp = function (def, entity) {
      var _this = this;
      if (this._promColl[def])
        return this._promColl[def];
      return this._promColl[def] = this.DataSourceService[def]().then(function (response) {
        var coll = new _sh.GenericMemColl(_this, entity);
        return _this._promColl[def] = coll.addFromDtos(response.data.response).then(function () { return coll; });
      });
    };
    return DataSourceHelper;
  }());
  exports.DataSourceHelper = DataSourceHelper;
  var ProcessDefsDto = (function () {
    function ProcessDefsDto() {
    }
    return ProcessDefsDto;
  }());
  exports.ProcessDefsDto = ProcessDefsDto;
  var ProcessDefs = (function (_super) {
    __extends(ProcessDefs, _super);
    function ProcessDefs() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.__classId = _sh.ClassId.ProcessDef;
      _this.translator = {
        toDto: function () { return null; },
        fromDto: function (dto) {
          var dtp = new ProcessDefs(_this.dsh);
          _.merge(dtp, dto);
          dtp.id = dto.processDefinitionKey; //  dto.processDefId;
          dtp.name = dtp.name.replace('.bpmn20.xml', '');
          return _this.$q.when(dtp);
        }
      };
      return _this;
    }
    ProcessDefs.prototype.getNew = function () { return this.$q.when(new ProcessDefs(this.dsh)); };
    return ProcessDefs;
  }(_sh.EntityDef));
  exports.ProcessDefs = ProcessDefs;
  var TaskDefs = (function (_super) {
    __extends(TaskDefs, _super);
    function TaskDefs() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.__classId = _sh.ClassId.ProcessDef;
      _this.translator = {
        toDto: function () { return null; },
        fromDto: function (dto) {
          var dtp = new TaskDefs(_this.dsh);
          _.merge(dtp, dto);
          return _this.$q.when(dtp);
        }
      };
      return _this;
    }
    TaskDefs.prototype.getNew = function () { return this.$q.when(new TaskDefs(this.dsh)); };
    return TaskDefs;
  }(_sh.EntityDef));
  exports.TaskDefs = TaskDefs;
  (function () {
    /*jshint esnext:true */
    'use strict';
    angular.module('odin.dmn').service('dataSourceHelper', ['$q', '$timeout', 'DataSourceServiceV2', 'FieldService', '$rootScope', 'DataSourceService', 'apiService', '$log', DataSourceHelper
    ]);
  })();
  
},{"../services/sharedInterfaces":17,"lodash":18}],13:[function(require,module,exports){
  "use strict";
  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
  Object.defineProperty(exports, "__esModule", { value: true });
// import * as _sh from '../services/dmnSharedInterfaces';
  var _sh = require("../services/dmnSharedInterfaces");
  var _ = require("lodash");
  var expression_1 = require("./expression");
  var DecisionTable = (function (_super) {
    __extends(DecisionTable, _super);
    function DecisionTable(dsh) {
      var _this = _super.call(this, dsh) || this;
      _this.__classId = _sh.ClassId.DecisionTable;
      _this.hitPolicy = _sh.DecisionTableHitPolicy.Unique;
      _this.fields = { inputs: [], outputs: [] }; // string[]; //
      _this.getAllFields = function () {
        return DecisionTable.getAllFields(_this.fields);
      };
      _this.getTypeRef = function (field) { return _this.translator.getTypeRef(field); };
      _this.ready = false;
      _this.init = function () {
        if (_this.ready)
          return _this.$q.when(_this);
        _this.dirty = -1; // disabled til 0
        _this.rules = new _sh.GenericMemColl(_this.dsh, new _sh.DecisionTableRule(_this.dsh));
        _this.translator = new DecisionTableTranslator(_this.dsh, _this);
        return _this.refreshFields().then(function () {
          _this.startWatchers();
          _this.ready = true;
          return _this;
        });
      };
      _this.stopWatchers = function () {
        if (_this.wchin)
          _this.wchin();
        if (_this.wchout)
          _this.wchout();
        if (_this.wchrules)
          _this.wchrules();
        if (_this.wchprops)
          _this.wchrules();
      };
      _this.startWatchers = function () {
        var me = _this;
        me.stopWatchers();
        var wchinIni = true;
        _this.wchin = _this.rs.$watchCollection(function () { return _this.fields.inputs; }, function (nv, ov) {
          if (wchinIni) {
            _this.dsh.$timeout(function () { return wchinIni = false; });
          }
          else {
            me.refreshFieldsDics(_sh.DecisionTableFieldPropType.inputEntries);
            _this.refreshAllRulesEntries(_sh.DecisionTableFieldPropType.inputEntries);
          }
        });
        var wchoutIni = true;
        _this.wchout = _this.rs.$watchCollection(function () { return _this.fields.outputs; }, function () {
          if (wchoutIni) {
            _this.dsh.$timeout(function () { return wchoutIni = false; });
          }
          else {
            me.refreshFieldsDics(_sh.DecisionTableFieldPropType.outputEntries);
            _this.refreshAllRulesEntries(_sh.DecisionTableFieldPropType.outputEntries);
          }
        });
        var wchrulesIni = true;
        _this.wchrules = _this.rs.$watchCollection(function () { return _this.rules.arr; }, function (nv, ov) {
          if (wchrulesIni) {
            _this.dsh.$timeout(function () { return wchrulesIni = false; });
          }
          else {
            _this.markDirty({ ty: _sh.EmitSharedType.change, locs: [_sh.EmitDmnLocations.rules] });
          }
          ;
        });
        var wchpropsIni = true;
        var groupProps = ['name', 'icon', 'hitPolicy'];
        _this.wchprops = _this.rs.$watchGroup(groupProps.map(function (p) { return (function () { return _this[p]; }); }), function (nv, ov) {
          if (wchpropsIni) {
            _this.dsh.$timeout(function () { return wchpropsIni = false; });
          }
          else {
            _this.markDirty({ ty: _sh.EmitSharedType.dontEmit, locs: groupProps });
          }
        });
      };
      _this.fieldsByFldId = { inputs: {}, outputs: {} }; // field.id (is not id:dsTypeId)
      _this.refreshFields = function () {
        var me = _this;
        // refreshing DataSourceServiceV2 fields cache
        var allFields = _this.getAllFields();
        return _this.dsh.refreshFields(_this.getAllFields()).then(function () { return allFields; });
      };
      _this.refreshFieldsDics = function (ty) {
        var me = _this;
        var fldskey = _sh.DecisionTableFieldPropType.inputEntries ? 'inputs' : 'outputs';
        _this.fieldsByFldId[fldskey] = _.groupBy(me.fields[fldskey], function (fld) { return fld.id.split(':')[0]; });
      };
      _this.getFieldsByIdAndInOut = function (compositeId, ty) {
        var fldskey = ty === _sh.DecisionTableFieldPropType.inputEntries ? 'inputs' : 'outputs';
        var fldid = compositeId.split(':')[0];
        var flddic = _this.fieldsByFldId[fldskey];
        if (flddic) {
          return flddic[fldid];
        }
        return null;
      };
      _this.pushRule = function (id) {
        var me = _this;
        var rix = (id >= 0 ? id : _this.rules.nextId());
        return _this.rules.create(rix).then(function (rule) {
          var proms = [];
          rule.outputEntries = {};
          rule.inputEntries = {};
          rule.description = new DescriptionEntry(me);
          proms.push(_this.refreshEntries(rule, rix, _sh.DecisionTableFieldPropType.inputEntries));
          proms.push(_this.refreshEntries(rule, rix, _sh.DecisionTableFieldPropType.outputEntries));
          return me.$q.all(proms).then(function () { return rule; });
        });
      };
      _this.refreshAllRulesEntries = function (ty) {
        return _this.$q.all(_this.rules.arr.map(function (rule, rix) { return _this.refreshEntries(rule, rix, ty); })).then(function (res) { return _this.markDirty({ ty: _sh.EmitDmnLocations.rules, locs: [_sh.EmitDmnLocations.rules] }); });
      };
      _this.refreshEntries = function (rule, rix, ty) {
        var proms = [];
        var fldkey, rulekey;
        if (ty === _sh.DecisionTableFieldPropType.inputEntries) {
          fldkey = 'inputs';
          rulekey = 'inputEntries';
        }
        else if (ty === _sh.DecisionTableFieldPropType.outputEntries) {
          fldkey = 'outputs';
          rulekey = 'outputEntries';
        }
        else {
          throw new Error('refresh entries type not valid');
        }
        var entries = rule[rulekey];
        var flds = _this.fields[fldkey];
        Object.keys(entries).map(function (fldid) {
          if (!flds.some(function (fld) { return fld.id === fldid; }))
            delete entries[fldid];
        });
        flds.map(function (field) {
          if (entries[field.id])
            return _this.$q.when(true); // already exists
          var prom = _this.createDTEE(field.id, rix, ty)
            .then(function (ie) {
              entries[field.id] = ie;
            });
          proms.push(prom);
        });
        return _this.$q.all(proms);
      };
      _this.createDTEE = function (fieldId, ruleIx, prop) {
        var me = _this;
        var ectx = new _sh.EntryContext(me, me.id, fieldId, ruleIx, prop, null, null);
        var exp = new expression_1.Expression(ectx, me.dsh);
        return exp.init().then(function () { return new _sh.DecisionTableEntryExpression(exp); });
      };
      _this.getCellEntry = function (ruleIx, fieldId, prop) {
        if (prop !== _sh.DecisionTableFieldPropType.description) {
          return _this.rules.arr[ruleIx][prop][fieldId];
        }
        return _this.rules.arr[ruleIx][prop];
      };
      // copy column feel/descrition value to other rules
      _this.bulkUpdate = function (rid, rulesIx, cid, ty) {
        if (rulesIx.length === 0)
          return false;
        var proms = [];
        if (ty !== _sh.DecisionTableFieldPropType.description) {
          var currentry_1 = _this.getCellEntry(rid, cid, ty);
          rulesIx.map(function (ix) {
            var entry = _this.getCellEntry(ix, cid, ty);
            if (entry.expression) {
              entry.expression.feel = currentry_1.expression.feel;
            }
          });
        }
        else {
          var currentry_2 = _this.getCellEntry(rid, cid, ty);
          rulesIx.map(function (ix) {
            var entry = _this.getCellEntry(ix, cid, ty);
            entry.v = currentry_2.v;
          });
        }
        return true;
      };
      _this.rs = dsh.$rootScope;
      _this.init();
      return _this;
    }
    DecisionTable.prototype.getNew = function () {
      var dt = new DecisionTable(this.dsh);
      return dt.init().then(function () { return dt; });
    };
    Object.defineProperty(DecisionTable.prototype, "name", {
      get: function () { return this._name; },
      set: function (val) { this._name = val; },
      enumerable: true,
      configurable: true
    });
    ;
    DecisionTable.prototype.dispose = function () {
      this.stopWatchers();
    };
    return DecisionTable;
  }(_sh.EntityDef));
  DecisionTable.getAllFields = function (fields) {
    return fields.inputs.concat(fields.outputs);
  };
  exports.DecisionTable = DecisionTable;
  var DtEmitType;
  (function (DtEmitType) {
    DtEmitType[DtEmitType["fields"] = 0] = "fields";
    DtEmitType[DtEmitType["rules"] = 1] = "rules";
    DtEmitType[DtEmitType["all"] = 2] = "all";
  })(DtEmitType || (DtEmitType = {}));
  ;
  var DecisionTableTranslator = (function () {
    function DecisionTableTranslator(dsh, dt) {
      if (dt === void 0) { dt = null; }
      var _this = this;
      this.dsh = dsh;
      this.dt = dt;
      this.toDto = function () {
        // dt = dt || this.dt; // dt: _sh.IDecisionTable = null
        if (!_this.dt)
          throw new Error('Translation error. Decision table needs to be passed from parameter or from property.');
        var dt = _this.dt;
        _this.validateFEModel();
        _this.BEModel = {
          id: dt.id, icon: dt.icon, name: dt.name, roles: dt.roles, statusId: dt.statusId,
          modifiedTs: dt.modifiedTs,
          decision: {
            hitPolicy: dt.hitPolicy, aggOp: dt.aggOp,
            inputs: dt.fields.inputs.map(function (v) { return _this.refreshBEModelgetInput(v); }),
            outputs: dt.fields.outputs.map(function (v) { return _this.refreshBEModelgetOutput(v); }),
            rules: dt.rules.arr.map(function (r) { return _this.refreshBEModelgetRule(r, dt); })
          }
        };
        return _this.BEModel;
      };
      this.fromDto = function (bedt, createNew) {
        var dt = createNew ? new DecisionTable(_this.dsh) : _this.dt;
        if (!createNew)
          _this.dt.ready = false;
        // ----
        dt.dirty = -1;
        dt.id = bedt.id;
        dt.name = bedt.name;
        dt.icon = bedt.icon;
        dt.statusId = bedt.statusId;
        dt.roles = bedt.roles;
        dt.modifiedTs = bedt.modifiedTs;
        if (!bedt.decision) {
          return _this.$q.when(dt);
        }
        else {
          dt.aggOp = bedt.decision.aggOp;
          dt.hitPolicy = bedt.decision.hitPolicy;
          dt.fields.inputs.length = 0;
          dt.fields.outputs.length = 0;
          ['inputs', 'outputs'].map(function (key) { return dt.fields[key] = bedt.decision[key].map(function (it) { return { id: it.sourceFieldId + ':' + it.dsTypeId, dsId: it.dataSourceId }; }); });
          return dt.init().then(function () {
            _this.dt.ready = false;
            var proms = bedt.decision.rules.map(function (ber) {
              return dt.pushRule(ber.id).then(function (rule) {
                rule.description.v = ber.description;
                _this.validateRuleBE2FE(ber, dt);
                var proms1 = ber.inputEntries.map(function (ie, ix) {
                  var id = dt.fields.inputs[ix].id;
                  // rule.inputEntries[id].expression.feel = this.unwrapCDATA(ie.text);
                  return rule.inputEntries[id].expression.init(_this.unwrapCDATA(ie.text));
                });
                var proms2 = ber.outputEntries.map(function (ie, ix) {
                  var id = dt.fields.outputs[ix].id;
                  // rule.outputEntries[id].expression.feel = this.unwrapCDATA(ie.text); 
                  return rule.outputEntries[id].expression.init(_this.unwrapCDATA(ie.text));
                });
                return _this.$q.all(proms1.concat(proms2));
              });
            });
            // dt.rules =  bedt.decision.rules;
            return dt.$q.all(proms).then(function () { _this.dt.ready = true; dt.dirty = 0; return dt; });
          });
        }
      };
      this.refreshBEModelgetInput = function (it) {
        var field = _this.dsh.getField(it.id);
        return { label: field.name, dataSourceId: it.dsId, dsTypeId: _this.dsh.getDSTypeFromFieldS(it), sourceFieldId: field.id, text: 'TBD', typeRef: _this.getTypeRef(field) };
      };
      this.refreshBEModelgetOutput = function (it) {
        var field = _this.dsh.getField(it.id);
        return { label: field.name, dataSourceId: it.dsId, dsTypeId: _this.dsh.getDSTypeFromFieldS(it), sourceFieldId: field.id, name: 'TBD', typeRef: _this.getTypeRef(field) };
      };
      this.getTypeRef = function (field) {
        // TODO complex/more granual transformation is pending
        var wtyn = _sh.widgetTypeId[field.widget.widgetCategoryTypeId];
        var ec = _sh.expressionConfByWidgetTypeName;
        var tref = ec[wtyn] && ec[wtyn].typeRef !== undefined ? ec[wtyn].typeRef : ec.default.typeRef;
        //  _sh.expressionConfByWidgetTypeId[wty].typeRef;
        if (tref === _sh.TypeRef.unknown) {
          debugger;
        }
        else {
          return tref;
        }
      };
      this.refreshBEModelgetRule = function (r, dt) {
        _this.validateRuleFE2BE(r, dt);
        var inent = Object.keys(r.inputEntries).map(function (key) {
          return { text: _this.wrapCDATA(r.inputEntries[key].expression.feel.toString()) };
        });
        var outent = Object.keys(r.outputEntries).map(function (key) {
          return { text: _this.wrapCDATA(r.outputEntries[key].expression.feel.toString()) };
        });
        return { description: r.description.v, id: r.id, inputEntries: inent, outputEntries: outent };
      };
      this.wrapCDATA = function (val) {
        if (val.match(/\W/)) {
          val = "<![CDATA[" + val + "]]>";
        }
        return val;
      };
      this.unwrapCDATA = function (val) {
        var ix;
        var pre = '<![CDATA[';
        var post = ']]>';
        if (val.indexOf(pre) > -1) {
          val = val.replace(pre, '').replace(post, '');
        }
        return val;
      };
      // validations
      this.validateFEModel = function () {
        var rules = _this.dt.rules.arr;
        if (_.uniq(rules, function (r) { return r.id; }).length !== rules.length)
          throw new Error('DT validation error, rules with duplicated ids.');
      };
      // validate rule BE -> FE
      this.validateRuleBE2FE = function (r, dt) {
        if (r.inputEntries.length !== dt.fields.inputs.length) {
          throw new Error('inputs entries and fields collections length dont match.');
        }
        if (r.outputEntries.length !== dt.fields.outputs.length) {
          throw new Error('outputs entries and fields collections length dont match.');
        }
      };
      // validate rule FE -> BE
      this.validateRuleFE2BE = function (r, dt) {
        if (Object.keys(r.inputEntries).length !== dt.fields.inputs.length) {
          throw new Error('inputs entries and fields collections length dont match.');
        }
        if (Object.keys(r.outputEntries).length !== dt.fields.outputs.length) {
          throw new Error('outputs entries and fields collections length dont match.');
        }
      };
      this.$q = dsh.$q;
    }
    return DecisionTableTranslator;
  }());
  var DescriptionEntry = (function () {
    function DescriptionEntry(dt) {
      this.dt = dt;
      this._v = '';
    }
    Object.defineProperty(DescriptionEntry.prototype, "v", {
      get: function () { return this._v; },
      set: function (val) { if (this._v === val)
        return; this._v = val; this.dt.markDirty({ ty: _sh.EmitSharedType.dontEmit }); },
      enumerable: true,
      configurable: true
    });
    return DescriptionEntry;
  }());
  
},{"../services/dmnSharedInterfaces":15,"./expression":16,"lodash":18}],14:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var _sh = require("../services/dmnSharedInterfaces");
  var decisionTable_1 = require("./decisionTable");
  var decisionTable_2 = require("./decisionTable");
  exports.DecisionTable = decisionTable_2.DecisionTable;
  var apiColl_1 = require("./apiColl");
  (function () {
    /*jshint esnext:true */
    'use strict';
    angular.module('odin.dmn').factory('decisionTableService', ['dataSourceHelper', 'apiService',
      function (dataSourceHelper, apiService) {
        var svc = new DecisionTableService(dataSourceHelper, apiService);
        svc.init();
        return svc;
      }
    ]);
  })();
  var DecisionTableService = (function () {
    function DecisionTableService(dsh, apiService) {
      var _this = this;
      this.dsh = dsh;
      this.apiService = apiService;
      this.init = function () {
        _this.ready = true;
        return _this.$q.when(_this);
      };
      this.dts = new apiColl_1.ApiColl(dsh, new decisionTable_1.DecisionTable(dsh), _sh.ClassId.DecisionTable);
      this.$q = this.dsh.$q;
      this.ready = false;
    }
    return DecisionTableService;
  }());
  exports.DecisionTableService = DecisionTableService;
  
},{"../services/dmnSharedInterfaces":15,"./apiColl":10,"./decisionTable":13}],15:[function(require,module,exports){
  "use strict";
  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
  var __assign = (this && this.__assign) || Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
  function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
  Object.defineProperty(exports, "__esModule", { value: true });
  var _sh = require("../services/sharedInterfaces");
// export { Expression } from './expression';
  __export(require("../services/sharedInterfaces"));
  exports.OperatorTypeMap = new Map([['equals', '='], ['isNot', '!='], ['greaterThan', '>'], ['lessThan', '<'], ['greaterOrEqualThan', '>='], ['lessOrEqualThan', '<='], ['range', 'in']]);
  (function () {
    var rmap = [];
    exports.OperatorTypeMap.forEach(function (k, v) { rmap.push([k, v]); });
    exports.OperatorTypeMapReverse = new Map(rmap);
  })();
  exports.TypeRef = _sh.strEnum(['string', 'boolean', 'integer', 'long', 'double', 'date', 'unknown']);
  exports.OperatorType = _sh.strEnum(['equals', 'isNot', 'greaterThan', 'lessThan', 'greaterOrEqualThan', 'lessOrEqualThan', 'range']);
// export const WidgetType = _sh.strEnum(['Dates', 'Lists', 'Mobile', 'Other', 'Calculation', 'Relationships', 'System', 'Text', 'Values', 'range', 'Organization Relationships']);
// export type WidgetType = keyof typeof WidgetType;
  var WidgetModelConfIt = (function () {
    function WidgetModelConfIt() {
    }
    return WidgetModelConfIt;
  }());
  exports.WidgetModelConfIt = WidgetModelConfIt;
  exports.widgetModelConf = {
    default: { opts: true, valueIsArr: false },
    radiogroup: { opts: false, valueIsArr: true }, checkboxgroup: { opts: false, valueIsArr: true },
    multiSelect: { opts: false, valueIsArr: true }, trueFalse: { opts: false, valueIsArr: true },
    range: { opts: false }, slider: { opts: false }, dialog: { opts: false }, roleLookup: { opts: false }
  };
  var ExpressionModelConfWTyIt = (function () {
    function ExpressionModelConfWTyIt() {
    }
    return ExpressionModelConfWTyIt;
  }());
  exports.ExpressionModelConfWTyIt = ExpressionModelConfWTyIt;
  exports.expressionConfByWidgetTypeName = {
    default: { range: false, typeRef: exports.TypeRef.string, keys: false },
    Dates: { range: true, typeRef: exports.TypeRef.date },
    Values: { range: true, typeRef: exports.TypeRef.double },
    Calculation: { typeRef: exports.TypeRef.double },
    Lists: { keys: true },
    Relationships: { keys: true },
    System: { keys: true }
  };
  Object.keys(_sh.widgetsKeys).map(function (k) { return exports.widgetModelConf[k] = __assign({}, exports.widgetModelConf.default, exports.widgetModelConf[k]); });
  Object.keys(_sh.widgetTypeIdKeys).map(function (k) { return exports.expressionConfByWidgetTypeName[k] = __assign({}, exports.expressionConfByWidgetTypeName.default, exports.expressionConfByWidgetTypeName[k]); });
  var FieldInOutSelector = (function () {
    function FieldInOutSelector() {
    }
    return FieldInOutSelector;
  }());
  exports.FieldInOutSelector = FieldInOutSelector;
  ;
  var DecisionTableField = (function (_super) {
    __extends(DecisionTableField, _super);
    function DecisionTableField() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return DecisionTableField;
  }(_sh.FieldSelector));
  exports.DecisionTableField = DecisionTableField;
  var DecisionTableRule = (function (_super) {
    __extends(DecisionTableRule, _super);
    function DecisionTableRule() {
      var _this = _super !== null && _super.apply(this, arguments) || this;
      _this.__classId = 'DecisionTableRule';
      return _this;
    }
    DecisionTableRule.prototype.getNew = function () { return this.$q.when(new DecisionTableRule(this.dsh)); };
    return DecisionTableRule;
  }(_sh.EntityDef));
  exports.DecisionTableRule = DecisionTableRule;
  var Field = (function (_super) {
    __extends(Field, _super);
    function Field() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return Field;
  }(_sh.BaseEntity));
  var DecisionTableEntryDescription = (function () {
    function DecisionTableEntryDescription() {
    }
    return DecisionTableEntryDescription;
  }());
  exports.DecisionTableEntryDescription = DecisionTableEntryDescription;
  var DecisionTableEntryExpression = (function () {
    function DecisionTableEntryExpression(expression) {
      this.expression = expression;
    }
    return DecisionTableEntryExpression;
  }());
  exports.DecisionTableEntryExpression = DecisionTableEntryExpression;
  var EntryContext = (function () {
    function EntryContext(dt, dtId, fieldId, ruleIx, prop, eleId, entry) {
      this.dt = dt;
      this.dtId = dtId;
      this.fieldId = fieldId;
      this.ruleIx = ruleIx;
      this.prop = prop;
      this.eleId = eleId;
      this.entry = entry;
    }
    return EntryContext;
  }());
  exports.EntryContext = EntryContext;
// type DecisionTableHitPolicy = "Unique" | "First" | "Priority" | "Any" | "Collect" | "RuleOrder" | "OutputOrder";
// const DecisionTableHitPolicy = sh.strEnum(['Unique', 'First', 'Priority', 'Any', 'Collect', 'RuleOrder', 'OutputOrder']);
// type DecisionTableHitPolicy = keyof typeof DecisionTableHitPolicy;
  var DecisionTableHitPolicy;
  (function (DecisionTableHitPolicy) {
    DecisionTableHitPolicy[DecisionTableHitPolicy["Unique"] = 1] = "Unique";
    DecisionTableHitPolicy[DecisionTableHitPolicy["Any"] = 2] = "Any";
    DecisionTableHitPolicy[DecisionTableHitPolicy["First"] = 3] = "First";
    DecisionTableHitPolicy[DecisionTableHitPolicy["RuleOrder"] = 4] = "RuleOrder";
    DecisionTableHitPolicy[DecisionTableHitPolicy["Collect"] = 5] = "Collect";
  })(DecisionTableHitPolicy = exports.DecisionTableHitPolicy || (exports.DecisionTableHitPolicy = {})); // not supported by camunda , Priority = 6, OutputOrder = 7 }
  var DecisionTableHitPolicyAggr;
  (function (DecisionTableHitPolicyAggr) {
    DecisionTableHitPolicyAggr[DecisionTableHitPolicyAggr["Sum"] = 1] = "Sum";
    DecisionTableHitPolicyAggr[DecisionTableHitPolicyAggr["Min"] = 2] = "Min";
    DecisionTableHitPolicyAggr[DecisionTableHitPolicyAggr["Max"] = 3] = "Max";
    DecisionTableHitPolicyAggr[DecisionTableHitPolicyAggr["Count"] = 4] = "Count";
  })(DecisionTableHitPolicyAggr = exports.DecisionTableHitPolicyAggr || (exports.DecisionTableHitPolicyAggr = {}));
  var DecisionTableEntryType = _sh.strEnum(['range', 'literal', 'boolean']);
  exports.DecisionTableFieldPropType = _sh.strEnum(['inputEntries', 'outputEntries', 'description']);
  exports.EmitDmnLocations = _sh.strEnum(['rules', 'name', 'icon']);
////////////////////////// 
  
},{"../services/sharedInterfaces":17}],16:[function(require,module,exports){
  "use strict";
  Object.defineProperty(exports, "__esModule", { value: true });
  var _sh = require("../services/dmnSharedInterfaces");
  var dmnSharedInterfaces_1 = require("../services/dmnSharedInterfaces");
  var dmnSharedInterfaces_2 = require("../services/dmnSharedInterfaces");
  var _ = require("lodash");
  var $q = null;
  angular.module('odin.dmn').run(['$q', function ($$q) {
    $q = $$q;
  }]);
  var Expression = (function () {
    function Expression(entryContext, dsh) {
      var _this = this;
      this.entryContext = entryContext;
      this.dsh = dsh;
      this.optsDefault = ['equals']; // , 'list'
      this.optsRange = ['greaterThan', 'lessThan', 'greaterOrEqualThan', 'lessOrEqualThan', 'range'];
      this.init = function (feel) {
        if (!feel && _this.ready)
          return $q.resolve(true);
        return _this.dsh.getFieldDefer(_this.entryContext.fieldId).then(function (field) {
          if (!field) {
            throw new Error('field need to be cached before using it inside expression');
          }
          _this.lookupKeys = {};
          _this.field = field;
          _this.meta = {};
          var wk = _sh.widgets[_this.field.widget.id];
          wk = wk || 'default';
          var cfgByW = _sh.widgetModelConf[wk];
          _this.meta.modelMultiValue = cfgByW.opts;
          _this.meta.isArrayInValueType = cfgByW.valueIsArr;
          var wtyk = _sh.widgetTypeId[_this.field.widget.widgetCategoryTypeId];
          var cfgByWTy = _sh.expressionConfByWidgetTypeName[wtyk];
          _this.meta.range = cfgByWTy.range;
          _this.meta.useKeys = cfgByWTy.keys;
          // options
          if (field.widget.id === _sh.widgets.trueFalse) {
            field.ddEntry.options.optionsList = [{ id: 'True', name: 'True', nameAlias: '' }, { id: 'False', name: 'False', nameAlias: '' },];
            field.ddEntry.options.entryMethod = 'input';
          }
          _this.meta.isFieldOptionsType = _this.meta.isArrayInValueType || _this.field.ddEntry.options && _this.field.ddEntry.options.optionsList && _this.field.ddEntry.options.optionsList.length > 0;
          // end options
          _this.meta.needsQuotes = [_sh.TypeRef.string, _sh.TypeRef.date].some(function (ty) { return ty === _this.typeRef; });
          // this.useKeys = this.wTypesWKeys.some(ty => ty === this.field.widget.widgetCategoryTypeId);
          _this.model = ExpressionChangeHandler.getModel(_this, _this.refreshFeelAfterModelChange);
          if (field.widget.id === _sh.widgets.range) {
            _this.meta.operators = [_sh.OperatorType.range];
          }
          else {
            _this.meta.operators = _this.optsDefault;
            if (_this.meta.range)
              _this.meta.operators = _this.meta.operators.concat(_this.optsRange);
          }
          _this._operatorId = _this.meta.operators[0];
          // operator change listener. TODO convert to proxy to avoid dirty checking
          // if (this.wchOper) { this.wchOper() };
          // this.wchOper = this.dsh.$rootScope.$watch(() => this.operatorId, (newoper, oldoper) => { this.fixModelAfterOperatorChanges(newoper, oldoper); });
          // if (this.wchNot) { this.wchNot() };
          // this.wchNot = this.dsh.$rootScope.$watch(() => this.operatorIsNot, (newoper, oldoper) => { this.setFeelFromModel(); });
          _this.clean();
          _this.ready = true;
          var proms = [];
          if (_this.fieldType === dmnSharedInterfaces_2.ddTypes.process) {
            proms.push(_this.dsh.getAllProcessDefs().then(function (procs) { return _this.collProcess = procs; }));
          }
          else if (_this.fieldType === dmnSharedInterfaces_2.ddTypes.task) {
            proms.push(_this.dsh.getAllTaskDefs().then(function (procs) { return _this.collTasks = procs; }));
          }
          // update feel on first load
          if (feel) {
            _this.setModelFromFeel(feel, false);
            proms.push(_this.setFeelFromModel());
          }
          return $q.all(proms).then(function () { return true; });
        });
      };
      this.refreshFeelAfterModelChange = function (cFD, lvl, op, target, property, value, receiver) {
        if (cFD)
          return; // skips if is changed thru feel property, check if this refresh was requested while changing feel directly, skipped if tru to avoid looping model-feel change detections
        _this.$log.debug('refresh feel');
        _this.setFeelFromModel();
        // // this.$log.debug('refresh: %o', { lvl, op, target, property, value, receiver });
      };
      this.cleanModelAfterChange = function () {
        var me = _this;
        var m = me.model;
        if (me._operatorId === dmnSharedInterfaces_1.OperatorType.range) {
          if (!(me.model.length === 1 && (me.model[0].from !== undefined || me.model[0].to !== undefined))) {
            me.model.length = 1;
            me.model[0] = { from: undefined, to: undefined };
          }
        }
        else {
          // clean range props
          if (me.model[0] && (me.model[0].from !== undefined || me.model[0].to !== undefined)) {
            me.model[0] = { value: '' };
          }
          // force equals when list/multi options
          if (m.length >= 2) {
            me._operatorId = dmnSharedInterfaces_1.OperatorType.equals;
          }
        }
      };
      this.getFeelValue = function (val, isUiFeel) {
        // if (this.fieldType === ddTypes.bool || typeof (val) === 'boolean') return val.toString();
        if (typeof val === 'number')
          val = '' + val;
        return (isUiFeel ? _this.getUiFeelValue(val) : _this.getBEFeelValue(val));
      };
      this.getUiFeelValue = function (value) {
        var me = _this;
        var feelv = value;
        // Process Selector
        if (_this.fieldType === dmnSharedInterfaces_2.ddTypes.process) {
          var proc = _this.collProcess.dic[value];
          feelv = (!proc) ? '' : proc.name;
        }
        else if (_this.fieldType === dmnSharedInterfaces_2.ddTypes.task) {
          var proc = _this.collTasks.dic[value];
          feelv = (!proc) ? '' : proc.name;
        }
        else if (me.meta.isFieldOptionsType) {
          // transform ids to values
          var optionsList = _this.field.ddEntry.options.optionsList;
          var parsedValue = _.find(optionsList, function (option) { return option.id + '' === value || option.uuid + '' === value; });
          if (parsedValue) {
            feelv = parsedValue.name || parsedValue.label || parsedValue.alias;
          }
        }
        else if (_this.field.widget.widgetCategoryTypeId === 7) {
          // If this is a lookup field, we need to grab the keys
          var fid = _this.entryContext.fieldId;
          var iid = value; // instanceId;
          if (me.dsh.lookupKeys[fid] && me.dsh.lookupKeys[fid][iid]) {
            feelv = me.dsh.lookupKeys[fid][iid];
          }
          else {
            // changing feel value outside call stack
            feelv = '';
            if (parseInt(iid) > 0) {
              feelv = _this.dsh.lookupRelationshipKeys(iid, fid).then(function (fv) {
                _this.setFeelFromModel();
                return _this.feelV;
              });
            }
            else {
              _this.$log.debug('Expression, invalid instanceId for lookup', iid);
            }
          }
        }
        if (!feelv || (typeof feelv !== 'string' && !feelv.then)) {
          _this.$log.debug('Expression feel value must be string or promise<string>');
          feelv = ''; // auto hot fix
        }
        return feelv;
      };
      this.getBEFeelValue = function (val) {
        if (_this.fieldType === dmnSharedInterfaces_2.ddTypes.process) {
          var proc = _this.collProcess.dic[val];
          if (!proc)
            val = '';
        }
        else if (_this.fieldType === dmnSharedInterfaces_2.ddTypes.task) {
          var proc = _this.collTasks.dic[val];
          if (!proc)
            val = '';
        }
        if (typeof (val) !== 'string')
          return val;
        return _this.wrapQuotes(val);
      };
      this.wrapQuotes = function (val) {
        if (_this.meta.needsQuotes && val) {
          return "\"" + val + "\"";
        }
        ;
        return val;
      };
      this.unwrapQuotes = function (val) {
        if (_this.meta.needsQuotes && val) {
          return val.split('"').join('');
        }
        ;
        return val;
      };
      this.lookList = function (itArr, searchIn, prefix, sufix) {
        if (prefix === void 0) { prefix = ''; }
        if (sufix === void 0) { sufix = ''; }
        var resix = -1;
        var res;
        if (!_this.isNumeric(searchIn))
          res = _.find(itArr, function (it, ix) { resix = ix; return searchIn.search(prefix + it + sufix) === 0; });
        // let anyoper = '^(' + operArr.join('|') + ')'
        return { it: res, ix: res ? resix : -1 };
      };
      this.isId = function (val) {
        return (/^[0-9A-F]{8}-[0-9A-F]{4}-/i.test(val));
      };
      this.isNumeric = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      };
      this.isUtc = function (val) {
        return (/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$/i.test(val));
      };
      this.cFD = false; // change feel directly
      // get type(): _sh.WidgetType { return <any>this.field.widget.widgetCategoryTypeName; } // expression type / TODO pending remapping
      // get getOperators(): oper[] {
      //     if (!this.field) return null;
      //     return _sh.operatorsCategories[this.type].operators;
      // }
      this.aCFD = [];
      this.clean = function () {
        var me = _this;
        me.skipModelListener();
        if (_this.model)
          _this.model.length = 0;
        me._feel = '';
        me._feelV = '';
        _this._operatorIsNot = false;
        var val = {};
        // if (me.field.widget.id === _sh.widgets.range) {
        //     // val = { value: '' };
        //     let r = me.field.ddEntry.formatting.range;
        //     val = { from: r.from, to: r.to };
        //     // me.field.ddEntry.formatting.value = val.value;
        //     // val = { value:  me.field.ddEntry.formatting['value'] };
        //     // val = { value: '4;4'};
        // }
        _this.model.push(val);
        me.restoreModelListener();
      };
      this.addOption = function () {
        _this.model.push({ value: null });
      };
      this.removeOption = function (index) {
        _this.model.splice(index, 1);
      };
      this.$log = dsh.$log;
      this.init();
    }
    ;
    Expression.prototype.setFeelFromModel = function () {
      var me = this;
      me.skipModelListener();
      me.cleanModelAfterChange();
      var arr;
      try {
        if (me.meta.isArrayInValueType && this.model.length >= 0) {
          arr = this.model[0].value.map(function (v) { return { value: v }; });
        }
        else {
          arr = this.model.filter(function (it) { return Object.keys(it).length > 0; }); // filter empty items
        }
        this._feelV = this.generateFeelString(arr, true);
        this._feel = this.generateFeelString(arr);
        this.entryContext.dt.markDirty({ ty: _sh.EmitSharedType.dontEmit, locs: ['expression'] });
      }
      catch (err) {
        this._feel = this._feelV = '';
        me.$log.debug(err);
      }
      me.enableModelListener();
    };
    // https://docs.camunda.org/manual/7.4/reference/dmn11/feel/language-elements
    Expression.prototype.generateFeelString = function (arr, isUiFeel) {
      var _this = this;
      if (isUiFeel === void 0) { isUiFeel = false; }
      var feel = '';
      var me = this;
      if (arr.length === 0) {
        feel = '';
      }
      else if (arr.length === 1) {
        var it = arr[0];
        if (this.operatorId === dmnSharedInterfaces_1.OperatorType.range) {
          switch (me.field.widget.widgetCategoryTypeId) {
            case _sh.widgetTypeId.Values:
              feel = '';
              // format number ranges
              var from = (it.from === undefined) ? '' : it.from;
              var to = (it.to === undefined) ? '' : it.to;
              if (to !== '' || from !== '')
                feel = from + '...' + to;
              break;
            case _sh.widgetTypeId.Dates:
              // format dates
              feel = this.dsh.getDateRangeString(it.from, it.to, this.field.ddEntry.formatting.dimension);
              break;
            default:
          }
          if (feel && feel !== '') {
            feel = '[' + feel + ']';
          }
          // }
        }
        else {
          feel = this.getFeelValue(it.value, isUiFeel);
        }
        if (feel !== '' && this.operatorId !== dmnSharedInterfaces_1.OperatorType.equals && this.operatorId !== dmnSharedInterfaces_1.OperatorType.range) {
          var foper = _sh.OperatorTypeMap['get'](this.operatorId);
          feel = foper + ' ' + feel;
        }
      }
      else {
        feel = this.getFeelValue(arr[0].value, isUiFeel); // checking if is a prom
        var fn_1 = function (vals) {
          feel = vals.join(',');
          if (isUiFeel) {
            feel = '[' + feel + ']';
          }
          return feel;
        };
        // call strings or promises.
        var gets = arr.map(function (it) { return _this.getFeelValue(it.value, isUiFeel); });
        if (typeof gets[0] === 'string') {
          feel = fn_1(gets);
        }
        else {
          feel = this.dsh.$q.all(gets).then(function (vals) {
            return fn_1(vals);
          });
        }
        // end call string or promises
      }
      if (feel !== '' && me.operatorIsNot) {
        // if () { me.operatorIsNot = false; }
        // else {
        feel = 'not(' + feel + ')';
        // }
      }
      return feel;
    };
    Object.defineProperty(Expression.prototype, "fieldType", {
      get: function () {
        return this.field.ddEntry.ddTypeId;
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Expression.prototype, "typeRef", {
      // useKeys: boolean;
      get: function () { return this.entryContext.dt.getTypeRef(this.field); },
      enumerable: true,
      configurable: true
    });
    ;
    Expression.prototype.setModelFromFeel = function (feel, isUIFeel) {
      var _this = this;
      if (isUIFeel === void 0) { isUIFeel = false; }
      var me = this;
      me.skipModelListener();
      var model = [];
      if (isUIFeel)
        throw new Error('Feel from uiFeel not implemented.');
      try {
        feel = feel || '';
        /// not
        var nix = feel.indexOf('not(');
        if (me._operatorIsNot = (nix >= 0)) {
          feel = feel.substring(nix + 4, feel.lastIndexOf(')'));
        }
        // TODO == replace for regex
        var isList = feel.indexOf(',') > 0; // feel.indexOf && 
        if (isList || me.meta.isFieldOptionsType) {
          // list
          var arr = feel.split(',');
          this._operatorId = dmnSharedInterfaces_1.OperatorType.equals; // oper.list;
          if (me.meta.isArrayInValueType) {
            model.length = 0;
            model.push({ value: [] });
            Array.prototype.push.apply(model[0].value, arr);
          }
          else {
            Array.prototype.push.apply(model, arr.map(function (v) { return { value: v }; }));
          }
        }
        else {
          var itArr = ['\\=', '<=', '<', '>', '>=', '\\[', '\\(']; // 2 char oper should be always before their 1 char --> .sort(v => - v.length);
          var res = this.lookList(itArr, feel, '^');
          if (res.ix >= 0) {
            // has oper
            var op = res.it;
            if (op === '\\[' || op === '\\(') {
              // braket
              var inclLeft = op === '\\[';
              var inclRight = true;
              var ix = feel.indexOf(']', 1);
              var ix1 = feel.indexOf(')', 1);
              if (ix1 > -1) {
                ix = ix1;
                inclRight = false;
              }
              var content = feel.substr(1, ix - 1);
              var arr = void 0;
              if ((ix = content.indexOf('...')) > -1) {
                // range
                arr = content.split('...');
                model[0] = { from: +arr[0], to: +arr[1] };
                this._operatorId = dmnSharedInterfaces_1.OperatorType.range;
              }
              else {
                // throw new Error('Expression conversion error.');
                this.$log.debug('Expression conversion error, range with invalid content.');
              }
              // this.$log.debug('Expression conversion error, range not implemented yet.');
            }
            else {
              // arithmetic opers
              this._operatorId = _sh.OperatorTypeMapReverse['get'](op.replace('\\', ''));
              model = [{ value: feel.substring(op.length) }];
            }
          }
          else {
            // single
            this._operatorId = dmnSharedInterfaces_1.OperatorType.equals;
            model = [{ value: feel }];
          }
        }
        // quotes handling
        if (me.meta.needsQuotes) {
          if (me.meta.isArrayInValueType) {
            if (model.length > 0)
              model[0].value = model[0].value.map(function (o, ix) { return _this.unwrapQuotes(o); });
          }
          else {
            model = model.map(function (o) { ['value', 'from', 'to'].map(function (att) { return o[att] = _this.unwrapQuotes(o[att]); }); return o; });
          }
        }
        //
        if (model.length > 0) {
          // check type and convert
          // TODO use this.field type instead of isNumeric
          if (this.isNumeric(model[0].value)) {
            // numeric type
            model.map(function (v) { v.value = +v.value; });
          }
        }
        // if (this.fieldType === ddTypes.bool) {
        //     model.map((m) => m.value = (m.value === 'true' ? true : false));
        // }
        if (this.model.length > 0)
          this.model.length = 0;
        Array.prototype.push.apply(this.model, model); // copy internal model to obj model
        if (this.model) {
          this.setFeelFromModel();
        } // after model recreation reparse feel
      }
      catch (err) {
        me.$log.debug(err);
      }
      ;
      me.enableModelListener();
      return model;
    };
    Object.defineProperty(Expression.prototype, "feel", {
      get: function () { return this._feel; },
      set: function (val) { this.setModelFromFeel('' + val); },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Expression.prototype, "feelV", {
      get: function () { return this._feelV; },
      set: function (val) { this.setModelFromFeel(val, true); },
      enumerable: true,
      configurable: true
    });
    ;
    ;
    ////
    Expression.prototype.transformValuesToIds = function (values) {
      // transform ids to values
      var ids = values;
      return ids; // TODO
    };
    Object.defineProperty(Expression.prototype, "operatorId", {
      get: function () {
        return this._operatorId;
      },
      set: function (val) {
        var poper = this._operatorId;
        this._operatorId = val;
        this.setFeelFromModel();
      },
      enumerable: true,
      configurable: true
    });
    ;
    Object.defineProperty(Expression.prototype, "operatorIsNot", {
      get: function () {
        return this._operatorIsNot;
      },
      set: function (val) {
        this._operatorIsNot = val;
        this.setFeelFromModel();
      },
      enumerable: true,
      configurable: true
    });
    Object.defineProperty(Expression.prototype, "wTyN", {
      get: function () { return this.field.widget.widgetCategoryTypeName; },
      enumerable: true,
      configurable: true
    });
    Expression.prototype.skipModelListener = function () {
      this.aCFD.push(this.cFD);
      this.cFD = true;
    };
    ;
    Expression.prototype.restoreModelListener = function () {
      this.cFD = this.aCFD.length > 0 ? this.aCFD.pop() : false;
    };
    ;
    Expression.prototype.enableModelListener = function () {
      this.aCFD = [];
      this.cFD = false;
    };
    ;
    Object.defineProperty(Expression.prototype, "json", {
      get: function () {
        return {
          model: this.model, operatorId: this.operatorId, not: this.operatorIsNot, feel: this.feel, feelV: this.feelV, fieldId: this.entryContext.fieldId,
          // widgetId: this.field.widget.id,
          // widgetTypeId: this.field.widget.widgetCategoryTypeId,
          // widgetCategoryTypeName: this.field.widget.widgetCategoryTypeName,
          ddTypeId: this.field.ddEntry.ddTypeId,
          widget: this.field.widget
        };
      },
      enumerable: true,
      configurable: true
    });
    return Expression;
  }());
  exports.Expression = Expression;
// export const OperatorTypeMap: { [key: string /*ComparisonsType*/]: string } = {
//     'equals': '=', 'is not': '!=', 'greater than': '>', 'less than': '<', 'greater or equal than': '>=', 'less or equal than': '<=', 'range': 'in'
// };
// hook array and then every prop on each property that is added, call fn per each change (add/del/chng)
  var timeoutId = null;
  var ExpressionChangeHandler = (function () {
    function ExpressionChangeHandler() {
    }
    return ExpressionChangeHandler;
  }());
  ExpressionChangeHandler.getModel = function (exp, fn) {
    // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    // http://stackoverflow.com/questions/5100376/how-to-watch-for-array-changes
    var arrayChangeHandler = {
      // get: function (target, property) {
      //     // this.$log.debug('getting ' + property + ' for ' + target);
      //     // property is index in this case
      //     return target[property];
      // }
      // apply: function (target, thisArg, argumentsList) {
      //     var args = Array.prototype.slice.call(arguments);
      //     // this.$log.debug('proxy -- apply target: %s args: %o ', target, args);
      //     return thisArg[target].apply(this, argumentsList);
      // },
      deleteProperty: function (target, property) {
        // this.$log.debug('proxy -- del prop: %s target: %o', property, target);
        // todo check if digest call is need it
        setTimeout(function () { fn(exp.cFD, 'arr', 'del', target, property, null, null); }, 0);
        return true;
      },
      set: function (target, property, value, receiver) {
        if (property !== 'length') {
          // this.$log.debug('proxy -- set %s value: %o target: %o receiver: %o', property, value, target, receiver);
          // // this.$log.debug(Array.prototype.slice.call(arguments));
          // hook inner property
          target[property] = new Proxy(value, propChangeHandler);
          fn(exp.cFD, 'arr', 'set', target, property, value, receiver);
        }
        else {
          target[property] = value;
        }
        return true;
      }
    };
    var propChangeHandler = {
      deleteProperty: function (target, property) {
        // this.$log.debug('proxy -- prop -- del prop: %s target: %o', property, target);
        fn(exp.cFD, 'prop', 'del', target, property, null, null);
        return true;
      },
      set: function (target, property, value, receiver) {
        if (property !== '$$hashKey') {
          // this.$log.debug('proxy -- prop -- set %s value: %o target: %o receiver: %o', property, value, target, receiver);
          target[property] = value;
          fn(exp.cFD, 'prop', 'set', target, property, value, receiver);
        }
        else {
          target[property] = value;
        }
        return true;
      }
    };
    return new Proxy([], arrayChangeHandler);
  };
  
},{"../services/dmnSharedInterfaces":15,"lodash":18}],17:[function(require,module,exports){
  "use strict";
  var __extends = (this && this.__extends) || (function () {
      var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
      return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var _ = require("lodash");
  exports.CollResultStatus = strEnum(['ok']);
  var CollFindOpts = (function () {
    function CollFindOpts() {
    }
    return CollFindOpts;
  }());
  exports.CollFindOpts = CollFindOpts;
  var CollFilterOpts = (function () {
    function CollFilterOpts() {
    }
    return CollFilterOpts;
  }());
  exports.CollFilterOpts = CollFilterOpts;
// TODO remove DT.url and move commonjs.paths w/ pathkey=decisiontables
  var ClassIdInfo = (function () {
    function ClassIdInfo() {
    }
    return ClassIdInfo;
  }());
  ClassIdInfo.DecisionTable = { module: 'dmn', path: 'decisiontables', url: '/api/workflows/decisiontables' };
  ClassIdInfo.ProcessDef = { module: 'global', path: 'TBD' };
  exports.ClassIdInfo = ClassIdInfo;
  ;
  exports.ClassId = strEnum(['DecisionTable', 'ProcessDef']);
  var BaseEntity = (function () {
    function BaseEntity() {
    }
    return BaseEntity;
  }());
  exports.BaseEntity = BaseEntity;
  var EntityDefDto = (function (_super) {
    __extends(EntityDefDto, _super);
    function EntityDefDto() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return EntityDefDto;
  }(BaseEntity));
  exports.EntityDefDto = EntityDefDto;
  var EntityDef = (function (_super) {
    __extends(EntityDef, _super);
    function EntityDef(dsh) {
      var _this = _super.call(this) || this;
      _this.dsh = dsh;
      _this.translator = {
        toDto: function () { return null; },
        fromDto: function (beModel) { throw new Error('translator -not implemented fromDto'); }
      };
      _this.emitChange = function (markInfo, emitCollListener) {
        if (emitCollListener === void 0) { emitCollListener = false; }
        var me = _this;
        var info = markInfo;
        info.class = _this.__classId;
        info.id = me.id;
        info.loc = info.locs && info.locs.length > 0 ? info.locs[0] : undefined;
        var entKey = _this.__classId + '-' + me.id;
        if (markInfo.ty !== exports.EmitSharedType.dontEmit) {
          me.$rootScope.$emit(entKey, info); // hood per id
          if (emitCollListener)
            me.$rootScope.$emit(_this.__classId, info); // hook global
          _this.$log.debug("emit " + (emitCollListener ? '- g ' : '') + "- " + entKey, markInfo);
        }
      };
      _this.markDirty = function (info) {
        /* dirty => 0>= #changes || -1=auto up disabled || -2=reactive after first change
         */
        var me = _this;
        if (me.dirty === -2)
          me.dirty = 1; // reactive autosave after first change, normally after failure
        if (me.dirty >= 0) {
          me.lastDirty = new Date();
          me.dirty++;
          me.emitChange(info);
        }
      };
      _this.$q = dsh.$q;
      _this.$rootScope = dsh.$rootScope;
      _this.$log = dsh.$log;
      return _this;
    }
    // abstract clone(): ng.IPromise<EntityDef>;
    EntityDef.prototype.clone = function () {
      return this.translator.fromDto(this.translator.toDto(), true);
    };
    ;
    EntityDef.prototype.dispose = function () { throw new Error('dispose -not implemented'); };
    return EntityDef;
  }(EntityDefDto));
  exports.EntityDef = EntityDef;
  ;
  ;
  ;
// export class BaseNamedEntity extends BaseEntity {
//   name: string;
// }
  var FieldSelector = (function (_super) {
    __extends(FieldSelector, _super);
    function FieldSelector() {
      return _super !== null && _super.apply(this, arguments) || this;
    }
    return FieldSelector;
  }(BaseEntity));
  exports.FieldSelector = FieldSelector;
// tcreator workaround pattern https://github.com/Microsoft/TypeScript/issues/2037
// export interface TCreator<T> { new (): T; }
  var GenericMemColl = (function () {
    function GenericMemColl(dsh, entity) {
      var _this = this;
      this.dsh = dsh;
      this.entity = entity;
      // get = (id: ID): T => this.dic[id]; // TODO api or cache dic
      this.arr = [];
      this.move = function (ixOri, ixDes) { var it = _this.arr.splice(ixOri, 1)[0]; _this.arr.splice(ixDes, 0, it); /* here could emit change */ };
      this.delByIxs = function (ixs) {
        _.sortBy(ixs, function (ix) { return ix; }).reverse().map(function (ix) {
          var it = _this.arr.splice(ix, 1)[0];
          if (it.id)
            delete _this.dic[it.id];
        });
      };
      this.IdisNumber = function () { _this.isNumber(_this.entity.id); };
      this.lastId = -1;
      this.nextId = function () {
        if (_this.IdisNumber) {
          _this.lastId = 1 + (_this.lastId >= 0 ? _this.lastId : _.reduce(_this.arr, function (max, cr) { return cr.id >= max ? cr.id : max; }, -1));
          return _this.lastId;
        }
        else {
          return _this.generateId();
        }
      };
      this.create = function (id) {
        if (id === void 0) { id = null; }
        id = id !== null ? id : _this.generateId();
        return _this.entity.getNew() // /* new this.tCreator();*/
          .then(function (it) { ; it.id = id; _this.add(it); return it; });
      };
      this.dic = {};
      this.addFromDtos = function (dtos) {
        var me = _this;
        return _this.$q.all((dtos).map(function (o) { return me.entity.translator.fromDto(o, true); }))
          .then(function (ents) { _this.add(ents); return ents; });
      };
      this.add = function (items) { if (items['length']) {
        Array.prototype.push.apply(_this.arr, items);
        items.map(function (it) { return _this.addToDic(it); });
      }
      else {
        var it = items;
        _this.arr.push(it);
        _this.addToDic(it);
      } };
      this.addToDic = function (it) {
        _this.dic[it.id] = it;
      };
      this.$q = dsh.$q;
    } // , private tCreator: TCreator<T>) { } // public $q: ng.IQService,
    GenericMemColl.prototype.findOne = function (id) { return this.$q.resolve(this.dic[id]); };
    ; // TODO api or cache dic
    GenericMemColl.prototype.del = function (id) { this.arr.splice(_.findIndex(this.arr, function (it) { return it.id === id; }), 1); delete this.dic[id]; };
    // delIds = (ids: string[]) => {
    //   this.arr.map((val, ix) => { if (ids.indexOf(val.id) > -1) { this.arr.splice(ix, 1); delete this.dic[val.id]; } }); /* here could emit change */
    // };
    GenericMemColl.prototype.isNumber = function (x) {
      return typeof x === 'number';
    };
    GenericMemColl.prototype.isString = function (x) {
      return typeof x === 'string';
    };
    GenericMemColl.prototype.generateId = function () {
      var d = Date.now();
      if (window.performance && typeof window.performance.now === 'function') {
        d += window.performance.now(); // use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    };
    return GenericMemColl;
  }());
  exports.GenericMemColl = GenericMemColl;
  /************************************************************************************************************/
// shared helpers https://basarat.gitbooks.io/typescript/content/docs/types/literal-types.html
  /** Utility function to create a K:V from a list of strings */
  function strEnum(o) {
    return o.reduce(function (res, key) {
      res[key] = key;
      return res;
    }, Object.create(null));
  }
  exports.strEnum = strEnum;
  ;
  exports.EmitSharedType = strEnum(['change', 'dontEmit', 'reload']);
// export class EmitSharedType { static change = 'chg'; static dontEmit = 'noemit'; static reload = 'rload'; }
  exports.ResultStatusType = strEnum(['reloaded', 'ok']);
//==========================
  var status;
  (function (status) {
    status[status["open"] = 1] = "open";
    status[status["processing"] = 2] = "processing";
    status[status["complete"] = 3] = "complete";
    status[status["published"] = 4] = "published";
    status[status["unpublished"] = 5] = "unpublished";
    status[status["archived"] = 6] = "archived";
    status[status["draft"] = 7] = "draft";
    status[status["error"] = -1] = "error";
  })(status = exports.status || (exports.status = {}));
  var taskStatus;
  (function (taskStatus) {
    taskStatus[taskStatus["suspend"] = 1] = "suspend";
    taskStatus[taskStatus["cancel"] = 2] = "cancel";
    taskStatus[taskStatus["open"] = 3] = "open";
    taskStatus[taskStatus["complete"] = 4] = "complete";
    taskStatus[taskStatus["error"] = -1] = "error";
  })(taskStatus = exports.taskStatus || (exports.taskStatus = {}));
// enum models { formDefToModel= 'formDefinitionToModel' }
  var ddTypes;
  (function (ddTypes) {
    ddTypes[ddTypes["siteStatus"] = 30] = "siteStatus";
    ddTypes[ddTypes["bool"] = 6] = "bool";
    ddTypes[ddTypes["relationship"] = 15] = "relationship";
    ddTypes[ddTypes["firstName"] = 18] = "firstName";
    ddTypes[ddTypes["lastName"] = 19] = "lastName";
    ddTypes[ddTypes["completed_on"] = 21] = "completed_on";
    ddTypes[ddTypes["orderId"] = 22] = "orderId";
    ddTypes[ddTypes["primaryEmail"] = 14] = "primaryEmail";
    ddTypes[ddTypes["completedBy"] = 23] = "completedBy";
    ddTypes[ddTypes["clientSubmit"] = 49] = "clientSubmit";
    ddTypes[ddTypes["profileImage"] = 33] = "profileImage";
    ddTypes[ddTypes["workflowStatus"] = 34] = "workflowStatus";
    ddTypes[ddTypes["key"] = 35] = "key";
    ddTypes[ddTypes["geolocation"] = 10] = "geolocation";
    ddTypes[ddTypes["userAssignment"] = 37] = "userAssignment";
    ddTypes[ddTypes["relationshipEntityParent"] = 40] = "relationshipEntityParent";
    ddTypes[ddTypes["relationshipOrgParent"] = 31] = "relationshipOrgParent";
    ////
    ddTypes[ddTypes["radio"] = 1] = "radio";
    ddTypes[ddTypes["process"] = 41] = "process";
    ddTypes[ddTypes["task"] = 43] = "task";
  })(ddTypes = exports.ddTypes || (exports.ddTypes = {}));
  /*
   widget : {
   domainDictionaryTypeId : 41 // === field.ddEntry.ddTypeId;
   id : 84
   name : "Process Name"
   template : "process-name"
   widgetCategoryTypeId : 8
   widgetCategoryTypeName : "System"
   }
   */
  var widgets;
  (function (widgets) {
    widgets[widgets["select"] = 1] = "select";
    widgets[widgets["selectAutocomplete"] = 25] = "selectAutocomplete";
    widgets[widgets["checkboxgroup"] = 9] = "checkboxgroup";
    widgets[widgets["radiogroup"] = 10] = "radiogroup";
    widgets[widgets["multiSelect"] = 33] = "multiSelect";
    widgets[widgets["datetime"] = 11] = "datetime";
    widgets[widgets["date"] = 12] = "date";
    widgets[widgets["time"] = 34] = "time";
    widgets[widgets["cycle"] = 43] = "cycle";
    widgets[widgets["textbox"] = 14] = "textbox";
    widgets[widgets["textarea"] = 15] = "textarea";
    widgets[widgets["formatted"] = 16] = "formatted";
    widgets[widgets["emailSingle"] = 17] = "emailSingle";
    widgets[widgets["phone"] = 18] = "phone";
    widgets[widgets["emailMultiple"] = 46] = "emailMultiple";
    widgets[widgets["range"] = 7] = "range";
    widgets[widgets["number"] = 19] = "number";
    widgets[widgets["url"] = 23] = "url";
    widgets[widgets["trueFalse"] = 24] = "trueFalse";
    widgets[widgets["upload"] = 26] = "upload";
    widgets[widgets["composite"] = 44] = "composite";
    widgets[widgets["datasourceRelationship"] = 35] = "datasourceRelationship";
    widgets[widgets["keyLookup"] = 37] = "keyLookup";
    widgets[widgets["roleLookup"] = 40] = "roleLookup";
    widgets[widgets["userAssignment"] = 50] = "userAssignment";
    widgets[widgets["dialog"] = 36] = "dialog";
    widgets[widgets["workflowStatus"] = 42] = "workflowStatus";
    widgets[widgets["triggerType"] = 45] = "triggerType";
    widgets[widgets["siteStatus"] = 51] = "siteStatus";
    widgets[widgets["taskName"] = 88] = "taskName";
    widgets[widgets["signature"] = 38] = "signature";
    widgets[widgets["imgGallery"] = 39] = "imgGallery";
    widgets[widgets["organizationRelationship"] = 41] = "organizationRelationship";
    widgets[widgets["processName"] = 84] = "processName";
    widgets[widgets["slider"] = -1] = "slider";
  })(widgets = exports.widgets || (exports.widgets = {}));
  var widgetTypeId;
  (function (widgetTypeId) {
    widgetTypeId[widgetTypeId["Lists"] = 1] = "Lists";
    widgetTypeId[widgetTypeId["Dates"] = 2] = "Dates";
    widgetTypeId[widgetTypeId["Text"] = 3] = "Text";
    widgetTypeId[widgetTypeId["Values"] = 4] = "Values";
    widgetTypeId[widgetTypeId["Other"] = 5] = "Other";
    widgetTypeId[widgetTypeId["Relationships"] = 7] = "Relationships";
    widgetTypeId[widgetTypeId["System"] = 8] = "System";
    widgetTypeId[widgetTypeId["Mobile"] = 9] = "Mobile";
    widgetTypeId[widgetTypeId["OrganizationRelationships"] = 10] = "OrganizationRelationships";
  })(widgetTypeId = exports.widgetTypeId || (exports.widgetTypeId = {}));
  ;
  exports.widgetsKeys = {}; // used to allow default per widget with all ids
  exports.widgetTypeIdKeys = {};
  Object.keys(widgets).filter(function (k) { return isNaN(parseInt(k)); }).map(function (k) { return exports.widgetsKeys[k] = {}; });
  Object.keys(widgetTypeId).filter(function (k) { return isNaN(parseInt(k)); }).map(function (k) { return exports.widgetTypeIdKeys[k] = {}; });
  /*
   ws = _.cloneDeep( _.sortBy( _.uniqBy(angular.element(document._getElementsByXPath('//*[@id="tabDataset"]/div/div/div/fields-selector-sidebar/div')).scope().loadedDataSourceTypes[0].ddList.map(function(f){ return f.widget}), function(w){ return w.id}),(function(w){ return w.widgetCategoryTypeId*1000+w.id})) )
   w id enums
   _.keyBy( ws, function(w){ return w.template.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }); })
   JSON.stringify(_.reduce(ws,function(pre,cur){ key = cur.template.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase()}); pre[key]=cur.id; return pre},{})).replace(/"/g,'').replace(/:/g,'=')
   w types
   _.reduce(_.uniqBy(ws.map(function(w){ return {ty:w.widgetCategoryTypeName, id:w.widgetCategoryTypeId }; }),function(w){ return w.id }),function(pre,cur){ pre[cur.ty]=cur.id; return pre},{})
   
   http://www.jsoneditoronline.org/?id=0cbf82c1c317385e4a172acdfa07cdea
   [
   {
   "id": 1,
   "name": "select",
   "widgetCategoryTypeId": 1,
   "widgetCategoryTypeName": "Lists",
   "template": "select-autocomplete",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 9,
   "name": "checkbox",
   "widgetCategoryTypeId": 1,
   "widgetCategoryTypeName": "Lists",
   "template": "checkboxgroup",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 10,
   "name": "radiobutton",
   "widgetCategoryTypeId": 1,
   "widgetCategoryTypeName": "Lists",
   "template": "radiogroup",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 25,
   "name": "auto-complete",
   "widgetCategoryTypeId": 1,
   "widgetCategoryTypeName": "Lists",
   " template": "select-autocomplete",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 33,
   "name": "multi-select",
   "widgetCategoryTypeId": 1,
   "widgetCategoryTypeName": "Lists",
   "template": "multi-select",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 11,
   "name": "datetime",
   "widgetCategoryTypeId": 2,
   "widgetCategoryTypeName": "Dates",
   "template": "datetime",
   "domainDictionaryTypeId": 5
   },
   {
   "id": 12,
   "name": "date",
   "widgetCategoryTypeId": 2,
   "widgetCategoryTypeName": "Dates",
   "template": "date",
   "domainDictionaryTypeId": 5
   },
   {
   "id": 34,
   "name": "time",
   "widgetCategoryTypeId": 2,
   "widgetCategoryTypeName": "Dates",
   "template": "time",
   "domainDictionaryTypeId": 12
   },
   {
   "id": 43,
   "name": "Cycle",
   "widgetCategoryTypeId": 2,
   "widgetCategoryTypeName": "Dates",
   "template": "cycle",
   "domainDictionaryTypeId": 12
   },
   {
   "id": 14,
   "name": "textbox",
   "widgetCategoryTypeId": 3,
   "widgetCategoryTypeName": "Text",
   "template": "textbox",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 15,
   "name": "textarea",
   "widgetCategoryTypeId": 3,
   "widgetCategoryTypeName": "Text",
   "template": "textarea",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 16,
   "name": "formatted text",
   "widgetCategoryTypeId": 3,
   "widgetCategoryTypeName": "Text",
   "template": "formatted",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 17,
   "name": "email - single",
   "widgetCategoryTypeId": 3,
   "widgetCategoryTypeName": "Text",
   "template": "email-single",
   "domainDictionaryTypeId": 14
   },
   {
   "id": 18,
   "name": "phone",
   "widgetCategoryTypeId": 3,
   "widgetCategoryTypeName": "Text",
   "template": "phone",
   "domainDictionaryTypeId": 26
   },
   {
   "id": 46,
   "name": "email - multiple",
   "widgetCategoryTypeId": 3,
   "widgetCategoryTypeName": "Text",
   "template": "email-multiple",
   "domainDictionaryTypeId": 24
   },
   {
   "id": 7,
   "name": "range",
   "widgetCategoryTypeId": 4,
   "widgetCategoryTypeName": "Values",
   "template": "range",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 19,
   "name": "number",
   "widgetCategoryTypeId": 4,
   "widgetCategoryTypeName": "Values",
   "template": "number",
   "domainDictionaryTypeId": 13
   },
   {
   "id": 23,
   "name": "url",
   "widgetCategoryTypeId": 5,
   "widgetCategoryTypeName": "Other",
   "template": "url",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 24,
   "name": "boolean",
   "widgetCategoryTypeId": 5,
   "widgetCategoryTypeName": "Other",
   "template": "true-false",
   "domainDictionaryTypeId": 6
   },
   {
   "id": 26,
   "name": "upload",
   "widgetCategoryTypeId": 5,
   "widgetCategoryTypeName": "Other",
   "template": "upload",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 44,
   "name": "composite",
   "widgetCategoryTypeId": 5,
   "widgetCategoryTypeName": "Other",
   "template": "composite",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 35,
   "name": "Datasource Relationship Type",
   "widgetCategoryTypeId": 7,
   "widgetCategoryTypeName": "Relationships",
   "template": "datasource-relationship",
   "domainDictionaryTypeId": 15
   },
   {
   "id": 37,
   "name": "Key Lookup",
   "widgetCategoryTypeId": 7,
   "widgetCategoryTypeName": "Relationships",
   "template": "key-lookup",
   "domainDictionaryTypeId": 12
   },
   {
   "id": 40,
   "name": "Role Lookup",
   "widgetCategoryTypeId": 7,
   "widgetCategoryTypeName": "Relationships",
   "template": "role-lookup",
   "domainDictionaryTypeId": 12
   },
   {
   "id": 50,
   "name": "User Assignment",
   "widgetCategoryTypeId": 7,
   "widgetCategoryTypeName": "Relationships",
   "template": "user-assignment",
   "domainDictionaryTypeId": 37
   },
   {
   "id": 36,
   "name": "Dialog",
   "widgetCategoryTypeId": 8,
   "widgetCategoryTypeName": "System",
   "template": "dialog",
   "domainDictionaryTypeId": 16
   },
   {
   "id": 42,
   "name": "workflow-status",
   "widgetCategoryTypeId": 8,
   "widgetCategoryTypeName": "System",
   "template": "workflow-status",
   "domainDictionaryTypeId": 12
   },
   {
   "id": 45,
   "name": "Trigger type",
   "widgetCategoryTypeId": 8,
   "widgetCategoryTypeName": "System",
   "template": "trigger-type",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 51,
   "name": "Site Status",
   "widgetCategoryTypeId": 8,
   "widgetCategoryTypeName": "System",
   "template": "site-status",
   "domainDictionaryTypeId": 30
   },
   {
   "id": 88,
   "name": "Task Name",
   "widgetCategoryTypeId": 8,
   "widgetCategoryTypeName": "System",
   "template": "task-name",
   "domainDictionaryTypeId": 43
   },
   {
   "id": 38,
   "name": "Signature",
   "widgetCategoryTypeId": 9,
   "widgetCategoryTypeName": "Mobile",
   "template": "signature",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 39,
   "name": "Image Gallery",
   "widgetCategoryTypeId": 9,
   "widgetCategoryTypeName": "Mobile",
   "template": "img-gallery",
   "domainDictionaryTypeId": 1
   },
   {
   "id": 41,
   "name": "Organization Relationship",
   "widgetCategoryTypeId": 10,
   "widgetCategoryTypeName": "Organization Relationships",
   "template": "organization-relationship",
   "domainDictionaryTypeId": 31
   },
   "widget": {
   "id": 84,
   "name": "Process Name",
   "widgetCategoryTypeId": 8,
   "widgetCategoryTypeName": "System",
   "template": "process-name",
   "domainDictionaryTypeId": 41
   }
   ]
   
   */
  var dataSourceActions;
  (function (dataSourceActions) {
    dataSourceActions[dataSourceActions["login"] = 1] = "login";
    dataSourceActions[dataSourceActions["entityTypes"] = 2] = "entityTypes";
  })(dataSourceActions = exports.dataSourceActions || (exports.dataSourceActions = {}));
  var formTypes;
  (function (formTypes) {
    formTypes[formTypes["general"] = 1] = "general";
    formTypes[formTypes["task"] = 2] = "task";
    formTypes[formTypes["workorder"] = 3] = "workorder";
  })(formTypes = exports.formTypes || (exports.formTypes = {}));
  
},{"lodash":18}],18:[function(require,module,exports){
  (function (global){
    /**
     * @license
     * lodash 3.10.1 (Custom Build) <https://lodash.com/>
     * Build: `lodash modern -d -o ./index.js`
     * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     * Available under MIT license <https://lodash.com/license>
     */
    ;(function() {
      
      /** Used as a safe reference for `undefined` in pre-ES5 environments. */
      var undefined;
      
      /** Used as the semantic version number. */
      var VERSION = '3.10.1';
      
      /** Used to compose bitmasks for wrapper metadata. */
      var BIND_FLAG = 1,
        BIND_KEY_FLAG = 2,
        CURRY_BOUND_FLAG = 4,
        CURRY_FLAG = 8,
        CURRY_RIGHT_FLAG = 16,
        PARTIAL_FLAG = 32,
        PARTIAL_RIGHT_FLAG = 64,
        ARY_FLAG = 128,
        REARG_FLAG = 256;
      
      /** Used as default options for `_.trunc`. */
      var DEFAULT_TRUNC_LENGTH = 30,
        DEFAULT_TRUNC_OMISSION = '...';
      
      /** Used to detect when a function becomes hot. */
      var HOT_COUNT = 150,
        HOT_SPAN = 16;
      
      /** Used as the size to enable large array optimizations. */
      var LARGE_ARRAY_SIZE = 200;
      
      /** Used to indicate the type of lazy iteratees. */
      var LAZY_FILTER_FLAG = 1,
        LAZY_MAP_FLAG = 2;
      
      /** Used as the `TypeError` message for "Functions" methods. */
      var FUNC_ERROR_TEXT = 'Expected a function';
      
      /** Used as the internal argument placeholder. */
      var PLACEHOLDER = '__lodash_placeholder__';
      
      /** `Object#toString` result references. */
      var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        weakMapTag = '[object WeakMap]';
      
      var arrayBufferTag = '[object ArrayBuffer]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';
      
      /** Used to match empty string literals in compiled template source. */
      var reEmptyStringLeading = /\b__p \+= '';/g,
        reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
        reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
      
      /** Used to match HTML entities and HTML characters. */
      var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
        reUnescapedHtml = /[&<>"'`]/g,
        reHasEscapedHtml = RegExp(reEscapedHtml.source),
        reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
      
      /** Used to match template delimiters. */
      var reEscape = /<%-([\s\S]+?)%>/g,
        reEvaluate = /<%([\s\S]+?)%>/g,
        reInterpolate = /<%=([\s\S]+?)%>/g;
      
      /** Used to match property names within property paths. */
      var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/,
        rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;
      
      /**
       * Used to match `RegExp` [syntax characters](http://ecma-international.org/ecma-262/6.0/#sec-patterns)
       * and those outlined by [`EscapeRegExpPattern`](http://ecma-international.org/ecma-262/6.0/#sec-escaperegexppattern).
       */
      var reRegExpChars = /^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g,
        reHasRegExpChars = RegExp(reRegExpChars.source);
      
      /** Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks). */
      var reComboMark = /[\u0300-\u036f\ufe20-\ufe23]/g;
      
      /** Used to match backslashes in property paths. */
      var reEscapeChar = /\\(\\)?/g;
      
      /** Used to match [ES template delimiters](http://ecma-international.org/ecma-262/6.0/#sec-template-literal-lexical-components). */
      var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
      
      /** Used to match `RegExp` flags from their coerced string values. */
      var reFlags = /\w*$/;
      
      /** Used to detect hexadecimal string values. */
      var reHasHexPrefix = /^0[xX]/;
      
      /** Used to detect host constructors (Safari > 5). */
      var reIsHostCtor = /^\[object .+?Constructor\]$/;
      
      /** Used to detect unsigned integer values. */
      var reIsUint = /^\d+$/;
      
      /** Used to match latin-1 supplementary letters (excluding mathematical operators). */
      var reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;
      
      /** Used to ensure capturing order of template delimiters. */
      var reNoMatch = /($^)/;
      
      /** Used to match unescaped characters in compiled string literals. */
      var reUnescapedString = /['\n\r\u2028\u2029\\]/g;
      
      /** Used to match words to create compound words. */
      var reWords = (function() {
        var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]',
          lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+';
        
        return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
      }());
      
      /** Used to assign default `context` object properties. */
      var contextProps = [
        'Array', 'ArrayBuffer', 'Date', 'Error', 'Float32Array', 'Float64Array',
        'Function', 'Int8Array', 'Int16Array', 'Int32Array', 'Math', 'Number',
        'Object', 'RegExp', 'Set', 'String', '_', 'clearTimeout', 'isFinite',
        'parseFloat', 'parseInt', 'setTimeout', 'TypeError', 'Uint8Array',
        'Uint8ClampedArray', 'Uint16Array', 'Uint32Array', 'WeakMap'
      ];
      
      /** Used to make template sourceURLs easier to identify. */
      var templateCounter = -1;
      
      /** Used to identify `toStringTag` values of typed arrays. */
      var typedArrayTags = {};
      typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
        typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
          typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
            typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
              typedArrayTags[uint32Tag] = true;
      typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
        typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
          typedArrayTags[dateTag] = typedArrayTags[errorTag] =
            typedArrayTags[funcTag] = typedArrayTags[mapTag] =
              typedArrayTags[numberTag] = typedArrayTags[objectTag] =
                typedArrayTags[regexpTag] = typedArrayTags[setTag] =
                  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
      
      /** Used to identify `toStringTag` values supported by `_.clone`. */
      var cloneableTags = {};
      cloneableTags[argsTag] = cloneableTags[arrayTag] =
        cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
          cloneableTags[dateTag] = cloneableTags[float32Tag] =
            cloneableTags[float64Tag] = cloneableTags[int8Tag] =
              cloneableTags[int16Tag] = cloneableTags[int32Tag] =
                cloneableTags[numberTag] = cloneableTags[objectTag] =
                  cloneableTags[regexpTag] = cloneableTags[stringTag] =
                    cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
                      cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
      cloneableTags[errorTag] = cloneableTags[funcTag] =
        cloneableTags[mapTag] = cloneableTags[setTag] =
          cloneableTags[weakMapTag] = false;
      
      /** Used to map latin-1 supplementary letters to basic latin letters. */
      var deburredLetters = {
        '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
        '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
        '\xc7': 'C',  '\xe7': 'c',
        '\xd0': 'D',  '\xf0': 'd',
        '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
        '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
        '\xcC': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
        '\xeC': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
        '\xd1': 'N',  '\xf1': 'n',
        '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
        '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
        '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
        '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
        '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
        '\xc6': 'Ae', '\xe6': 'ae',
        '\xde': 'Th', '\xfe': 'th',
        '\xdf': 'ss'
      };
      
      /** Used to map characters to HTML entities. */
      var htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;'
      };
      
      /** Used to map HTML entities to characters. */
      var htmlUnescapes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&#96;': '`'
      };
      
      /** Used to determine if values are of the language type `Object`. */
      var objectTypes = {
        'function': true,
        'object': true
      };
      
      /** Used to escape characters for inclusion in compiled regexes. */
      var regexpEscapes = {
        '0': 'x30', '1': 'x31', '2': 'x32', '3': 'x33', '4': 'x34',
        '5': 'x35', '6': 'x36', '7': 'x37', '8': 'x38', '9': 'x39',
        'A': 'x41', 'B': 'x42', 'C': 'x43', 'D': 'x44', 'E': 'x45', 'F': 'x46',
        'a': 'x61', 'b': 'x62', 'c': 'x63', 'd': 'x64', 'e': 'x65', 'f': 'x66',
        'n': 'x6e', 'r': 'x72', 't': 'x74', 'u': 'x75', 'v': 'x76', 'x': 'x78'
      };
      
      /** Used to escape characters for inclusion in compiled string literals. */
      var stringEscapes = {
        '\\': '\\',
        "'": "'",
        '\n': 'n',
        '\r': 'r',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
      };
      
      /** Detect free variable `exports`. */
      var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
      
      /** Detect free variable `module`. */
      var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
      
      /** Detect free variable `global` from Node.js. */
      var freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;
      
      /** Detect free variable `self`. */
      var freeSelf = objectTypes[typeof self] && self && self.Object && self;
      
      /** Detect free variable `window`. */
      var freeWindow = objectTypes[typeof window] && window && window.Object && window;
      
      /** Detect the popular CommonJS extension `module.exports`. */
      var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
      
      /**
       * Used as a reference to the global object.
       *
       * The `this` value is used if it's the global object to avoid Greasemonkey's
       * restricted `window` object, otherwise the `window` object is used.
       */
      var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;
      
      /*--------------------------------------------------------------------------*/
      
      /**
       * The base implementation of `compareAscending` which compares values and
       * sorts them in ascending order without guaranteeing a stable sort.
       *
       * @private
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {number} Returns the sort order indicator for `value`.
       */
      function baseCompareAscending(value, other) {
        if (value !== other) {
          var valIsNull = value === null,
            valIsUndef = value === undefined,
            valIsReflexive = value === value;
          
          var othIsNull = other === null,
            othIsUndef = other === undefined,
            othIsReflexive = other === other;
          
          if ((value > other && !othIsNull) || !valIsReflexive ||
            (valIsNull && !othIsUndef && othIsReflexive) ||
            (valIsUndef && othIsReflexive)) {
            return 1;
          }
          if ((value < other && !valIsNull) || !othIsReflexive ||
            (othIsNull && !valIsUndef && valIsReflexive) ||
            (othIsUndef && valIsReflexive)) {
            return -1;
          }
        }
        return 0;
      }
      
      /**
       * The base implementation of `_.findIndex` and `_.findLastIndex` without
       * support for callback shorthands and `this` binding.
       *
       * @private
       * @param {Array} array The array to search.
       * @param {Function} predicate The function invoked per iteration.
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
      function baseFindIndex(array, predicate, fromRight) {
        var length = array.length,
          index = fromRight ? length : -1;
        
        while ((fromRight ? index-- : ++index < length)) {
          if (predicate(array[index], index, array)) {
            return index;
          }
        }
        return -1;
      }
      
      /**
       * The base implementation of `_.indexOf` without support for binary searches.
       *
       * @private
       * @param {Array} array The array to search.
       * @param {*} value The value to search for.
       * @param {number} fromIndex The index to search from.
       * @returns {number} Returns the index of the matched value, else `-1`.
       */
      function baseIndexOf(array, value, fromIndex) {
        if (value !== value) {
          return indexOfNaN(array, fromIndex);
        }
        var index = fromIndex - 1,
          length = array.length;
        
        while (++index < length) {
          if (array[index] === value) {
            return index;
          }
        }
        return -1;
      }
      
      /**
       * The base implementation of `_.isFunction` without support for environments
       * with incorrect `typeof` results.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
       */
      function baseIsFunction(value) {
        // Avoid a Chakra JIT bug in compatibility modes of IE 11.
        // See https://github.com/jashkenas/underscore/issues/1621 for more details.
        return typeof value == 'function' || false;
      }
      
      /**
       * Converts `value` to a string if it's not one. An empty string is returned
       * for `null` or `undefined` values.
       *
       * @private
       * @param {*} value The value to process.
       * @returns {string} Returns the string.
       */
      function baseToString(value) {
        return value == null ? '' : (value + '');
      }
      
      /**
       * Used by `_.trim` and `_.trimLeft` to get the index of the first character
       * of `string` that is not found in `chars`.
       *
       * @private
       * @param {string} string The string to inspect.
       * @param {string} chars The characters to find.
       * @returns {number} Returns the index of the first character not found in `chars`.
       */
      function charsLeftIndex(string, chars) {
        var index = -1,
          length = string.length;
        
        while (++index < length && chars.indexOf(string.charAt(index)) > -1) {}
        return index;
      }
      
      /**
       * Used by `_.trim` and `_.trimRight` to get the index of the last character
       * of `string` that is not found in `chars`.
       *
       * @private
       * @param {string} string The string to inspect.
       * @param {string} chars The characters to find.
       * @returns {number} Returns the index of the last character not found in `chars`.
       */
      function charsRightIndex(string, chars) {
        var index = string.length;
        
        while (index-- && chars.indexOf(string.charAt(index)) > -1) {}
        return index;
      }
      
      /**
       * Used by `_.sortBy` to compare transformed elements of a collection and stable
       * sort them in ascending order.
       *
       * @private
       * @param {Object} object The object to compare.
       * @param {Object} other The other object to compare.
       * @returns {number} Returns the sort order indicator for `object`.
       */
      function compareAscending(object, other) {
        return baseCompareAscending(object.criteria, other.criteria) || (object.index - other.index);
      }
      
      /**
       * Used by `_.sortByOrder` to compare multiple properties of a value to another
       * and stable sort them.
       *
       * If `orders` is unspecified, all valuess are sorted in ascending order. Otherwise,
       * a value is sorted in ascending order if its corresponding order is "asc", and
       * descending if "desc".
       *
       * @private
       * @param {Object} object The object to compare.
       * @param {Object} other The other object to compare.
       * @param {boolean[]} orders The order to sort by for each property.
       * @returns {number} Returns the sort order indicator for `object`.
       */
      function compareMultiple(object, other, orders) {
        var index = -1,
          objCriteria = object.criteria,
          othCriteria = other.criteria,
          length = objCriteria.length,
          ordersLength = orders.length;
        
        while (++index < length) {
          var result = baseCompareAscending(objCriteria[index], othCriteria[index]);
          if (result) {
            if (index >= ordersLength) {
              return result;
            }
            var order = orders[index];
            return result * ((order === 'asc' || order === true) ? 1 : -1);
          }
        }
        // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
        // that causes it, under certain circumstances, to provide the same value for
        // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
        // for more details.
        //
        // This also ensures a stable sort in V8 and other engines.
        // See https://code.google.com/p/v8/issues/detail?id=90 for more details.
        return object.index - other.index;
      }
      
      /**
       * Used by `_.deburr` to convert latin-1 supplementary letters to basic latin letters.
       *
       * @private
       * @param {string} letter The matched letter to deburr.
       * @returns {string} Returns the deburred letter.
       */
      function deburrLetter(letter) {
        return deburredLetters[letter];
      }
      
      /**
       * Used by `_.escape` to convert characters to HTML entities.
       *
       * @private
       * @param {string} chr The matched character to escape.
       * @returns {string} Returns the escaped character.
       */
      function escapeHtmlChar(chr) {
        return htmlEscapes[chr];
      }
      
      /**
       * Used by `_.escapeRegExp` to escape characters for inclusion in compiled regexes.
       *
       * @private
       * @param {string} chr The matched character to escape.
       * @param {string} leadingChar The capture group for a leading character.
       * @param {string} whitespaceChar The capture group for a whitespace character.
       * @returns {string} Returns the escaped character.
       */
      function escapeRegExpChar(chr, leadingChar, whitespaceChar) {
        if (leadingChar) {
          chr = regexpEscapes[chr];
        } else if (whitespaceChar) {
          chr = stringEscapes[chr];
        }
        return '\\' + chr;
      }
      
      /**
       * Used by `_.template` to escape characters for inclusion in compiled string literals.
       *
       * @private
       * @param {string} chr The matched character to escape.
       * @returns {string} Returns the escaped character.
       */
      function escapeStringChar(chr) {
        return '\\' + stringEscapes[chr];
      }
      
      /**
       * Gets the index at which the first occurrence of `NaN` is found in `array`.
       *
       * @private
       * @param {Array} array The array to search.
       * @param {number} fromIndex The index to search from.
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {number} Returns the index of the matched `NaN`, else `-1`.
       */
      function indexOfNaN(array, fromIndex, fromRight) {
        var length = array.length,
          index = fromIndex + (fromRight ? 0 : -1);
        
        while ((fromRight ? index-- : ++index < length)) {
          var other = array[index];
          if (other !== other) {
            return index;
          }
        }
        return -1;
      }
      
      /**
       * Checks if `value` is object-like.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
       */
      function isObjectLike(value) {
        return !!value && typeof value == 'object';
      }
      
      /**
       * Used by `trimmedLeftIndex` and `trimmedRightIndex` to determine if a
       * character code is whitespace.
       *
       * @private
       * @param {number} charCode The character code to inspect.
       * @returns {boolean} Returns `true` if `charCode` is whitespace, else `false`.
       */
      function isSpace(charCode) {
        return ((charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160) || charCode == 5760 || charCode == 6158 ||
        (charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279)));
      }
      
      /**
       * Replaces all `placeholder` elements in `array` with an internal placeholder
       * and returns an array of their indexes.
       *
       * @private
       * @param {Array} array The array to modify.
       * @param {*} placeholder The placeholder to replace.
       * @returns {Array} Returns the new array of placeholder indexes.
       */
      function replaceHolders(array, placeholder) {
        var index = -1,
          length = array.length,
          resIndex = -1,
          result = [];
        
        while (++index < length) {
          if (array[index] === placeholder) {
            array[index] = PLACEHOLDER;
            result[++resIndex] = index;
          }
        }
        return result;
      }
      
      /**
       * An implementation of `_.uniq` optimized for sorted arrays without support
       * for callback shorthands and `this` binding.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {Function} [iteratee] The function invoked per iteration.
       * @returns {Array} Returns the new duplicate-value-free array.
       */
      function sortedUniq(array, iteratee) {
        var seen,
          index = -1,
          length = array.length,
          resIndex = -1,
          result = [];
        
        while (++index < length) {
          var value = array[index],
            computed = iteratee ? iteratee(value, index, array) : value;
          
          if (!index || seen !== computed) {
            seen = computed;
            result[++resIndex] = value;
          }
        }
        return result;
      }
      
      /**
       * Used by `_.trim` and `_.trimLeft` to get the index of the first non-whitespace
       * character of `string`.
       *
       * @private
       * @param {string} string The string to inspect.
       * @returns {number} Returns the index of the first non-whitespace character.
       */
      function trimmedLeftIndex(string) {
        var index = -1,
          length = string.length;
        
        while (++index < length && isSpace(string.charCodeAt(index))) {}
        return index;
      }
      
      /**
       * Used by `_.trim` and `_.trimRight` to get the index of the last non-whitespace
       * character of `string`.
       *
       * @private
       * @param {string} string The string to inspect.
       * @returns {number} Returns the index of the last non-whitespace character.
       */
      function trimmedRightIndex(string) {
        var index = string.length;
        
        while (index-- && isSpace(string.charCodeAt(index))) {}
        return index;
      }
      
      /**
       * Used by `_.unescape` to convert HTML entities to characters.
       *
       * @private
       * @param {string} chr The matched character to unescape.
       * @returns {string} Returns the unescaped character.
       */
      function unescapeHtmlChar(chr) {
        return htmlUnescapes[chr];
      }
      
      /*--------------------------------------------------------------------------*/
      
      /**
       * Create a new pristine `lodash` function using the given `context` object.
       *
       * @static
       * @memberOf _
       * @category Utility
       * @param {Object} [context=root] The context object.
       * @returns {Function} Returns a new `lodash` function.
       * @example
       *
       * _.mixin({ 'foo': _.constant('foo') });
       *
       * var lodash = _.runInContext();
       * lodash.mixin({ 'bar': lodash.constant('bar') });
       *
       * _.isFunction(_.foo);
       * // => true
       * _.isFunction(_.bar);
       * // => false
       *
       * lodash.isFunction(lodash.foo);
       * // => false
       * lodash.isFunction(lodash.bar);
       * // => true
       *
       * // using `context` to mock `Date#getTime` use in `_.now`
       * var mock = _.runInContext({
   *   'Date': function() {
   *     return { 'getTime': getTimeMock };
   *   }
   * });
       *
       * // or creating a suped-up `defer` in Node.js
       * var defer = _.runInContext({ 'setTimeout': setImmediate }).defer;
       */
      function runInContext(context) {
        // Avoid issues with some ES3 environments that attempt to use values, named
        // after built-in constructors like `Object`, for the creation of literals.
        // ES5 clears this up by stating that literals must use built-in constructors.
        // See https://es5.github.io/#x11.1.5 for more details.
        context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
        
        /** Native constructor references. */
        var Array = context.Array,
          Date = context.Date,
          Error = context.Error,
          Function = context.Function,
          Math = context.Math,
          Number = context.Number,
          Object = context.Object,
          RegExp = context.RegExp,
          String = context.String,
          TypeError = context.TypeError;
        
        /** Used for native method references. */
        var arrayProto = Array.prototype,
          objectProto = Object.prototype,
          stringProto = String.prototype;
        
        /** Used to resolve the decompiled source of functions. */
        var fnToString = Function.prototype.toString;
        
        /** Used to check objects for own properties. */
        var hasOwnProperty = objectProto.hasOwnProperty;
        
        /** Used to generate unique IDs. */
        var idCounter = 0;
        
        /**
         * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
         * of values.
         */
        var objToString = objectProto.toString;
        
        /** Used to restore the original `_` reference in `_.noConflict`. */
        var oldDash = root._;
        
        /** Used to detect if a method is native. */
        var reIsNative = RegExp('^' +
          fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
            .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
        );
        
        /** Native method references. */
        var ArrayBuffer = context.ArrayBuffer,
          clearTimeout = context.clearTimeout,
          parseFloat = context.parseFloat,
          pow = Math.pow,
          propertyIsEnumerable = objectProto.propertyIsEnumerable,
          Set = getNative(context, 'Set'),
          setTimeout = context.setTimeout,
          splice = arrayProto.splice,
          Uint8Array = context.Uint8Array,
          WeakMap = getNative(context, 'WeakMap');
        
        /* Native method references for those with the same name as other `lodash` methods. */
        var nativeCeil = Math.ceil,
          nativeCreate = getNative(Object, 'create'),
          nativeFloor = Math.floor,
          nativeIsArray = getNative(Array, 'isArray'),
          nativeIsFinite = context.isFinite,
          nativeKeys = getNative(Object, 'keys'),
          nativeMax = Math.max,
          nativeMin = Math.min,
          nativeNow = getNative(Date, 'now'),
          nativeParseInt = context.parseInt,
          nativeRandom = Math.random;
        
        /** Used as references for `-Infinity` and `Infinity`. */
        var NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY,
          POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
        
        /** Used as references for the maximum length and index of an array. */
        var MAX_ARRAY_LENGTH = 4294967295,
          MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
          HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;
        
        /**
         * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
         * of an array-like value.
         */
        var MAX_SAFE_INTEGER = 9007199254740991;
        
        /** Used to store function metadata. */
        var metaMap = WeakMap && new WeakMap;
        
        /** Used to lookup unminified function names. */
        var realNames = {};
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Creates a `lodash` object which wraps `value` to enable implicit chaining.
         * Methods that operate on and return arrays, collections, and functions can
         * be chained together. Methods that retrieve a single value or may return a
         * primitive value will automatically end the chain returning the unwrapped
         * value. Explicit chaining may be enabled using `_.chain`. The execution of
         * chained methods is lazy, that is, execution is deferred until `_#value`
         * is implicitly or explicitly called.
         *
         * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
         * fusion is an optimization strategy which merge iteratee calls; this can help
         * to avoid the creation of intermediate data structures and greatly reduce the
         * number of iteratee executions.
         *
         * Chaining is supported in custom builds as long as the `_#value` method is
         * directly or indirectly included in the build.
         *
         * In addition to lodash methods, wrappers have `Array` and `String` methods.
         *
         * The wrapper `Array` methods are:
         * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`,
         * `splice`, and `unshift`
         *
         * The wrapper `String` methods are:
         * `replace` and `split`
         *
         * The wrapper methods that support shortcut fusion are:
         * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,
         * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,
         * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,
         * and `where`
         *
         * The chainable wrapper methods are:
         * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,
         * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,
         * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defaultsDeep`,
         * `defer`, `delay`, `difference`, `drop`, `dropRight`, `dropRightWhile`,
         * `dropWhile`, `fill`, `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`,
         * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
         * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
         * `invoke`, `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`,
         * `matchesProperty`, `memoize`, `merge`, `method`, `methodOf`, `mixin`,
         * `modArgs`, `negate`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
         * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,
         * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `restParam`,
         * `reverse`, `set`, `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`,
         * `sortByOrder`, `splice`, `spread`, `take`, `takeRight`, `takeRightWhile`,
         * `takeWhile`, `tap`, `throttle`, `thru`, `times`, `toArray`, `toPlainObject`,
         * `transform`, `union`, `uniq`, `unshift`, `unzip`, `unzipWith`, `values`,
         * `valuesIn`, `where`, `without`, `wrap`, `xor`, `zip`, `zipObject`, `zipWith`
         *
         * The wrapper methods that are **not** chainable by default are:
         * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clone`, `cloneDeep`,
         * `deburr`, `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`,
         * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`,
         * `floor`, `get`, `gt`, `gte`, `has`, `identity`, `includes`, `indexOf`,
         * `inRange`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
         * `isEmpty`, `isEqual`, `isError`, `isFinite` `isFunction`, `isMatch`,
         * `isNative`, `isNaN`, `isNull`, `isNumber`, `isObject`, `isPlainObject`,
         * `isRegExp`, `isString`, `isUndefined`, `isTypedArray`, `join`, `kebabCase`,
         * `last`, `lastIndexOf`, `lt`, `lte`, `max`, `min`, `noConflict`, `noop`,
         * `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`, `random`, `reduce`,
         * `reduceRight`, `repeat`, `result`, `round`, `runInContext`, `shift`, `size`,
         * `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`, `startCase`,
         * `startsWith`, `sum`, `template`, `trim`, `trimLeft`, `trimRight`, `trunc`,
         * `unescape`, `uniqueId`, `value`, and `words`
         *
         * The wrapper method `sample` will return a wrapped value when `n` is provided,
         * otherwise an unwrapped value is returned.
         *
         * @name _
         * @constructor
         * @category Chain
         * @param {*} value The value to wrap in a `lodash` instance.
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var wrapped = _([1, 2, 3]);
         *
         * // returns an unwrapped value
         * wrapped.reduce(function(total, n) {
     *   return total + n;
     * });
         * // => 6
         *
         * // returns a wrapped value
         * var squares = wrapped.map(function(n) {
     *   return n * n;
     * });
         *
         * _.isArray(squares);
         * // => false
         *
         * _.isArray(squares.value());
         * // => true
         */
        function lodash(value) {
          if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
            if (value instanceof LodashWrapper) {
              return value;
            }
            if (hasOwnProperty.call(value, '__chain__') && hasOwnProperty.call(value, '__wrapped__')) {
              return wrapperClone(value);
            }
          }
          return new LodashWrapper(value);
        }
        
        /**
         * The function whose prototype all chaining wrappers inherit from.
         *
         * @private
         */
        function baseLodash() {
          // No operation performed.
        }
        
        /**
         * The base constructor for creating `lodash` wrapper objects.
         *
         * @private
         * @param {*} value The value to wrap.
         * @param {boolean} [chainAll] Enable chaining for all wrapper methods.
         * @param {Array} [actions=[]] Actions to peform to resolve the unwrapped value.
         */
        function LodashWrapper(value, chainAll, actions) {
          this.__wrapped__ = value;
          this.__actions__ = actions || [];
          this.__chain__ = !!chainAll;
        }
        
        /**
         * An object environment feature flags.
         *
         * @static
         * @memberOf _
         * @type Object
         */
        var support = lodash.support = {};
        
        /**
         * By default, the template delimiters used by lodash are like those in
         * embedded Ruby (ERB). Change the following template settings to use
         * alternative delimiters.
         *
         * @static
         * @memberOf _
         * @type Object
         */
        lodash.templateSettings = {
          
          /**
           * Used to detect `data` property values to be HTML-escaped.
           *
           * @memberOf _.templateSettings
           * @type RegExp
           */
          'escape': reEscape,
          
          /**
           * Used to detect code to be evaluated.
           *
           * @memberOf _.templateSettings
           * @type RegExp
           */
          'evaluate': reEvaluate,
          
          /**
           * Used to detect `data` property values to inject.
           *
           * @memberOf _.templateSettings
           * @type RegExp
           */
          'interpolate': reInterpolate,
          
          /**
           * Used to reference the data object in the template text.
           *
           * @memberOf _.templateSettings
           * @type string
           */
          'variable': '',
          
          /**
           * Used to import variables into the compiled template.
           *
           * @memberOf _.templateSettings
           * @type Object
           */
          'imports': {
            
            /**
             * A reference to the `lodash` function.
             *
             * @memberOf _.templateSettings.imports
             * @type Function
             */
            '_': lodash
          }
        };
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
         *
         * @private
         * @param {*} value The value to wrap.
         */
        function LazyWrapper(value) {
          this.__wrapped__ = value;
          this.__actions__ = [];
          this.__dir__ = 1;
          this.__filtered__ = false;
          this.__iteratees__ = [];
          this.__takeCount__ = POSITIVE_INFINITY;
          this.__views__ = [];
        }
        
        /**
         * Creates a clone of the lazy wrapper object.
         *
         * @private
         * @name clone
         * @memberOf LazyWrapper
         * @returns {Object} Returns the cloned `LazyWrapper` object.
         */
        function lazyClone() {
          var result = new LazyWrapper(this.__wrapped__);
          result.__actions__ = arrayCopy(this.__actions__);
          result.__dir__ = this.__dir__;
          result.__filtered__ = this.__filtered__;
          result.__iteratees__ = arrayCopy(this.__iteratees__);
          result.__takeCount__ = this.__takeCount__;
          result.__views__ = arrayCopy(this.__views__);
          return result;
        }
        
        /**
         * Reverses the direction of lazy iteration.
         *
         * @private
         * @name reverse
         * @memberOf LazyWrapper
         * @returns {Object} Returns the new reversed `LazyWrapper` object.
         */
        function lazyReverse() {
          if (this.__filtered__) {
            var result = new LazyWrapper(this);
            result.__dir__ = -1;
            result.__filtered__ = true;
          } else {
            result = this.clone();
            result.__dir__ *= -1;
          }
          return result;
        }
        
        /**
         * Extracts the unwrapped value from its lazy wrapper.
         *
         * @private
         * @name value
         * @memberOf LazyWrapper
         * @returns {*} Returns the unwrapped value.
         */
        function lazyValue() {
          var array = this.__wrapped__.value(),
            dir = this.__dir__,
            isArr = isArray(array),
            isRight = dir < 0,
            arrLength = isArr ? array.length : 0,
            view = getView(0, arrLength, this.__views__),
            start = view.start,
            end = view.end,
            length = end - start,
            index = isRight ? end : (start - 1),
            iteratees = this.__iteratees__,
            iterLength = iteratees.length,
            resIndex = 0,
            takeCount = nativeMin(length, this.__takeCount__);
          
          if (!isArr || arrLength < LARGE_ARRAY_SIZE || (arrLength == length && takeCount == length)) {
            return baseWrapperValue((isRight && isArr) ? array.reverse() : array, this.__actions__);
          }
          var result = [];
          
          outer:
            while (length-- && resIndex < takeCount) {
              index += dir;
              
              var iterIndex = -1,
                value = array[index];
              
              while (++iterIndex < iterLength) {
                var data = iteratees[iterIndex],
                  iteratee = data.iteratee,
                  type = data.type,
                  computed = iteratee(value);
                
                if (type == LAZY_MAP_FLAG) {
                  value = computed;
                } else if (!computed) {
                  if (type == LAZY_FILTER_FLAG) {
                    continue outer;
                  } else {
                    break outer;
                  }
                }
              }
              result[resIndex++] = value;
            }
          return result;
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Creates a cache object to store key/value pairs.
         *
         * @private
         * @static
         * @name Cache
         * @memberOf _.memoize
         */
        function MapCache() {
          this.__data__ = {};
        }
        
        /**
         * Removes `key` and its value from the cache.
         *
         * @private
         * @name delete
         * @memberOf _.memoize.Cache
         * @param {string} key The key of the value to remove.
         * @returns {boolean} Returns `true` if the entry was removed successfully, else `false`.
         */
        function mapDelete(key) {
          return this.has(key) && delete this.__data__[key];
        }
        
        /**
         * Gets the cached value for `key`.
         *
         * @private
         * @name get
         * @memberOf _.memoize.Cache
         * @param {string} key The key of the value to get.
         * @returns {*} Returns the cached value.
         */
        function mapGet(key) {
          return key == '__proto__' ? undefined : this.__data__[key];
        }
        
        /**
         * Checks if a cached value for `key` exists.
         *
         * @private
         * @name has
         * @memberOf _.memoize.Cache
         * @param {string} key The key of the entry to check.
         * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
         */
        function mapHas(key) {
          return key != '__proto__' && hasOwnProperty.call(this.__data__, key);
        }
        
        /**
         * Sets `value` to `key` of the cache.
         *
         * @private
         * @name set
         * @memberOf _.memoize.Cache
         * @param {string} key The key of the value to cache.
         * @param {*} value The value to cache.
         * @returns {Object} Returns the cache object.
         */
        function mapSet(key, value) {
          if (key != '__proto__') {
            this.__data__[key] = value;
          }
          return this;
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         *
         * Creates a cache object to store unique values.
         *
         * @private
         * @param {Array} [values] The values to cache.
         */
        function SetCache(values) {
          var length = values ? values.length : 0;
          
          this.data = { 'hash': nativeCreate(null), 'set': new Set };
          while (length--) {
            this.push(values[length]);
          }
        }
        
        /**
         * Checks if `value` is in `cache` mimicking the return signature of
         * `_.indexOf` by returning `0` if the value is found, else `-1`.
         *
         * @private
         * @param {Object} cache The cache to search.
         * @param {*} value The value to search for.
         * @returns {number} Returns `0` if `value` is found, else `-1`.
         */
        function cacheIndexOf(cache, value) {
          var data = cache.data,
            result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];
          
          return result ? 0 : -1;
        }
        
        /**
         * Adds `value` to the cache.
         *
         * @private
         * @name push
         * @memberOf SetCache
         * @param {*} value The value to cache.
         */
        function cachePush(value) {
          var data = this.data;
          if (typeof value == 'string' || isObject(value)) {
            data.set.add(value);
          } else {
            data.hash[value] = true;
          }
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Creates a new array joining `array` with `other`.
         *
         * @private
         * @param {Array} array The array to join.
         * @param {Array} other The other array to join.
         * @returns {Array} Returns the new concatenated array.
         */
        function arrayConcat(array, other) {
          var index = -1,
            length = array.length,
            othIndex = -1,
            othLength = other.length,
            result = Array(length + othLength);
          
          while (++index < length) {
            result[index] = array[index];
          }
          while (++othIndex < othLength) {
            result[index++] = other[othIndex];
          }
          return result;
        }
        
        /**
         * Copies the values of `source` to `array`.
         *
         * @private
         * @param {Array} source The array to copy values from.
         * @param {Array} [array=[]] The array to copy values to.
         * @returns {Array} Returns `array`.
         */
        function arrayCopy(source, array) {
          var index = -1,
            length = source.length;
          
          array || (array = Array(length));
          while (++index < length) {
            array[index] = source[index];
          }
          return array;
        }
        
        /**
         * A specialized version of `_.forEach` for arrays without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array} Returns `array`.
         */
        function arrayEach(array, iteratee) {
          var index = -1,
            length = array.length;
          
          while (++index < length) {
            if (iteratee(array[index], index, array) === false) {
              break;
            }
          }
          return array;
        }
        
        /**
         * A specialized version of `_.forEachRight` for arrays without support for
         * callback shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array} Returns `array`.
         */
        function arrayEachRight(array, iteratee) {
          var length = array.length;
          
          while (length--) {
            if (iteratee(array[length], length, array) === false) {
              break;
            }
          }
          return array;
        }
        
        /**
         * A specialized version of `_.every` for arrays without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {boolean} Returns `true` if all elements pass the predicate check,
         *  else `false`.
         */
        function arrayEvery(array, predicate) {
          var index = -1,
            length = array.length;
          
          while (++index < length) {
            if (!predicate(array[index], index, array)) {
              return false;
            }
          }
          return true;
        }
        
        /**
         * A specialized version of `baseExtremum` for arrays which invokes `iteratee`
         * with one argument: (value).
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {Function} comparator The function used to compare values.
         * @param {*} exValue The initial extremum value.
         * @returns {*} Returns the extremum value.
         */
        function arrayExtremum(array, iteratee, comparator, exValue) {
          var index = -1,
            length = array.length,
            computed = exValue,
            result = computed;
          
          while (++index < length) {
            var value = array[index],
              current = +iteratee(value);
            
            if (comparator(current, computed)) {
              computed = current;
              result = value;
            }
          }
          return result;
        }
        
        /**
         * A specialized version of `_.filter` for arrays without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {Array} Returns the new filtered array.
         */
        function arrayFilter(array, predicate) {
          var index = -1,
            length = array.length,
            resIndex = -1,
            result = [];
          
          while (++index < length) {
            var value = array[index];
            if (predicate(value, index, array)) {
              result[++resIndex] = value;
            }
          }
          return result;
        }
        
        /**
         * A specialized version of `_.map` for arrays without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array} Returns the new mapped array.
         */
        function arrayMap(array, iteratee) {
          var index = -1,
            length = array.length,
            result = Array(length);
          
          while (++index < length) {
            result[index] = iteratee(array[index], index, array);
          }
          return result;
        }
        
        /**
         * Appends the elements of `values` to `array`.
         *
         * @private
         * @param {Array} array The array to modify.
         * @param {Array} values The values to append.
         * @returns {Array} Returns `array`.
         */
        function arrayPush(array, values) {
          var index = -1,
            length = values.length,
            offset = array.length;
          
          while (++index < length) {
            array[offset + index] = values[index];
          }
          return array;
        }
        
        /**
         * A specialized version of `_.reduce` for arrays without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {*} [accumulator] The initial value.
         * @param {boolean} [initFromArray] Specify using the first element of `array`
         *  as the initial value.
         * @returns {*} Returns the accumulated value.
         */
        function arrayReduce(array, iteratee, accumulator, initFromArray) {
          var index = -1,
            length = array.length;
          
          if (initFromArray && length) {
            accumulator = array[++index];
          }
          while (++index < length) {
            accumulator = iteratee(accumulator, array[index], index, array);
          }
          return accumulator;
        }
        
        /**
         * A specialized version of `_.reduceRight` for arrays without support for
         * callback shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {*} [accumulator] The initial value.
         * @param {boolean} [initFromArray] Specify using the last element of `array`
         *  as the initial value.
         * @returns {*} Returns the accumulated value.
         */
        function arrayReduceRight(array, iteratee, accumulator, initFromArray) {
          var length = array.length;
          if (initFromArray && length) {
            accumulator = array[--length];
          }
          while (length--) {
            accumulator = iteratee(accumulator, array[length], length, array);
          }
          return accumulator;
        }
        
        /**
         * A specialized version of `_.some` for arrays without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {boolean} Returns `true` if any element passes the predicate check,
         *  else `false`.
         */
        function arraySome(array, predicate) {
          var index = -1,
            length = array.length;
          
          while (++index < length) {
            if (predicate(array[index], index, array)) {
              return true;
            }
          }
          return false;
        }
        
        /**
         * A specialized version of `_.sum` for arrays without support for callback
         * shorthands and `this` binding..
         *
         * @private
         * @param {Array} array The array to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {number} Returns the sum.
         */
        function arraySum(array, iteratee) {
          var length = array.length,
            result = 0;
          
          while (length--) {
            result += +iteratee(array[length]) || 0;
          }
          return result;
        }
        
        /**
         * Used by `_.defaults` to customize its `_.assign` use.
         *
         * @private
         * @param {*} objectValue The destination object property value.
         * @param {*} sourceValue The source object property value.
         * @returns {*} Returns the value to assign to the destination object.
         */
        function assignDefaults(objectValue, sourceValue) {
          return objectValue === undefined ? sourceValue : objectValue;
        }
        
        /**
         * Used by `_.template` to customize its `_.assign` use.
         *
         * **Note:** This function is like `assignDefaults` except that it ignores
         * inherited property values when checking if a property is `undefined`.
         *
         * @private
         * @param {*} objectValue The destination object property value.
         * @param {*} sourceValue The source object property value.
         * @param {string} key The key associated with the object and source values.
         * @param {Object} object The destination object.
         * @returns {*} Returns the value to assign to the destination object.
         */
        function assignOwnDefaults(objectValue, sourceValue, key, object) {
          return (objectValue === undefined || !hasOwnProperty.call(object, key))
            ? sourceValue
            : objectValue;
        }
        
        /**
         * A specialized version of `_.assign` for customizing assigned values without
         * support for argument juggling, multiple sources, and `this` binding `customizer`
         * functions.
         *
         * @private
         * @param {Object} object The destination object.
         * @param {Object} source The source object.
         * @param {Function} customizer The function to customize assigned values.
         * @returns {Object} Returns `object`.
         */
        function assignWith(object, source, customizer) {
          var index = -1,
            props = keys(source),
            length = props.length;
          
          while (++index < length) {
            var key = props[index],
              value = object[key],
              result = customizer(value, source[key], key, object, source);
            
            if ((result === result ? (result !== value) : (value === value)) ||
              (value === undefined && !(key in object))) {
              object[key] = result;
            }
          }
          return object;
        }
        
        /**
         * The base implementation of `_.assign` without support for argument juggling,
         * multiple sources, and `customizer` functions.
         *
         * @private
         * @param {Object} object The destination object.
         * @param {Object} source The source object.
         * @returns {Object} Returns `object`.
         */
        function baseAssign(object, source) {
          return source == null
            ? object
            : baseCopy(source, keys(source), object);
        }
        
        /**
         * The base implementation of `_.at` without support for string collections
         * and individual key arguments.
         *
         * @private
         * @param {Array|Object} collection The collection to iterate over.
         * @param {number[]|string[]} props The property names or indexes of elements to pick.
         * @returns {Array} Returns the new array of picked elements.
         */
        function baseAt(collection, props) {
          var index = -1,
            isNil = collection == null,
            isArr = !isNil && isArrayLike(collection),
            length = isArr ? collection.length : 0,
            propsLength = props.length,
            result = Array(propsLength);
          
          while(++index < propsLength) {
            var key = props[index];
            if (isArr) {
              result[index] = isIndex(key, length) ? collection[key] : undefined;
            } else {
              result[index] = isNil ? undefined : collection[key];
            }
          }
          return result;
        }
        
        /**
         * Copies properties of `source` to `object`.
         *
         * @private
         * @param {Object} source The object to copy properties from.
         * @param {Array} props The property names to copy.
         * @param {Object} [object={}] The object to copy properties to.
         * @returns {Object} Returns `object`.
         */
        function baseCopy(source, props, object) {
          object || (object = {});
          
          var index = -1,
            length = props.length;
          
          while (++index < length) {
            var key = props[index];
            object[key] = source[key];
          }
          return object;
        }
        
        /**
         * The base implementation of `_.callback` which supports specifying the
         * number of arguments to provide to `func`.
         *
         * @private
         * @param {*} [func=_.identity] The value to convert to a callback.
         * @param {*} [thisArg] The `this` binding of `func`.
         * @param {number} [argCount] The number of arguments to provide to `func`.
         * @returns {Function} Returns the callback.
         */
        function baseCallback(func, thisArg, argCount) {
          var type = typeof func;
          if (type == 'function') {
            return thisArg === undefined
              ? func
              : bindCallback(func, thisArg, argCount);
          }
          if (func == null) {
            return identity;
          }
          if (type == 'object') {
            return baseMatches(func);
          }
          return thisArg === undefined
            ? property(func)
            : baseMatchesProperty(func, thisArg);
        }
        
        /**
         * The base implementation of `_.clone` without support for argument juggling
         * and `this` binding `customizer` functions.
         *
         * @private
         * @param {*} value The value to clone.
         * @param {boolean} [isDeep] Specify a deep clone.
         * @param {Function} [customizer] The function to customize cloning values.
         * @param {string} [key] The key of `value`.
         * @param {Object} [object] The object `value` belongs to.
         * @param {Array} [stackA=[]] Tracks traversed source objects.
         * @param {Array} [stackB=[]] Associates clones with source counterparts.
         * @returns {*} Returns the cloned value.
         */
        function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
          var result;
          if (customizer) {
            result = object ? customizer(value, key, object) : customizer(value);
          }
          if (result !== undefined) {
            return result;
          }
          if (!isObject(value)) {
            return value;
          }
          var isArr = isArray(value);
          if (isArr) {
            result = initCloneArray(value);
            if (!isDeep) {
              return arrayCopy(value, result);
            }
          } else {
            var tag = objToString.call(value),
              isFunc = tag == funcTag;
            
            if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
              result = initCloneObject(isFunc ? {} : value);
              if (!isDeep) {
                return baseAssign(result, value);
              }
            } else {
              return cloneableTags[tag]
                ? initCloneByTag(value, tag, isDeep)
                : (object ? value : {});
            }
          }
          // Check for circular references and return its corresponding clone.
          stackA || (stackA = []);
          stackB || (stackB = []);
          
          var length = stackA.length;
          while (length--) {
            if (stackA[length] == value) {
              return stackB[length];
            }
          }
          // Add the source value to the stack of traversed objects and associate it with its clone.
          stackA.push(value);
          stackB.push(result);
          
          // Recursively populate clone (susceptible to call stack limits).
          (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
            result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
          });
          return result;
        }
        
        /**
         * The base implementation of `_.create` without support for assigning
         * properties to the created object.
         *
         * @private
         * @param {Object} prototype The object to inherit from.
         * @returns {Object} Returns the new object.
         */
        var baseCreate = (function() {
          function object() {}
          return function(prototype) {
            if (isObject(prototype)) {
              object.prototype = prototype;
              var result = new object;
              object.prototype = undefined;
            }
            return result || {};
          };
        }());
        
        /**
         * The base implementation of `_.delay` and `_.defer` which accepts an index
         * of where to slice the arguments to provide to `func`.
         *
         * @private
         * @param {Function} func The function to delay.
         * @param {number} wait The number of milliseconds to delay invocation.
         * @param {Object} args The arguments provide to `func`.
         * @returns {number} Returns the timer id.
         */
        function baseDelay(func, wait, args) {
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          return setTimeout(function() { func.apply(undefined, args); }, wait);
        }
        
        /**
         * The base implementation of `_.difference` which accepts a single array
         * of values to exclude.
         *
         * @private
         * @param {Array} array The array to inspect.
         * @param {Array} values The values to exclude.
         * @returns {Array} Returns the new array of filtered values.
         */
        function baseDifference(array, values) {
          var length = array ? array.length : 0,
            result = [];
          
          if (!length) {
            return result;
          }
          var index = -1,
            indexOf = getIndexOf(),
            isCommon = indexOf == baseIndexOf,
            cache = (isCommon && values.length >= LARGE_ARRAY_SIZE) ? createCache(values) : null,
            valuesLength = values.length;
          
          if (cache) {
            indexOf = cacheIndexOf;
            isCommon = false;
            values = cache;
          }
          outer:
            while (++index < length) {
              var value = array[index];
              
              if (isCommon && value === value) {
                var valuesIndex = valuesLength;
                while (valuesIndex--) {
                  if (values[valuesIndex] === value) {
                    continue outer;
                  }
                }
                result.push(value);
              }
              else if (indexOf(values, value, 0) < 0) {
                result.push(value);
              }
            }
          return result;
        }
        
        /**
         * The base implementation of `_.forEach` without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array|Object|string} Returns `collection`.
         */
        var baseEach = createBaseEach(baseForOwn);
        
        /**
         * The base implementation of `_.forEachRight` without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array|Object|string} Returns `collection`.
         */
        var baseEachRight = createBaseEach(baseForOwnRight, true);
        
        /**
         * The base implementation of `_.every` without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {boolean} Returns `true` if all elements pass the predicate check,
         *  else `false`
         */
        function baseEvery(collection, predicate) {
          var result = true;
          baseEach(collection, function(value, index, collection) {
            result = !!predicate(value, index, collection);
            return result;
          });
          return result;
        }
        
        /**
         * Gets the extremum value of `collection` invoking `iteratee` for each value
         * in `collection` to generate the criterion by which the value is ranked.
         * The `iteratee` is invoked with three arguments: (value, index|key, collection).
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {Function} comparator The function used to compare values.
         * @param {*} exValue The initial extremum value.
         * @returns {*} Returns the extremum value.
         */
        function baseExtremum(collection, iteratee, comparator, exValue) {
          var computed = exValue,
            result = computed;
          
          baseEach(collection, function(value, index, collection) {
            var current = +iteratee(value, index, collection);
            if (comparator(current, computed) || (current === exValue && current === result)) {
              computed = current;
              result = value;
            }
          });
          return result;
        }
        
        /**
         * The base implementation of `_.fill` without an iteratee call guard.
         *
         * @private
         * @param {Array} array The array to fill.
         * @param {*} value The value to fill `array` with.
         * @param {number} [start=0] The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns `array`.
         */
        function baseFill(array, value, start, end) {
          var length = array.length;
          
          start = start == null ? 0 : (+start || 0);
          if (start < 0) {
            start = -start > length ? 0 : (length + start);
          }
          end = (end === undefined || end > length) ? length : (+end || 0);
          if (end < 0) {
            end += length;
          }
          length = start > end ? 0 : (end >>> 0);
          start >>>= 0;
          
          while (start < length) {
            array[start++] = value;
          }
          return array;
        }
        
        /**
         * The base implementation of `_.filter` without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {Array} Returns the new filtered array.
         */
        function baseFilter(collection, predicate) {
          var result = [];
          baseEach(collection, function(value, index, collection) {
            if (predicate(value, index, collection)) {
              result.push(value);
            }
          });
          return result;
        }
        
        /**
         * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
         * without support for callback shorthands and `this` binding, which iterates
         * over `collection` using the provided `eachFunc`.
         *
         * @private
         * @param {Array|Object|string} collection The collection to search.
         * @param {Function} predicate The function invoked per iteration.
         * @param {Function} eachFunc The function to iterate over `collection`.
         * @param {boolean} [retKey] Specify returning the key of the found element
         *  instead of the element itself.
         * @returns {*} Returns the found element or its key, else `undefined`.
         */
        function baseFind(collection, predicate, eachFunc, retKey) {
          var result;
          eachFunc(collection, function(value, key, collection) {
            if (predicate(value, key, collection)) {
              result = retKey ? key : value;
              return false;
            }
          });
          return result;
        }
        
        /**
         * The base implementation of `_.flatten` with added support for restricting
         * flattening and specifying the start index.
         *
         * @private
         * @param {Array} array The array to flatten.
         * @param {boolean} [isDeep] Specify a deep flatten.
         * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
         * @param {Array} [result=[]] The initial result value.
         * @returns {Array} Returns the new flattened array.
         */
        function baseFlatten(array, isDeep, isStrict, result) {
          result || (result = []);
          
          var index = -1,
            length = array.length;
          
          while (++index < length) {
            var value = array[index];
            if (isObjectLike(value) && isArrayLike(value) &&
              (isStrict || isArray(value) || isArguments(value))) {
              if (isDeep) {
                // Recursively flatten arrays (susceptible to call stack limits).
                baseFlatten(value, isDeep, isStrict, result);
              } else {
                arrayPush(result, value);
              }
            } else if (!isStrict) {
              result[result.length] = value;
            }
          }
          return result;
        }
        
        /**
         * The base implementation of `baseForIn` and `baseForOwn` which iterates
         * over `object` properties returned by `keysFunc` invoking `iteratee` for
         * each property. Iteratee functions may exit iteration early by explicitly
         * returning `false`.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {Function} keysFunc The function to get the keys of `object`.
         * @returns {Object} Returns `object`.
         */
        var baseFor = createBaseFor();
        
        /**
         * This function is like `baseFor` except that it iterates over properties
         * in the opposite order.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {Function} keysFunc The function to get the keys of `object`.
         * @returns {Object} Returns `object`.
         */
        var baseForRight = createBaseFor(true);
        
        /**
         * The base implementation of `_.forIn` without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Object} Returns `object`.
         */
        function baseForIn(object, iteratee) {
          return baseFor(object, iteratee, keysIn);
        }
        
        /**
         * The base implementation of `_.forOwn` without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Object} Returns `object`.
         */
        function baseForOwn(object, iteratee) {
          return baseFor(object, iteratee, keys);
        }
        
        /**
         * The base implementation of `_.forOwnRight` without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Object} object The object to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Object} Returns `object`.
         */
        function baseForOwnRight(object, iteratee) {
          return baseForRight(object, iteratee, keys);
        }
        
        /**
         * The base implementation of `_.functions` which creates an array of
         * `object` function property names filtered from those provided.
         *
         * @private
         * @param {Object} object The object to inspect.
         * @param {Array} props The property names to filter.
         * @returns {Array} Returns the new array of filtered property names.
         */
        function baseFunctions(object, props) {
          var index = -1,
            length = props.length,
            resIndex = -1,
            result = [];
          
          while (++index < length) {
            var key = props[index];
            if (isFunction(object[key])) {
              result[++resIndex] = key;
            }
          }
          return result;
        }
        
        /**
         * The base implementation of `get` without support for string paths
         * and default values.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {Array} path The path of the property to get.
         * @param {string} [pathKey] The key representation of path.
         * @returns {*} Returns the resolved value.
         */
        function baseGet(object, path, pathKey) {
          if (object == null) {
            return;
          }
          if (pathKey !== undefined && pathKey in toObject(object)) {
            path = [pathKey];
          }
          var index = 0,
            length = path.length;
          
          while (object != null && index < length) {
            object = object[path[index++]];
          }
          return (index && index == length) ? object : undefined;
        }
        
        /**
         * The base implementation of `_.isEqual` without support for `this` binding
         * `customizer` functions.
         *
         * @private
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @param {Function} [customizer] The function to customize comparing values.
         * @param {boolean} [isLoose] Specify performing partial comparisons.
         * @param {Array} [stackA] Tracks traversed `value` objects.
         * @param {Array} [stackB] Tracks traversed `other` objects.
         * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
         */
        function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
          if (value === other) {
            return true;
          }
          if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
            return value !== value && other !== other;
          }
          return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
        }
        
        /**
         * A specialized version of `baseIsEqual` for arrays and objects which performs
         * deep comparisons and tracks traversed objects enabling objects with circular
         * references to be compared.
         *
         * @private
         * @param {Object} object The object to compare.
         * @param {Object} other The other object to compare.
         * @param {Function} equalFunc The function to determine equivalents of values.
         * @param {Function} [customizer] The function to customize comparing objects.
         * @param {boolean} [isLoose] Specify performing partial comparisons.
         * @param {Array} [stackA=[]] Tracks traversed `value` objects.
         * @param {Array} [stackB=[]] Tracks traversed `other` objects.
         * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
         */
        function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
          var objIsArr = isArray(object),
            othIsArr = isArray(other),
            objTag = arrayTag,
            othTag = arrayTag;
          
          if (!objIsArr) {
            objTag = objToString.call(object);
            if (objTag == argsTag) {
              objTag = objectTag;
            } else if (objTag != objectTag) {
              objIsArr = isTypedArray(object);
            }
          }
          if (!othIsArr) {
            othTag = objToString.call(other);
            if (othTag == argsTag) {
              othTag = objectTag;
            } else if (othTag != objectTag) {
              othIsArr = isTypedArray(other);
            }
          }
          var objIsObj = objTag == objectTag,
            othIsObj = othTag == objectTag,
            isSameTag = objTag == othTag;
          
          if (isSameTag && !(objIsArr || objIsObj)) {
            return equalByTag(object, other, objTag);
          }
          if (!isLoose) {
            var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
              othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
            
            if (objIsWrapped || othIsWrapped) {
              return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
            }
          }
          if (!isSameTag) {
            return false;
          }
          // Assume cyclic values are equal.
          // For more information on detecting circular references see https://es5.github.io/#JO.
          stackA || (stackA = []);
          stackB || (stackB = []);
          
          var length = stackA.length;
          while (length--) {
            if (stackA[length] == object) {
              return stackB[length] == other;
            }
          }
          // Add `object` and `other` to the stack of traversed objects.
          stackA.push(object);
          stackB.push(other);
          
          var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);
          
          stackA.pop();
          stackB.pop();
          
          return result;
        }
        
        /**
         * The base implementation of `_.isMatch` without support for callback
         * shorthands and `this` binding.
         *
         * @private
         * @param {Object} object The object to inspect.
         * @param {Array} matchData The propery names, values, and compare flags to match.
         * @param {Function} [customizer] The function to customize comparing objects.
         * @returns {boolean} Returns `true` if `object` is a match, else `false`.
         */
        function baseIsMatch(object, matchData, customizer) {
          var index = matchData.length,
            length = index,
            noCustomizer = !customizer;
          
          if (object == null) {
            return !length;
          }
          object = toObject(object);
          while (index--) {
            var data = matchData[index];
            if ((noCustomizer && data[2])
                ? data[1] !== object[data[0]]
                : !(data[0] in object)
            ) {
              return false;
            }
          }
          while (++index < length) {
            data = matchData[index];
            var key = data[0],
              objValue = object[key],
              srcValue = data[1];
            
            if (noCustomizer && data[2]) {
              if (objValue === undefined && !(key in object)) {
                return false;
              }
            } else {
              var result = customizer ? customizer(objValue, srcValue, key) : undefined;
              if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
                return false;
              }
            }
          }
          return true;
        }
        
        /**
         * The base implementation of `_.map` without support for callback shorthands
         * and `this` binding.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {Array} Returns the new mapped array.
         */
        function baseMap(collection, iteratee) {
          var index = -1,
            result = isArrayLike(collection) ? Array(collection.length) : [];
          
          baseEach(collection, function(value, key, collection) {
            result[++index] = iteratee(value, key, collection);
          });
          return result;
        }
        
        /**
         * The base implementation of `_.matches` which does not clone `source`.
         *
         * @private
         * @param {Object} source The object of property values to match.
         * @returns {Function} Returns the new function.
         */
        function baseMatches(source) {
          var matchData = getMatchData(source);
          if (matchData.length == 1 && matchData[0][2]) {
            var key = matchData[0][0],
              value = matchData[0][1];
            
            return function(object) {
              if (object == null) {
                return false;
              }
              return object[key] === value && (value !== undefined || (key in toObject(object)));
            };
          }
          return function(object) {
            return baseIsMatch(object, matchData);
          };
        }
        
        /**
         * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
         *
         * @private
         * @param {string} path The path of the property to get.
         * @param {*} srcValue The value to compare.
         * @returns {Function} Returns the new function.
         */
        function baseMatchesProperty(path, srcValue) {
          var isArr = isArray(path),
            isCommon = isKey(path) && isStrictComparable(srcValue),
            pathKey = (path + '');
          
          path = toPath(path);
          return function(object) {
            if (object == null) {
              return false;
            }
            var key = pathKey;
            object = toObject(object);
            if ((isArr || !isCommon) && !(key in object)) {
              object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
              if (object == null) {
                return false;
              }
              key = last(path);
              object = toObject(object);
            }
            return object[key] === srcValue
              ? (srcValue !== undefined || (key in object))
              : baseIsEqual(srcValue, object[key], undefined, true);
          };
        }
        
        /**
         * The base implementation of `_.merge` without support for argument juggling,
         * multiple sources, and `this` binding `customizer` functions.
         *
         * @private
         * @param {Object} object The destination object.
         * @param {Object} source The source object.
         * @param {Function} [customizer] The function to customize merged values.
         * @param {Array} [stackA=[]] Tracks traversed source objects.
         * @param {Array} [stackB=[]] Associates values with source counterparts.
         * @returns {Object} Returns `object`.
         */
        function baseMerge(object, source, customizer, stackA, stackB) {
          if (!isObject(object)) {
            return object;
          }
          var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
            props = isSrcArr ? undefined : keys(source);
          
          arrayEach(props || source, function(srcValue, key) {
            if (props) {
              key = srcValue;
              srcValue = source[key];
            }
            if (isObjectLike(srcValue)) {
              stackA || (stackA = []);
              stackB || (stackB = []);
              baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
            }
            else {
              var value = object[key],
                result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
                isCommon = result === undefined;
              
              if (isCommon) {
                result = srcValue;
              }
              if ((result !== undefined || (isSrcArr && !(key in object))) &&
                (isCommon || (result === result ? (result !== value) : (value === value)))) {
                object[key] = result;
              }
            }
          });
          return object;
        }
        
        /**
         * A specialized version of `baseMerge` for arrays and objects which performs
         * deep merges and tracks traversed objects enabling objects with circular
         * references to be merged.
         *
         * @private
         * @param {Object} object The destination object.
         * @param {Object} source The source object.
         * @param {string} key The key of the value to merge.
         * @param {Function} mergeFunc The function to merge values.
         * @param {Function} [customizer] The function to customize merged values.
         * @param {Array} [stackA=[]] Tracks traversed source objects.
         * @param {Array} [stackB=[]] Associates values with source counterparts.
         * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
         */
        function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
          var length = stackA.length,
            srcValue = source[key];
          
          while (length--) {
            if (stackA[length] == srcValue) {
              object[key] = stackB[length];
              return;
            }
          }
          var value = object[key],
            result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
            isCommon = result === undefined;
          
          if (isCommon) {
            result = srcValue;
            if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
              result = isArray(value)
                ? value
                : (isArrayLike(value) ? arrayCopy(value) : []);
            }
            else if (isPlainObject(srcValue) || isArguments(srcValue)) {
              result = isArguments(value)
                ? toPlainObject(value)
                : (isPlainObject(value) ? value : {});
            }
            else {
              isCommon = false;
            }
          }
          // Add the source value to the stack of traversed objects and associate
          // it with its merged value.
          stackA.push(srcValue);
          stackB.push(result);
          
          if (isCommon) {
            // Recursively merge objects and arrays (susceptible to call stack limits).
            object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
          } else if (result === result ? (result !== value) : (value === value)) {
            object[key] = result;
          }
        }
        
        /**
         * The base implementation of `_.property` without support for deep paths.
         *
         * @private
         * @param {string} key The key of the property to get.
         * @returns {Function} Returns the new function.
         */
        function baseProperty(key) {
          return function(object) {
            return object == null ? undefined : object[key];
          };
        }
        
        /**
         * A specialized version of `baseProperty` which supports deep paths.
         *
         * @private
         * @param {Array|string} path The path of the property to get.
         * @returns {Function} Returns the new function.
         */
        function basePropertyDeep(path) {
          var pathKey = (path + '');
          path = toPath(path);
          return function(object) {
            return baseGet(object, path, pathKey);
          };
        }
        
        /**
         * The base implementation of `_.pullAt` without support for individual
         * index arguments and capturing the removed elements.
         *
         * @private
         * @param {Array} array The array to modify.
         * @param {number[]} indexes The indexes of elements to remove.
         * @returns {Array} Returns `array`.
         */
        function basePullAt(array, indexes) {
          var length = array ? indexes.length : 0;
          while (length--) {
            var index = indexes[length];
            if (index != previous && isIndex(index)) {
              var previous = index;
              splice.call(array, index, 1);
            }
          }
          return array;
        }
        
        /**
         * The base implementation of `_.random` without support for argument juggling
         * and returning floating-point numbers.
         *
         * @private
         * @param {number} min The minimum possible value.
         * @param {number} max The maximum possible value.
         * @returns {number} Returns the random number.
         */
        function baseRandom(min, max) {
          return min + nativeFloor(nativeRandom() * (max - min + 1));
        }
        
        /**
         * The base implementation of `_.reduce` and `_.reduceRight` without support
         * for callback shorthands and `this` binding, which iterates over `collection`
         * using the provided `eachFunc`.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {*} accumulator The initial value.
         * @param {boolean} initFromCollection Specify using the first or last element
         *  of `collection` as the initial value.
         * @param {Function} eachFunc The function to iterate over `collection`.
         * @returns {*} Returns the accumulated value.
         */
        function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
          eachFunc(collection, function(value, index, collection) {
            accumulator = initFromCollection
              ? (initFromCollection = false, value)
              : iteratee(accumulator, value, index, collection);
          });
          return accumulator;
        }
        
        /**
         * The base implementation of `setData` without support for hot loop detection.
         *
         * @private
         * @param {Function} func The function to associate metadata with.
         * @param {*} data The metadata.
         * @returns {Function} Returns `func`.
         */
        var baseSetData = !metaMap ? identity : function(func, data) {
          metaMap.set(func, data);
          return func;
        };
        
        /**
         * The base implementation of `_.slice` without an iteratee call guard.
         *
         * @private
         * @param {Array} array The array to slice.
         * @param {number} [start=0] The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns the slice of `array`.
         */
        function baseSlice(array, start, end) {
          var index = -1,
            length = array.length;
          
          start = start == null ? 0 : (+start || 0);
          if (start < 0) {
            start = -start > length ? 0 : (length + start);
          }
          end = (end === undefined || end > length) ? length : (+end || 0);
          if (end < 0) {
            end += length;
          }
          length = start > end ? 0 : ((end - start) >>> 0);
          start >>>= 0;
          
          var result = Array(length);
          while (++index < length) {
            result[index] = array[index + start];
          }
          return result;
        }
        
        /**
         * The base implementation of `_.some` without support for callback shorthands
         * and `this` binding.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {boolean} Returns `true` if any element passes the predicate check,
         *  else `false`.
         */
        function baseSome(collection, predicate) {
          var result;
          
          baseEach(collection, function(value, index, collection) {
            result = predicate(value, index, collection);
            return !result;
          });
          return !!result;
        }
        
        /**
         * The base implementation of `_.sortBy` which uses `comparer` to define
         * the sort order of `array` and replaces criteria objects with their
         * corresponding values.
         *
         * @private
         * @param {Array} array The array to sort.
         * @param {Function} comparer The function to define sort order.
         * @returns {Array} Returns `array`.
         */
        function baseSortBy(array, comparer) {
          var length = array.length;
          
          array.sort(comparer);
          while (length--) {
            array[length] = array[length].value;
          }
          return array;
        }
        
        /**
         * The base implementation of `_.sortByOrder` without param guards.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
         * @param {boolean[]} orders The sort orders of `iteratees`.
         * @returns {Array} Returns the new sorted array.
         */
        function baseSortByOrder(collection, iteratees, orders) {
          var callback = getCallback(),
            index = -1;
          
          iteratees = arrayMap(iteratees, function(iteratee) { return callback(iteratee); });
          
          var result = baseMap(collection, function(value) {
            var criteria = arrayMap(iteratees, function(iteratee) { return iteratee(value); });
            return { 'criteria': criteria, 'index': ++index, 'value': value };
          });
          
          return baseSortBy(result, function(object, other) {
            return compareMultiple(object, other, orders);
          });
        }
        
        /**
         * The base implementation of `_.sum` without support for callback shorthands
         * and `this` binding.
         *
         * @private
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} iteratee The function invoked per iteration.
         * @returns {number} Returns the sum.
         */
        function baseSum(collection, iteratee) {
          var result = 0;
          baseEach(collection, function(value, index, collection) {
            result += +iteratee(value, index, collection) || 0;
          });
          return result;
        }
        
        /**
         * The base implementation of `_.uniq` without support for callback shorthands
         * and `this` binding.
         *
         * @private
         * @param {Array} array The array to inspect.
         * @param {Function} [iteratee] The function invoked per iteration.
         * @returns {Array} Returns the new duplicate-value-free array.
         */
        function baseUniq(array, iteratee) {
          var index = -1,
            indexOf = getIndexOf(),
            length = array.length,
            isCommon = indexOf == baseIndexOf,
            isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
            seen = isLarge ? createCache() : null,
            result = [];
          
          if (seen) {
            indexOf = cacheIndexOf;
            isCommon = false;
          } else {
            isLarge = false;
            seen = iteratee ? [] : result;
          }
          outer:
            while (++index < length) {
              var value = array[index],
                computed = iteratee ? iteratee(value, index, array) : value;
              
              if (isCommon && value === value) {
                var seenIndex = seen.length;
                while (seenIndex--) {
                  if (seen[seenIndex] === computed) {
                    continue outer;
                  }
                }
                if (iteratee) {
                  seen.push(computed);
                }
                result.push(value);
              }
              else if (indexOf(seen, computed, 0) < 0) {
                if (iteratee || isLarge) {
                  seen.push(computed);
                }
                result.push(value);
              }
            }
          return result;
        }
        
        /**
         * The base implementation of `_.values` and `_.valuesIn` which creates an
         * array of `object` property values corresponding to the property names
         * of `props`.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {Array} props The property names to get values for.
         * @returns {Object} Returns the array of property values.
         */
        function baseValues(object, props) {
          var index = -1,
            length = props.length,
            result = Array(length);
          
          while (++index < length) {
            result[index] = object[props[index]];
          }
          return result;
        }
        
        /**
         * The base implementation of `_.dropRightWhile`, `_.dropWhile`, `_.takeRightWhile`,
         * and `_.takeWhile` without support for callback shorthands and `this` binding.
         *
         * @private
         * @param {Array} array The array to query.
         * @param {Function} predicate The function invoked per iteration.
         * @param {boolean} [isDrop] Specify dropping elements instead of taking them.
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Array} Returns the slice of `array`.
         */
        function baseWhile(array, predicate, isDrop, fromRight) {
          var length = array.length,
            index = fromRight ? length : -1;
          
          while ((fromRight ? index-- : ++index < length) && predicate(array[index], index, array)) {}
          return isDrop
            ? baseSlice(array, (fromRight ? 0 : index), (fromRight ? index + 1 : length))
            : baseSlice(array, (fromRight ? index + 1 : 0), (fromRight ? length : index));
        }
        
        /**
         * The base implementation of `wrapperValue` which returns the result of
         * performing a sequence of actions on the unwrapped `value`, where each
         * successive action is supplied the return value of the previous.
         *
         * @private
         * @param {*} value The unwrapped value.
         * @param {Array} actions Actions to peform to resolve the unwrapped value.
         * @returns {*} Returns the resolved value.
         */
        function baseWrapperValue(value, actions) {
          var result = value;
          if (result instanceof LazyWrapper) {
            result = result.value();
          }
          var index = -1,
            length = actions.length;
          
          while (++index < length) {
            var action = actions[index];
            result = action.func.apply(action.thisArg, arrayPush([result], action.args));
          }
          return result;
        }
        
        /**
         * Performs a binary search of `array` to determine the index at which `value`
         * should be inserted into `array` in order to maintain its sort order.
         *
         * @private
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @param {boolean} [retHighest] Specify returning the highest qualified index.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         */
        function binaryIndex(array, value, retHighest) {
          var low = 0,
            high = array ? array.length : low;
          
          if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
            while (low < high) {
              var mid = (low + high) >>> 1,
                computed = array[mid];
              
              if ((retHighest ? (computed <= value) : (computed < value)) && computed !== null) {
                low = mid + 1;
              } else {
                high = mid;
              }
            }
            return high;
          }
          return binaryIndexBy(array, value, identity, retHighest);
        }
        
        /**
         * This function is like `binaryIndex` except that it invokes `iteratee` for
         * `value` and each element of `array` to compute their sort ranking. The
         * iteratee is invoked with one argument; (value).
         *
         * @private
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @param {Function} iteratee The function invoked per iteration.
         * @param {boolean} [retHighest] Specify returning the highest qualified index.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         */
        function binaryIndexBy(array, value, iteratee, retHighest) {
          value = iteratee(value);
          
          var low = 0,
            high = array ? array.length : 0,
            valIsNaN = value !== value,
            valIsNull = value === null,
            valIsUndef = value === undefined;
          
          while (low < high) {
            var mid = nativeFloor((low + high) / 2),
              computed = iteratee(array[mid]),
              isDef = computed !== undefined,
              isReflexive = computed === computed;
            
            if (valIsNaN) {
              var setLow = isReflexive || retHighest;
            } else if (valIsNull) {
              setLow = isReflexive && isDef && (retHighest || computed != null);
            } else if (valIsUndef) {
              setLow = isReflexive && (retHighest || isDef);
            } else if (computed == null) {
              setLow = false;
            } else {
              setLow = retHighest ? (computed <= value) : (computed < value);
            }
            if (setLow) {
              low = mid + 1;
            } else {
              high = mid;
            }
          }
          return nativeMin(high, MAX_ARRAY_INDEX);
        }
        
        /**
         * A specialized version of `baseCallback` which only supports `this` binding
         * and specifying the number of arguments to provide to `func`.
         *
         * @private
         * @param {Function} func The function to bind.
         * @param {*} thisArg The `this` binding of `func`.
         * @param {number} [argCount] The number of arguments to provide to `func`.
         * @returns {Function} Returns the callback.
         */
        function bindCallback(func, thisArg, argCount) {
          if (typeof func != 'function') {
            return identity;
          }
          if (thisArg === undefined) {
            return func;
          }
          switch (argCount) {
            case 1: return function(value) {
              return func.call(thisArg, value);
            };
            case 3: return function(value, index, collection) {
              return func.call(thisArg, value, index, collection);
            };
            case 4: return function(accumulator, value, index, collection) {
              return func.call(thisArg, accumulator, value, index, collection);
            };
            case 5: return function(value, other, key, object, source) {
              return func.call(thisArg, value, other, key, object, source);
            };
          }
          return function() {
            return func.apply(thisArg, arguments);
          };
        }
        
        /**
         * Creates a clone of the given array buffer.
         *
         * @private
         * @param {ArrayBuffer} buffer The array buffer to clone.
         * @returns {ArrayBuffer} Returns the cloned array buffer.
         */
        function bufferClone(buffer) {
          var result = new ArrayBuffer(buffer.byteLength),
            view = new Uint8Array(result);
          
          view.set(new Uint8Array(buffer));
          return result;
        }
        
        /**
         * Creates an array that is the composition of partially applied arguments,
         * placeholders, and provided arguments into a single array of arguments.
         *
         * @private
         * @param {Array|Object} args The provided arguments.
         * @param {Array} partials The arguments to prepend to those provided.
         * @param {Array} holders The `partials` placeholder indexes.
         * @returns {Array} Returns the new array of composed arguments.
         */
        function composeArgs(args, partials, holders) {
          var holdersLength = holders.length,
            argsIndex = -1,
            argsLength = nativeMax(args.length - holdersLength, 0),
            leftIndex = -1,
            leftLength = partials.length,
            result = Array(leftLength + argsLength);
          
          while (++leftIndex < leftLength) {
            result[leftIndex] = partials[leftIndex];
          }
          while (++argsIndex < holdersLength) {
            result[holders[argsIndex]] = args[argsIndex];
          }
          while (argsLength--) {
            result[leftIndex++] = args[argsIndex++];
          }
          return result;
        }
        
        /**
         * This function is like `composeArgs` except that the arguments composition
         * is tailored for `_.partialRight`.
         *
         * @private
         * @param {Array|Object} args The provided arguments.
         * @param {Array} partials The arguments to append to those provided.
         * @param {Array} holders The `partials` placeholder indexes.
         * @returns {Array} Returns the new array of composed arguments.
         */
        function composeArgsRight(args, partials, holders) {
          var holdersIndex = -1,
            holdersLength = holders.length,
            argsIndex = -1,
            argsLength = nativeMax(args.length - holdersLength, 0),
            rightIndex = -1,
            rightLength = partials.length,
            result = Array(argsLength + rightLength);
          
          while (++argsIndex < argsLength) {
            result[argsIndex] = args[argsIndex];
          }
          var offset = argsIndex;
          while (++rightIndex < rightLength) {
            result[offset + rightIndex] = partials[rightIndex];
          }
          while (++holdersIndex < holdersLength) {
            result[offset + holders[holdersIndex]] = args[argsIndex++];
          }
          return result;
        }
        
        /**
         * Creates a `_.countBy`, `_.groupBy`, `_.indexBy`, or `_.partition` function.
         *
         * @private
         * @param {Function} setter The function to set keys and values of the accumulator object.
         * @param {Function} [initializer] The function to initialize the accumulator object.
         * @returns {Function} Returns the new aggregator function.
         */
        function createAggregator(setter, initializer) {
          return function(collection, iteratee, thisArg) {
            var result = initializer ? initializer() : {};
            iteratee = getCallback(iteratee, thisArg, 3);
            
            if (isArray(collection)) {
              var index = -1,
                length = collection.length;
              
              while (++index < length) {
                var value = collection[index];
                setter(result, value, iteratee(value, index, collection), collection);
              }
            } else {
              baseEach(collection, function(value, key, collection) {
                setter(result, value, iteratee(value, key, collection), collection);
              });
            }
            return result;
          };
        }
        
        /**
         * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
         *
         * @private
         * @param {Function} assigner The function to assign values.
         * @returns {Function} Returns the new assigner function.
         */
        function createAssigner(assigner) {
          return restParam(function(object, sources) {
            var index = -1,
              length = object == null ? 0 : sources.length,
              customizer = length > 2 ? sources[length - 2] : undefined,
              guard = length > 2 ? sources[2] : undefined,
              thisArg = length > 1 ? sources[length - 1] : undefined;
            
            if (typeof customizer == 'function') {
              customizer = bindCallback(customizer, thisArg, 5);
              length -= 2;
            } else {
              customizer = typeof thisArg == 'function' ? thisArg : undefined;
              length -= (customizer ? 1 : 0);
            }
            if (guard && isIterateeCall(sources[0], sources[1], guard)) {
              customizer = length < 3 ? undefined : customizer;
              length = 1;
            }
            while (++index < length) {
              var source = sources[index];
              if (source) {
                assigner(object, source, customizer);
              }
            }
            return object;
          });
        }
        
        /**
         * Creates a `baseEach` or `baseEachRight` function.
         *
         * @private
         * @param {Function} eachFunc The function to iterate over a collection.
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new base function.
         */
        function createBaseEach(eachFunc, fromRight) {
          return function(collection, iteratee) {
            var length = collection ? getLength(collection) : 0;
            if (!isLength(length)) {
              return eachFunc(collection, iteratee);
            }
            var index = fromRight ? length : -1,
              iterable = toObject(collection);
            
            while ((fromRight ? index-- : ++index < length)) {
              if (iteratee(iterable[index], index, iterable) === false) {
                break;
              }
            }
            return collection;
          };
        }
        
        /**
         * Creates a base function for `_.forIn` or `_.forInRight`.
         *
         * @private
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new base function.
         */
        function createBaseFor(fromRight) {
          return function(object, iteratee, keysFunc) {
            var iterable = toObject(object),
              props = keysFunc(object),
              length = props.length,
              index = fromRight ? length : -1;
            
            while ((fromRight ? index-- : ++index < length)) {
              var key = props[index];
              if (iteratee(iterable[key], key, iterable) === false) {
                break;
              }
            }
            return object;
          };
        }
        
        /**
         * Creates a function that wraps `func` and invokes it with the `this`
         * binding of `thisArg`.
         *
         * @private
         * @param {Function} func The function to bind.
         * @param {*} [thisArg] The `this` binding of `func`.
         * @returns {Function} Returns the new bound function.
         */
        function createBindWrapper(func, thisArg) {
          var Ctor = createCtorWrapper(func);
          
          function wrapper() {
            var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
            return fn.apply(thisArg, arguments);
          }
          return wrapper;
        }
        
        /**
         * Creates a `Set` cache object to optimize linear searches of large arrays.
         *
         * @private
         * @param {Array} [values] The values to cache.
         * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
         */
        function createCache(values) {
          return (nativeCreate && Set) ? new SetCache(values) : null;
        }
        
        /**
         * Creates a function that produces compound words out of the words in a
         * given string.
         *
         * @private
         * @param {Function} callback The function to combine each word.
         * @returns {Function} Returns the new compounder function.
         */
        function createCompounder(callback) {
          return function(string) {
            var index = -1,
              array = words(deburr(string)),
              length = array.length,
              result = '';
            
            while (++index < length) {
              result = callback(result, array[index], index);
            }
            return result;
          };
        }
        
        /**
         * Creates a function that produces an instance of `Ctor` regardless of
         * whether it was invoked as part of a `new` expression or by `call` or `apply`.
         *
         * @private
         * @param {Function} Ctor The constructor to wrap.
         * @returns {Function} Returns the new wrapped function.
         */
        function createCtorWrapper(Ctor) {
          return function() {
            // Use a `switch` statement to work with class constructors.
            // See http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
            // for more details.
            var args = arguments;
            switch (args.length) {
              case 0: return new Ctor;
              case 1: return new Ctor(args[0]);
              case 2: return new Ctor(args[0], args[1]);
              case 3: return new Ctor(args[0], args[1], args[2]);
              case 4: return new Ctor(args[0], args[1], args[2], args[3]);
              case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
              case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
              case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
            }
            var thisBinding = baseCreate(Ctor.prototype),
              result = Ctor.apply(thisBinding, args);
            
            // Mimic the constructor's `return` behavior.
            // See https://es5.github.io/#x13.2.2 for more details.
            return isObject(result) ? result : thisBinding;
          };
        }
        
        /**
         * Creates a `_.curry` or `_.curryRight` function.
         *
         * @private
         * @param {boolean} flag The curry bit flag.
         * @returns {Function} Returns the new curry function.
         */
        function createCurry(flag) {
          function curryFunc(func, arity, guard) {
            if (guard && isIterateeCall(func, arity, guard)) {
              arity = undefined;
            }
            var result = createWrapper(func, flag, undefined, undefined, undefined, undefined, undefined, arity);
            result.placeholder = curryFunc.placeholder;
            return result;
          }
          return curryFunc;
        }
        
        /**
         * Creates a `_.defaults` or `_.defaultsDeep` function.
         *
         * @private
         * @param {Function} assigner The function to assign values.
         * @param {Function} customizer The function to customize assigned values.
         * @returns {Function} Returns the new defaults function.
         */
        function createDefaults(assigner, customizer) {
          return restParam(function(args) {
            var object = args[0];
            if (object == null) {
              return object;
            }
            args.push(customizer);
            return assigner.apply(undefined, args);
          });
        }
        
        /**
         * Creates a `_.max` or `_.min` function.
         *
         * @private
         * @param {Function} comparator The function used to compare values.
         * @param {*} exValue The initial extremum value.
         * @returns {Function} Returns the new extremum function.
         */
        function createExtremum(comparator, exValue) {
          return function(collection, iteratee, thisArg) {
            if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
              iteratee = undefined;
            }
            iteratee = getCallback(iteratee, thisArg, 3);
            if (iteratee.length == 1) {
              collection = isArray(collection) ? collection : toIterable(collection);
              var result = arrayExtremum(collection, iteratee, comparator, exValue);
              if (!(collection.length && result === exValue)) {
                return result;
              }
            }
            return baseExtremum(collection, iteratee, comparator, exValue);
          };
        }
        
        /**
         * Creates a `_.find` or `_.findLast` function.
         *
         * @private
         * @param {Function} eachFunc The function to iterate over a collection.
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new find function.
         */
        function createFind(eachFunc, fromRight) {
          return function(collection, predicate, thisArg) {
            predicate = getCallback(predicate, thisArg, 3);
            if (isArray(collection)) {
              var index = baseFindIndex(collection, predicate, fromRight);
              return index > -1 ? collection[index] : undefined;
            }
            return baseFind(collection, predicate, eachFunc);
          };
        }
        
        /**
         * Creates a `_.findIndex` or `_.findLastIndex` function.
         *
         * @private
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new find function.
         */
        function createFindIndex(fromRight) {
          return function(array, predicate, thisArg) {
            if (!(array && array.length)) {
              return -1;
            }
            predicate = getCallback(predicate, thisArg, 3);
            return baseFindIndex(array, predicate, fromRight);
          };
        }
        
        /**
         * Creates a `_.findKey` or `_.findLastKey` function.
         *
         * @private
         * @param {Function} objectFunc The function to iterate over an object.
         * @returns {Function} Returns the new find function.
         */
        function createFindKey(objectFunc) {
          return function(object, predicate, thisArg) {
            predicate = getCallback(predicate, thisArg, 3);
            return baseFind(object, predicate, objectFunc, true);
          };
        }
        
        /**
         * Creates a `_.flow` or `_.flowRight` function.
         *
         * @private
         * @param {boolean} [fromRight] Specify iterating from right to left.
         * @returns {Function} Returns the new flow function.
         */
        function createFlow(fromRight) {
          return function() {
            var wrapper,
              length = arguments.length,
              index = fromRight ? length : -1,
              leftIndex = 0,
              funcs = Array(length);
            
            while ((fromRight ? index-- : ++index < length)) {
              var func = funcs[leftIndex++] = arguments[index];
              if (typeof func != 'function') {
                throw new TypeError(FUNC_ERROR_TEXT);
              }
              if (!wrapper && LodashWrapper.prototype.thru && getFuncName(func) == 'wrapper') {
                wrapper = new LodashWrapper([], true);
              }
            }
            index = wrapper ? -1 : length;
            while (++index < length) {
              func = funcs[index];
              
              var funcName = getFuncName(func),
                data = funcName == 'wrapper' ? getData(func) : undefined;
              
              if (data && isLaziable(data[0]) && data[1] == (ARY_FLAG | CURRY_FLAG | PARTIAL_FLAG | REARG_FLAG) && !data[4].length && data[9] == 1) {
                wrapper = wrapper[getFuncName(data[0])].apply(wrapper, data[3]);
              } else {
                wrapper = (func.length == 1 && isLaziable(func)) ? wrapper[funcName]() : wrapper.thru(func);
              }
            }
            return function() {
              var args = arguments,
                value = args[0];
              
              if (wrapper && args.length == 1 && isArray(value) && value.length >= LARGE_ARRAY_SIZE) {
                return wrapper.plant(value).value();
              }
              var index = 0,
                result = length ? funcs[index].apply(this, args) : value;
              
              while (++index < length) {
                result = funcs[index].call(this, result);
              }
              return result;
            };
          };
        }
        
        /**
         * Creates a function for `_.forEach` or `_.forEachRight`.
         *
         * @private
         * @param {Function} arrayFunc The function to iterate over an array.
         * @param {Function} eachFunc The function to iterate over a collection.
         * @returns {Function} Returns the new each function.
         */
        function createForEach(arrayFunc, eachFunc) {
          return function(collection, iteratee, thisArg) {
            return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
              ? arrayFunc(collection, iteratee)
              : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
          };
        }
        
        /**
         * Creates a function for `_.forIn` or `_.forInRight`.
         *
         * @private
         * @param {Function} objectFunc The function to iterate over an object.
         * @returns {Function} Returns the new each function.
         */
        function createForIn(objectFunc) {
          return function(object, iteratee, thisArg) {
            if (typeof iteratee != 'function' || thisArg !== undefined) {
              iteratee = bindCallback(iteratee, thisArg, 3);
            }
            return objectFunc(object, iteratee, keysIn);
          };
        }
        
        /**
         * Creates a function for `_.forOwn` or `_.forOwnRight`.
         *
         * @private
         * @param {Function} objectFunc The function to iterate over an object.
         * @returns {Function} Returns the new each function.
         */
        function createForOwn(objectFunc) {
          return function(object, iteratee, thisArg) {
            if (typeof iteratee != 'function' || thisArg !== undefined) {
              iteratee = bindCallback(iteratee, thisArg, 3);
            }
            return objectFunc(object, iteratee);
          };
        }
        
        /**
         * Creates a function for `_.mapKeys` or `_.mapValues`.
         *
         * @private
         * @param {boolean} [isMapKeys] Specify mapping keys instead of values.
         * @returns {Function} Returns the new map function.
         */
        function createObjectMapper(isMapKeys) {
          return function(object, iteratee, thisArg) {
            var result = {};
            iteratee = getCallback(iteratee, thisArg, 3);
            
            baseForOwn(object, function(value, key, object) {
              var mapped = iteratee(value, key, object);
              key = isMapKeys ? mapped : key;
              value = isMapKeys ? value : mapped;
              result[key] = value;
            });
            return result;
          };
        }
        
        /**
         * Creates a function for `_.padLeft` or `_.padRight`.
         *
         * @private
         * @param {boolean} [fromRight] Specify padding from the right.
         * @returns {Function} Returns the new pad function.
         */
        function createPadDir(fromRight) {
          return function(string, length, chars) {
            string = baseToString(string);
            return (fromRight ? string : '') + createPadding(string, length, chars) + (fromRight ? '' : string);
          };
        }
        
        /**
         * Creates a `_.partial` or `_.partialRight` function.
         *
         * @private
         * @param {boolean} flag The partial bit flag.
         * @returns {Function} Returns the new partial function.
         */
        function createPartial(flag) {
          var partialFunc = restParam(function(func, partials) {
            var holders = replaceHolders(partials, partialFunc.placeholder);
            return createWrapper(func, flag, undefined, partials, holders);
          });
          return partialFunc;
        }
        
        /**
         * Creates a function for `_.reduce` or `_.reduceRight`.
         *
         * @private
         * @param {Function} arrayFunc The function to iterate over an array.
         * @param {Function} eachFunc The function to iterate over a collection.
         * @returns {Function} Returns the new each function.
         */
        function createReduce(arrayFunc, eachFunc) {
          return function(collection, iteratee, accumulator, thisArg) {
            var initFromArray = arguments.length < 3;
            return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
              ? arrayFunc(collection, iteratee, accumulator, initFromArray)
              : baseReduce(collection, getCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
          };
        }
        
        /**
         * Creates a function that wraps `func` and invokes it with optional `this`
         * binding of, partial application, and currying.
         *
         * @private
         * @param {Function|string} func The function or method name to reference.
         * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
         * @param {*} [thisArg] The `this` binding of `func`.
         * @param {Array} [partials] The arguments to prepend to those provided to the new function.
         * @param {Array} [holders] The `partials` placeholder indexes.
         * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
         * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
         * @param {Array} [argPos] The argument positions of the new function.
         * @param {number} [ary] The arity cap of `func`.
         * @param {number} [arity] The arity of `func`.
         * @returns {Function} Returns the new wrapped function.
         */
        function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
          var isAry = bitmask & ARY_FLAG,
            isBind = bitmask & BIND_FLAG,
            isBindKey = bitmask & BIND_KEY_FLAG,
            isCurry = bitmask & CURRY_FLAG,
            isCurryBound = bitmask & CURRY_BOUND_FLAG,
            isCurryRight = bitmask & CURRY_RIGHT_FLAG,
            Ctor = isBindKey ? undefined : createCtorWrapper(func);
          
          function wrapper() {
            // Avoid `arguments` object use disqualifying optimizations by
            // converting it to an array before providing it to other functions.
            var length = arguments.length,
              index = length,
              args = Array(length);
            
            while (index--) {
              args[index] = arguments[index];
            }
            if (partials) {
              args = composeArgs(args, partials, holders);
            }
            if (partialsRight) {
              args = composeArgsRight(args, partialsRight, holdersRight);
            }
            if (isCurry || isCurryRight) {
              var placeholder = wrapper.placeholder,
                argsHolders = replaceHolders(args, placeholder);
              
              length -= argsHolders.length;
              if (length < arity) {
                var newArgPos = argPos ? arrayCopy(argPos) : undefined,
                  newArity = nativeMax(arity - length, 0),
                  newsHolders = isCurry ? argsHolders : undefined,
                  newHoldersRight = isCurry ? undefined : argsHolders,
                  newPartials = isCurry ? args : undefined,
                  newPartialsRight = isCurry ? undefined : args;
                
                bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
                bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);
                
                if (!isCurryBound) {
                  bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
                }
                var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity],
                  result = createHybridWrapper.apply(undefined, newData);
                
                if (isLaziable(func)) {
                  setData(result, newData);
                }
                result.placeholder = placeholder;
                return result;
              }
            }
            var thisBinding = isBind ? thisArg : this,
              fn = isBindKey ? thisBinding[func] : func;
            
            if (argPos) {
              args = reorder(args, argPos);
            }
            if (isAry && ary < args.length) {
              args.length = ary;
            }
            if (this && this !== root && this instanceof wrapper) {
              fn = Ctor || createCtorWrapper(func);
            }
            return fn.apply(thisBinding, args);
          }
          return wrapper;
        }
        
        /**
         * Creates the padding required for `string` based on the given `length`.
         * The `chars` string is truncated if the number of characters exceeds `length`.
         *
         * @private
         * @param {string} string The string to create padding for.
         * @param {number} [length=0] The padding length.
         * @param {string} [chars=' '] The string used as padding.
         * @returns {string} Returns the pad for `string`.
         */
        function createPadding(string, length, chars) {
          var strLength = string.length;
          length = +length;
          
          if (strLength >= length || !nativeIsFinite(length)) {
            return '';
          }
          var padLength = length - strLength;
          chars = chars == null ? ' ' : (chars + '');
          return repeat(chars, nativeCeil(padLength / chars.length)).slice(0, padLength);
        }
        
        /**
         * Creates a function that wraps `func` and invokes it with the optional `this`
         * binding of `thisArg` and the `partials` prepended to those provided to
         * the wrapper.
         *
         * @private
         * @param {Function} func The function to partially apply arguments to.
         * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
         * @param {*} thisArg The `this` binding of `func`.
         * @param {Array} partials The arguments to prepend to those provided to the new function.
         * @returns {Function} Returns the new bound function.
         */
        function createPartialWrapper(func, bitmask, thisArg, partials) {
          var isBind = bitmask & BIND_FLAG,
            Ctor = createCtorWrapper(func);
          
          function wrapper() {
            // Avoid `arguments` object use disqualifying optimizations by
            // converting it to an array before providing it `func`.
            var argsIndex = -1,
              argsLength = arguments.length,
              leftIndex = -1,
              leftLength = partials.length,
              args = Array(leftLength + argsLength);
            
            while (++leftIndex < leftLength) {
              args[leftIndex] = partials[leftIndex];
            }
            while (argsLength--) {
              args[leftIndex++] = arguments[++argsIndex];
            }
            var fn = (this && this !== root && this instanceof wrapper) ? Ctor : func;
            return fn.apply(isBind ? thisArg : this, args);
          }
          return wrapper;
        }
        
        /**
         * Creates a `_.ceil`, `_.floor`, or `_.round` function.
         *
         * @private
         * @param {string} methodName The name of the `Math` method to use when rounding.
         * @returns {Function} Returns the new round function.
         */
        function createRound(methodName) {
          var func = Math[methodName];
          return function(number, precision) {
            precision = precision === undefined ? 0 : (+precision || 0);
            if (precision) {
              precision = pow(10, precision);
              return func(number * precision) / precision;
            }
            return func(number);
          };
        }
        
        /**
         * Creates a `_.sortedIndex` or `_.sortedLastIndex` function.
         *
         * @private
         * @param {boolean} [retHighest] Specify returning the highest qualified index.
         * @returns {Function} Returns the new index function.
         */
        function createSortedIndex(retHighest) {
          return function(array, value, iteratee, thisArg) {
            var callback = getCallback(iteratee);
            return (iteratee == null && callback === baseCallback)
              ? binaryIndex(array, value, retHighest)
              : binaryIndexBy(array, value, callback(iteratee, thisArg, 1), retHighest);
          };
        }
        
        /**
         * Creates a function that either curries or invokes `func` with optional
         * `this` binding and partially applied arguments.
         *
         * @private
         * @param {Function|string} func The function or method name to reference.
         * @param {number} bitmask The bitmask of flags.
         *  The bitmask may be composed of the following flags:
         *     1 - `_.bind`
         *     2 - `_.bindKey`
         *     4 - `_.curry` or `_.curryRight` of a bound function
         *     8 - `_.curry`
         *    16 - `_.curryRight`
         *    32 - `_.partial`
         *    64 - `_.partialRight`
         *   128 - `_.rearg`
         *   256 - `_.ary`
         * @param {*} [thisArg] The `this` binding of `func`.
         * @param {Array} [partials] The arguments to be partially applied.
         * @param {Array} [holders] The `partials` placeholder indexes.
         * @param {Array} [argPos] The argument positions of the new function.
         * @param {number} [ary] The arity cap of `func`.
         * @param {number} [arity] The arity of `func`.
         * @returns {Function} Returns the new wrapped function.
         */
        function createWrapper(func, bitmask, thisArg, partials, holders, argPos, ary, arity) {
          var isBindKey = bitmask & BIND_KEY_FLAG;
          if (!isBindKey && typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          var length = partials ? partials.length : 0;
          if (!length) {
            bitmask &= ~(PARTIAL_FLAG | PARTIAL_RIGHT_FLAG);
            partials = holders = undefined;
          }
          length -= (holders ? holders.length : 0);
          if (bitmask & PARTIAL_RIGHT_FLAG) {
            var partialsRight = partials,
              holdersRight = holders;
            
            partials = holders = undefined;
          }
          var data = isBindKey ? undefined : getData(func),
            newData = [func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity];
          
          if (data) {
            mergeData(newData, data);
            bitmask = newData[1];
            arity = newData[9];
          }
          newData[9] = arity == null
            ? (isBindKey ? 0 : func.length)
            : (nativeMax(arity - length, 0) || 0);
          
          if (bitmask == BIND_FLAG) {
            var result = createBindWrapper(newData[0], newData[2]);
          } else if ((bitmask == PARTIAL_FLAG || bitmask == (BIND_FLAG | PARTIAL_FLAG)) && !newData[4].length) {
            result = createPartialWrapper.apply(undefined, newData);
          } else {
            result = createHybridWrapper.apply(undefined, newData);
          }
          var setter = data ? baseSetData : setData;
          return setter(result, newData);
        }
        
        /**
         * A specialized version of `baseIsEqualDeep` for arrays with support for
         * partial deep comparisons.
         *
         * @private
         * @param {Array} array The array to compare.
         * @param {Array} other The other array to compare.
         * @param {Function} equalFunc The function to determine equivalents of values.
         * @param {Function} [customizer] The function to customize comparing arrays.
         * @param {boolean} [isLoose] Specify performing partial comparisons.
         * @param {Array} [stackA] Tracks traversed `value` objects.
         * @param {Array} [stackB] Tracks traversed `other` objects.
         * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
         */
        function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
          var index = -1,
            arrLength = array.length,
            othLength = other.length;
          
          if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
            return false;
          }
          // Ignore non-index properties.
          while (++index < arrLength) {
            var arrValue = array[index],
              othValue = other[index],
              result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;
            
            if (result !== undefined) {
              if (result) {
                continue;
              }
              return false;
            }
            // Recursively compare arrays (susceptible to call stack limits).
            if (isLoose) {
              if (!arraySome(other, function(othValue) {
                  return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
                })) {
                return false;
              }
            } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
              return false;
            }
          }
          return true;
        }
        
        /**
         * A specialized version of `baseIsEqualDeep` for comparing objects of
         * the same `toStringTag`.
         *
         * **Note:** This function only supports comparing values with tags of
         * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
         *
         * @private
         * @param {Object} object The object to compare.
         * @param {Object} other The other object to compare.
         * @param {string} tag The `toStringTag` of the objects to compare.
         * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
         */
        function equalByTag(object, other, tag) {
          switch (tag) {
            case boolTag:
            case dateTag:
              // Coerce dates and booleans to numbers, dates to milliseconds and booleans
              // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
              return +object == +other;
            
            case errorTag:
              return object.name == other.name && object.message == other.message;
            
            case numberTag:
              // Treat `NaN` vs. `NaN` as equal.
              return (object != +object)
                ? other != +other
                : object == +other;
            
            case regexpTag:
            case stringTag:
              // Coerce regexes to strings and treat strings primitives and string
              // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
              return object == (other + '');
          }
          return false;
        }
        
        /**
         * A specialized version of `baseIsEqualDeep` for objects with support for
         * partial deep comparisons.
         *
         * @private
         * @param {Object} object The object to compare.
         * @param {Object} other The other object to compare.
         * @param {Function} equalFunc The function to determine equivalents of values.
         * @param {Function} [customizer] The function to customize comparing values.
         * @param {boolean} [isLoose] Specify performing partial comparisons.
         * @param {Array} [stackA] Tracks traversed `value` objects.
         * @param {Array} [stackB] Tracks traversed `other` objects.
         * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
         */
        function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
          var objProps = keys(object),
            objLength = objProps.length,
            othProps = keys(other),
            othLength = othProps.length;
          
          if (objLength != othLength && !isLoose) {
            return false;
          }
          var index = objLength;
          while (index--) {
            var key = objProps[index];
            if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
              return false;
            }
          }
          var skipCtor = isLoose;
          while (++index < objLength) {
            key = objProps[index];
            var objValue = object[key],
              othValue = other[key],
              result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;
            
            // Recursively compare objects (susceptible to call stack limits).
            if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
              return false;
            }
            skipCtor || (skipCtor = key == 'constructor');
          }
          if (!skipCtor) {
            var objCtor = object.constructor,
              othCtor = other.constructor;
            
            // Non `Object` object instances with different constructors are not equal.
            if (objCtor != othCtor &&
              ('constructor' in object && 'constructor' in other) &&
              !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
              return false;
            }
          }
          return true;
        }
        
        /**
         * Gets the appropriate "callback" function. If the `_.callback` method is
         * customized this function returns the custom method, otherwise it returns
         * the `baseCallback` function. If arguments are provided the chosen function
         * is invoked with them and its result is returned.
         *
         * @private
         * @returns {Function} Returns the chosen function or its result.
         */
        function getCallback(func, thisArg, argCount) {
          var result = lodash.callback || callback;
          result = result === callback ? baseCallback : result;
          return argCount ? result(func, thisArg, argCount) : result;
        }
        
        /**
         * Gets metadata for `func`.
         *
         * @private
         * @param {Function} func The function to query.
         * @returns {*} Returns the metadata for `func`.
         */
        var getData = !metaMap ? noop : function(func) {
          return metaMap.get(func);
        };
        
        /**
         * Gets the name of `func`.
         *
         * @private
         * @param {Function} func The function to query.
         * @returns {string} Returns the function name.
         */
        function getFuncName(func) {
          var result = func.name,
            array = realNames[result],
            length = array ? array.length : 0;
          
          while (length--) {
            var data = array[length],
              otherFunc = data.func;
            if (otherFunc == null || otherFunc == func) {
              return data.name;
            }
          }
          return result;
        }
        
        /**
         * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
         * customized this function returns the custom method, otherwise it returns
         * the `baseIndexOf` function. If arguments are provided the chosen function
         * is invoked with them and its result is returned.
         *
         * @private
         * @returns {Function|number} Returns the chosen function or its result.
         */
        function getIndexOf(collection, target, fromIndex) {
          var result = lodash.indexOf || indexOf;
          result = result === indexOf ? baseIndexOf : result;
          return collection ? result(collection, target, fromIndex) : result;
        }
        
        /**
         * Gets the "length" property value of `object`.
         *
         * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
         * that affects Safari on at least iOS 8.1-8.3 ARM64.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {*} Returns the "length" value.
         */
        var getLength = baseProperty('length');
        
        /**
         * Gets the propery names, values, and compare flags of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the match data of `object`.
         */
        function getMatchData(object) {
          var result = pairs(object),
            length = result.length;
          
          while (length--) {
            result[length][2] = isStrictComparable(result[length][1]);
          }
          return result;
        }
        
        /**
         * Gets the native function at `key` of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {string} key The key of the method to get.
         * @returns {*} Returns the function if it's native, else `undefined`.
         */
        function getNative(object, key) {
          var value = object == null ? undefined : object[key];
          return isNative(value) ? value : undefined;
        }
        
        /**
         * Gets the view, applying any `transforms` to the `start` and `end` positions.
         *
         * @private
         * @param {number} start The start of the view.
         * @param {number} end The end of the view.
         * @param {Array} transforms The transformations to apply to the view.
         * @returns {Object} Returns an object containing the `start` and `end`
         *  positions of the view.
         */
        function getView(start, end, transforms) {
          var index = -1,
            length = transforms.length;
          
          while (++index < length) {
            var data = transforms[index],
              size = data.size;
            
            switch (data.type) {
              case 'drop':      start += size; break;
              case 'dropRight': end -= size; break;
              case 'take':      end = nativeMin(end, start + size); break;
              case 'takeRight': start = nativeMax(start, end - size); break;
            }
          }
          return { 'start': start, 'end': end };
        }
        
        /**
         * Initializes an array clone.
         *
         * @private
         * @param {Array} array The array to clone.
         * @returns {Array} Returns the initialized clone.
         */
        function initCloneArray(array) {
          var length = array.length,
            result = new array.constructor(length);
          
          // Add array properties assigned by `RegExp#exec`.
          if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
            result.index = array.index;
            result.input = array.input;
          }
          return result;
        }
        
        /**
         * Initializes an object clone.
         *
         * @private
         * @param {Object} object The object to clone.
         * @returns {Object} Returns the initialized clone.
         */
        function initCloneObject(object) {
          var Ctor = object.constructor;
          if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
            Ctor = Object;
          }
          return new Ctor;
        }
        
        /**
         * Initializes an object clone based on its `toStringTag`.
         *
         * **Note:** This function only supports cloning values with tags of
         * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
         *
         * @private
         * @param {Object} object The object to clone.
         * @param {string} tag The `toStringTag` of the object to clone.
         * @param {boolean} [isDeep] Specify a deep clone.
         * @returns {Object} Returns the initialized clone.
         */
        function initCloneByTag(object, tag, isDeep) {
          var Ctor = object.constructor;
          switch (tag) {
            case arrayBufferTag:
              return bufferClone(object);
            
            case boolTag:
            case dateTag:
              return new Ctor(+object);
            
            case float32Tag: case float64Tag:
            case int8Tag: case int16Tag: case int32Tag:
            case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
            var buffer = object.buffer;
            return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);
            
            case numberTag:
            case stringTag:
              return new Ctor(object);
            
            case regexpTag:
              var result = new Ctor(object.source, reFlags.exec(object));
              result.lastIndex = object.lastIndex;
          }
          return result;
        }
        
        /**
         * Invokes the method at `path` on `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @param {Array|string} path The path of the method to invoke.
         * @param {Array} args The arguments to invoke the method with.
         * @returns {*} Returns the result of the invoked method.
         */
        function invokePath(object, path, args) {
          if (object != null && !isKey(path, object)) {
            path = toPath(path);
            object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
            path = last(path);
          }
          var func = object == null ? object : object[path];
          return func == null ? undefined : func.apply(object, args);
        }
        
        /**
         * Checks if `value` is array-like.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
         */
        function isArrayLike(value) {
          return value != null && isLength(getLength(value));
        }
        
        /**
         * Checks if `value` is a valid array-like index.
         *
         * @private
         * @param {*} value The value to check.
         * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
         * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
         */
        function isIndex(value, length) {
          value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
          length = length == null ? MAX_SAFE_INTEGER : length;
          return value > -1 && value % 1 == 0 && value < length;
        }
        
        /**
         * Checks if the provided arguments are from an iteratee call.
         *
         * @private
         * @param {*} value The potential iteratee value argument.
         * @param {*} index The potential iteratee index or key argument.
         * @param {*} object The potential iteratee object argument.
         * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
         */
        function isIterateeCall(value, index, object) {
          if (!isObject(object)) {
            return false;
          }
          var type = typeof index;
          if (type == 'number'
              ? (isArrayLike(object) && isIndex(index, object.length))
              : (type == 'string' && index in object)) {
            var other = object[index];
            return value === value ? (value === other) : (other !== other);
          }
          return false;
        }
        
        /**
         * Checks if `value` is a property name and not a property path.
         *
         * @private
         * @param {*} value The value to check.
         * @param {Object} [object] The object to query keys on.
         * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
         */
        function isKey(value, object) {
          var type = typeof value;
          if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
            return true;
          }
          if (isArray(value)) {
            return false;
          }
          var result = !reIsDeepProp.test(value);
          return result || (object != null && value in toObject(object));
        }
        
        /**
         * Checks if `func` has a lazy counterpart.
         *
         * @private
         * @param {Function} func The function to check.
         * @returns {boolean} Returns `true` if `func` has a lazy counterpart, else `false`.
         */
        function isLaziable(func) {
          var funcName = getFuncName(func);
          if (!(funcName in LazyWrapper.prototype)) {
            return false;
          }
          var other = lodash[funcName];
          if (func === other) {
            return true;
          }
          var data = getData(other);
          return !!data && func === data[0];
        }
        
        /**
         * Checks if `value` is a valid array-like length.
         *
         * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
         */
        function isLength(value) {
          return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
        }
        
        /**
         * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
         *
         * @private
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` if suitable for strict
         *  equality comparisons, else `false`.
         */
        function isStrictComparable(value) {
          return value === value && !isObject(value);
        }
        
        /**
         * Merges the function metadata of `source` into `data`.
         *
         * Merging metadata reduces the number of wrappers required to invoke a function.
         * This is possible because methods like `_.bind`, `_.curry`, and `_.partial`
         * may be applied regardless of execution order. Methods like `_.ary` and `_.rearg`
         * augment function arguments, making the order in which they are executed important,
         * preventing the merging of metadata. However, we make an exception for a safe
         * common case where curried functions have `_.ary` and or `_.rearg` applied.
         *
         * @private
         * @param {Array} data The destination metadata.
         * @param {Array} source The source metadata.
         * @returns {Array} Returns `data`.
         */
        function mergeData(data, source) {
          var bitmask = data[1],
            srcBitmask = source[1],
            newBitmask = bitmask | srcBitmask,
            isCommon = newBitmask < ARY_FLAG;
          
          var isCombo =
            (srcBitmask == ARY_FLAG && bitmask == CURRY_FLAG) ||
            (srcBitmask == ARY_FLAG && bitmask == REARG_FLAG && data[7].length <= source[8]) ||
            (srcBitmask == (ARY_FLAG | REARG_FLAG) && bitmask == CURRY_FLAG);
          
          // Exit early if metadata can't be merged.
          if (!(isCommon || isCombo)) {
            return data;
          }
          // Use source `thisArg` if available.
          if (srcBitmask & BIND_FLAG) {
            data[2] = source[2];
            // Set when currying a bound function.
            newBitmask |= (bitmask & BIND_FLAG) ? 0 : CURRY_BOUND_FLAG;
          }
          // Compose partial arguments.
          var value = source[3];
          if (value) {
            var partials = data[3];
            data[3] = partials ? composeArgs(partials, value, source[4]) : arrayCopy(value);
            data[4] = partials ? replaceHolders(data[3], PLACEHOLDER) : arrayCopy(source[4]);
          }
          // Compose partial right arguments.
          value = source[5];
          if (value) {
            partials = data[5];
            data[5] = partials ? composeArgsRight(partials, value, source[6]) : arrayCopy(value);
            data[6] = partials ? replaceHolders(data[5], PLACEHOLDER) : arrayCopy(source[6]);
          }
          // Use source `argPos` if available.
          value = source[7];
          if (value) {
            data[7] = arrayCopy(value);
          }
          // Use source `ary` if it's smaller.
          if (srcBitmask & ARY_FLAG) {
            data[8] = data[8] == null ? source[8] : nativeMin(data[8], source[8]);
          }
          // Use source `arity` if one is not provided.
          if (data[9] == null) {
            data[9] = source[9];
          }
          // Use source `func` and merge bitmasks.
          data[0] = source[0];
          data[1] = newBitmask;
          
          return data;
        }
        
        /**
         * Used by `_.defaultsDeep` to customize its `_.merge` use.
         *
         * @private
         * @param {*} objectValue The destination object property value.
         * @param {*} sourceValue The source object property value.
         * @returns {*} Returns the value to assign to the destination object.
         */
        function mergeDefaults(objectValue, sourceValue) {
          return objectValue === undefined ? sourceValue : merge(objectValue, sourceValue, mergeDefaults);
        }
        
        /**
         * A specialized version of `_.pick` which picks `object` properties specified
         * by `props`.
         *
         * @private
         * @param {Object} object The source object.
         * @param {string[]} props The property names to pick.
         * @returns {Object} Returns the new object.
         */
        function pickByArray(object, props) {
          object = toObject(object);
          
          var index = -1,
            length = props.length,
            result = {};
          
          while (++index < length) {
            var key = props[index];
            if (key in object) {
              result[key] = object[key];
            }
          }
          return result;
        }
        
        /**
         * A specialized version of `_.pick` which picks `object` properties `predicate`
         * returns truthy for.
         *
         * @private
         * @param {Object} object The source object.
         * @param {Function} predicate The function invoked per iteration.
         * @returns {Object} Returns the new object.
         */
        function pickByCallback(object, predicate) {
          var result = {};
          baseForIn(object, function(value, key, object) {
            if (predicate(value, key, object)) {
              result[key] = value;
            }
          });
          return result;
        }
        
        /**
         * Reorder `array` according to the specified indexes where the element at
         * the first index is assigned as the first element, the element at
         * the second index is assigned as the second element, and so on.
         *
         * @private
         * @param {Array} array The array to reorder.
         * @param {Array} indexes The arranged array indexes.
         * @returns {Array} Returns `array`.
         */
        function reorder(array, indexes) {
          var arrLength = array.length,
            length = nativeMin(indexes.length, arrLength),
            oldArray = arrayCopy(array);
          
          while (length--) {
            var index = indexes[length];
            array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
          }
          return array;
        }
        
        /**
         * Sets metadata for `func`.
         *
         * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
         * period of time, it will trip its breaker and transition to an identity function
         * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)
         * for more details.
         *
         * @private
         * @param {Function} func The function to associate metadata with.
         * @param {*} data The metadata.
         * @returns {Function} Returns `func`.
         */
        var setData = (function() {
          var count = 0,
            lastCalled = 0;
          
          return function(key, value) {
            var stamp = now(),
              remaining = HOT_SPAN - (stamp - lastCalled);
            
            lastCalled = stamp;
            if (remaining > 0) {
              if (++count >= HOT_COUNT) {
                return key;
              }
            } else {
              count = 0;
            }
            return baseSetData(key, value);
          };
        }());
        
        /**
         * A fallback implementation of `Object.keys` which creates an array of the
         * own enumerable property names of `object`.
         *
         * @private
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names.
         */
        function shimKeys(object) {
          var props = keysIn(object),
            propsLength = props.length,
            length = propsLength && object.length;
          
          var allowIndexes = !!length && isLength(length) &&
            (isArray(object) || isArguments(object));
          
          var index = -1,
            result = [];
          
          while (++index < propsLength) {
            var key = props[index];
            if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
              result.push(key);
            }
          }
          return result;
        }
        
        /**
         * Converts `value` to an array-like object if it's not one.
         *
         * @private
         * @param {*} value The value to process.
         * @returns {Array|Object} Returns the array-like object.
         */
        function toIterable(value) {
          if (value == null) {
            return [];
          }
          if (!isArrayLike(value)) {
            return values(value);
          }
          return isObject(value) ? value : Object(value);
        }
        
        /**
         * Converts `value` to an object if it's not one.
         *
         * @private
         * @param {*} value The value to process.
         * @returns {Object} Returns the object.
         */
        function toObject(value) {
          return isObject(value) ? value : Object(value);
        }
        
        /**
         * Converts `value` to property path array if it's not one.
         *
         * @private
         * @param {*} value The value to process.
         * @returns {Array} Returns the property path array.
         */
        function toPath(value) {
          if (isArray(value)) {
            return value;
          }
          var result = [];
          baseToString(value).replace(rePropName, function(match, number, quote, string) {
            result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
          });
          return result;
        }
        
        /**
         * Creates a clone of `wrapper`.
         *
         * @private
         * @param {Object} wrapper The wrapper to clone.
         * @returns {Object} Returns the cloned wrapper.
         */
        function wrapperClone(wrapper) {
          return wrapper instanceof LazyWrapper
            ? wrapper.clone()
            : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Creates an array of elements split into groups the length of `size`.
         * If `collection` can't be split evenly, the final chunk will be the remaining
         * elements.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to process.
         * @param {number} [size=1] The length of each chunk.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Array} Returns the new array containing chunks.
         * @example
         *
         * _.chunk(['a', 'b', 'c', 'd'], 2);
         * // => [['a', 'b'], ['c', 'd']]
         *
         * _.chunk(['a', 'b', 'c', 'd'], 3);
         * // => [['a', 'b', 'c'], ['d']]
         */
        function chunk(array, size, guard) {
          if (guard ? isIterateeCall(array, size, guard) : size == null) {
            size = 1;
          } else {
            size = nativeMax(nativeFloor(size) || 1, 1);
          }
          var index = 0,
            length = array ? array.length : 0,
            resIndex = -1,
            result = Array(nativeCeil(length / size));
          
          while (index < length) {
            result[++resIndex] = baseSlice(array, index, (index += size));
          }
          return result;
        }
        
        /**
         * Creates an array with all falsey values removed. The values `false`, `null`,
         * `0`, `""`, `undefined`, and `NaN` are falsey.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to compact.
         * @returns {Array} Returns the new array of filtered values.
         * @example
         *
         * _.compact([0, 1, false, 2, '', 3]);
         * // => [1, 2, 3]
         */
        function compact(array) {
          var index = -1,
            length = array ? array.length : 0,
            resIndex = -1,
            result = [];
          
          while (++index < length) {
            var value = array[index];
            if (value) {
              result[++resIndex] = value;
            }
          }
          return result;
        }
        
        /**
         * Creates an array of unique `array` values not included in the other
         * provided arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {...Array} [values] The arrays of values to exclude.
         * @returns {Array} Returns the new array of filtered values.
         * @example
         *
         * _.difference([1, 2, 3], [4, 2]);
         * // => [1, 3]
         */
        var difference = restParam(function(array, values) {
          return (isObjectLike(array) && isArrayLike(array))
            ? baseDifference(array, baseFlatten(values, false, true))
            : [];
        });
        
        /**
         * Creates a slice of `array` with `n` elements dropped from the beginning.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=1] The number of elements to drop.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.drop([1, 2, 3]);
         * // => [2, 3]
         *
         * _.drop([1, 2, 3], 2);
         * // => [3]
         *
         * _.drop([1, 2, 3], 5);
         * // => []
         *
         * _.drop([1, 2, 3], 0);
         * // => [1, 2, 3]
         */
        function drop(array, n, guard) {
          var length = array ? array.length : 0;
          if (!length) {
            return [];
          }
          if (guard ? isIterateeCall(array, n, guard) : n == null) {
            n = 1;
          }
          return baseSlice(array, n < 0 ? 0 : n);
        }
        
        /**
         * Creates a slice of `array` with `n` elements dropped from the end.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=1] The number of elements to drop.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.dropRight([1, 2, 3]);
         * // => [1, 2]
         *
         * _.dropRight([1, 2, 3], 2);
         * // => [1]
         *
         * _.dropRight([1, 2, 3], 5);
         * // => []
         *
         * _.dropRight([1, 2, 3], 0);
         * // => [1, 2, 3]
         */
        function dropRight(array, n, guard) {
          var length = array ? array.length : 0;
          if (!length) {
            return [];
          }
          if (guard ? isIterateeCall(array, n, guard) : n == null) {
            n = 1;
          }
          n = length - (+n || 0);
          return baseSlice(array, 0, n < 0 ? 0 : n);
        }
        
        /**
         * Creates a slice of `array` excluding elements dropped from the end.
         * Elements are dropped until `predicate` returns falsey. The predicate is
         * bound to `thisArg` and invoked with three arguments: (value, index, array).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that match the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.dropRightWhile([1, 2, 3], function(n) {
     *   return n > 1;
     * });
         * // => [1]
         *
         * var users = [
         *   { 'user': 'barney',  'active': true },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': false }
         * ];
         *
         * // using the `_.matches` callback shorthand
         * _.pluck(_.dropRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
         * // => ['barney', 'fred']
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.pluck(_.dropRightWhile(users, 'active', false), 'user');
         * // => ['barney']
         *
         * // using the `_.property` callback shorthand
         * _.pluck(_.dropRightWhile(users, 'active'), 'user');
         * // => ['barney', 'fred', 'pebbles']
         */
        function dropRightWhile(array, predicate, thisArg) {
          return (array && array.length)
            ? baseWhile(array, getCallback(predicate, thisArg, 3), true, true)
            : [];
        }
        
        /**
         * Creates a slice of `array` excluding elements dropped from the beginning.
         * Elements are dropped until `predicate` returns falsey. The predicate is
         * bound to `thisArg` and invoked with three arguments: (value, index, array).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.dropWhile([1, 2, 3], function(n) {
     *   return n < 3;
     * });
         * // => [3]
         *
         * var users = [
         *   { 'user': 'barney',  'active': false },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': true }
         * ];
         *
         * // using the `_.matches` callback shorthand
         * _.pluck(_.dropWhile(users, { 'user': 'barney', 'active': false }), 'user');
         * // => ['fred', 'pebbles']
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.pluck(_.dropWhile(users, 'active', false), 'user');
         * // => ['pebbles']
         *
         * // using the `_.property` callback shorthand
         * _.pluck(_.dropWhile(users, 'active'), 'user');
         * // => ['barney', 'fred', 'pebbles']
         */
        function dropWhile(array, predicate, thisArg) {
          return (array && array.length)
            ? baseWhile(array, getCallback(predicate, thisArg, 3), true)
            : [];
        }
        
        /**
         * Fills elements of `array` with `value` from `start` up to, but not
         * including, `end`.
         *
         * **Note:** This method mutates `array`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to fill.
         * @param {*} value The value to fill `array` with.
         * @param {number} [start=0] The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns `array`.
         * @example
         *
         * var array = [1, 2, 3];
         *
         * _.fill(array, 'a');
         * console.log(array);
         * // => ['a', 'a', 'a']
         *
         * _.fill(Array(3), 2);
         * // => [2, 2, 2]
         *
         * _.fill([4, 6, 8], '*', 1, 2);
         * // => [4, '*', 8]
         */
        function fill(array, value, start, end) {
          var length = array ? array.length : 0;
          if (!length) {
            return [];
          }
          if (start && typeof start != 'number' && isIterateeCall(array, value, start)) {
            start = 0;
            end = length;
          }
          return baseFill(array, value, start, end);
        }
        
        /**
         * This method is like `_.find` except that it returns the index of the first
         * element `predicate` returns truthy for instead of the element itself.
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to search.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {number} Returns the index of the found element, else `-1`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'active': false },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': true }
         * ];
         *
         * _.findIndex(users, function(chr) {
     *   return chr.user == 'barney';
     * });
         * // => 0
         *
         * // using the `_.matches` callback shorthand
         * _.findIndex(users, { 'user': 'fred', 'active': false });
         * // => 1
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.findIndex(users, 'active', false);
         * // => 0
         *
         * // using the `_.property` callback shorthand
         * _.findIndex(users, 'active');
         * // => 2
         */
        var findIndex = createFindIndex();
        
        /**
         * This method is like `_.findIndex` except that it iterates over elements
         * of `collection` from right to left.
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to search.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {number} Returns the index of the found element, else `-1`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'active': true },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': false }
         * ];
         *
         * _.findLastIndex(users, function(chr) {
     *   return chr.user == 'pebbles';
     * });
         * // => 2
         *
         * // using the `_.matches` callback shorthand
         * _.findLastIndex(users, { 'user': 'barney', 'active': true });
         * // => 0
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.findLastIndex(users, 'active', false);
         * // => 2
         *
         * // using the `_.property` callback shorthand
         * _.findLastIndex(users, 'active');
         * // => 0
         */
        var findLastIndex = createFindIndex(true);
        
        /**
         * Gets the first element of `array`.
         *
         * @static
         * @memberOf _
         * @alias head
         * @category Array
         * @param {Array} array The array to query.
         * @returns {*} Returns the first element of `array`.
         * @example
         *
         * _.first([1, 2, 3]);
         * // => 1
         *
         * _.first([]);
         * // => undefined
         */
        function first(array) {
          return array ? array[0] : undefined;
        }
        
        /**
         * Flattens a nested array. If `isDeep` is `true` the array is recursively
         * flattened, otherwise it is only flattened a single level.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to flatten.
         * @param {boolean} [isDeep] Specify a deep flatten.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Array} Returns the new flattened array.
         * @example
         *
         * _.flatten([1, [2, 3, [4]]]);
         * // => [1, 2, 3, [4]]
         *
         * // using `isDeep`
         * _.flatten([1, [2, 3, [4]]], true);
         * // => [1, 2, 3, 4]
         */
        function flatten(array, isDeep, guard) {
          var length = array ? array.length : 0;
          if (guard && isIterateeCall(array, isDeep, guard)) {
            isDeep = false;
          }
          return length ? baseFlatten(array, isDeep) : [];
        }
        
        /**
         * Recursively flattens a nested array.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to recursively flatten.
         * @returns {Array} Returns the new flattened array.
         * @example
         *
         * _.flattenDeep([1, [2, 3, [4]]]);
         * // => [1, 2, 3, 4]
         */
        function flattenDeep(array) {
          var length = array ? array.length : 0;
          return length ? baseFlatten(array, true) : [];
        }
        
        /**
         * Gets the index at which the first occurrence of `value` is found in `array`
         * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
         * for equality comparisons. If `fromIndex` is negative, it is used as the offset
         * from the end of `array`. If `array` is sorted providing `true` for `fromIndex`
         * performs a faster binary search.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to search.
         * @param {*} value The value to search for.
         * @param {boolean|number} [fromIndex=0] The index to search from or `true`
         *  to perform a binary search on a sorted array.
         * @returns {number} Returns the index of the matched value, else `-1`.
         * @example
         *
         * _.indexOf([1, 2, 1, 2], 2);
         * // => 1
         *
         * // using `fromIndex`
         * _.indexOf([1, 2, 1, 2], 2, 2);
         * // => 3
         *
         * // performing a binary search
         * _.indexOf([1, 1, 2, 2], 2, true);
         * // => 2
         */
        function indexOf(array, value, fromIndex) {
          var length = array ? array.length : 0;
          if (!length) {
            return -1;
          }
          if (typeof fromIndex == 'number') {
            fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
          } else if (fromIndex) {
            var index = binaryIndex(array, value);
            if (index < length &&
              (value === value ? (value === array[index]) : (array[index] !== array[index]))) {
              return index;
            }
            return -1;
          }
          return baseIndexOf(array, value, fromIndex || 0);
        }
        
        /**
         * Gets all but the last element of `array`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.initial([1, 2, 3]);
         * // => [1, 2]
         */
        function initial(array) {
          return dropRight(array, 1);
        }
        
        /**
         * Creates an array of unique values that are included in all of the provided
         * arrays using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @returns {Array} Returns the new array of shared values.
         * @example
         * _.intersection([1, 2], [4, 2], [2, 1]);
         * // => [2]
         */
        var intersection = restParam(function(arrays) {
          var othLength = arrays.length,
            othIndex = othLength,
            caches = Array(length),
            indexOf = getIndexOf(),
            isCommon = indexOf == baseIndexOf,
            result = [];
          
          while (othIndex--) {
            var value = arrays[othIndex] = isArrayLike(value = arrays[othIndex]) ? value : [];
            caches[othIndex] = (isCommon && value.length >= 120) ? createCache(othIndex && value) : null;
          }
          var array = arrays[0],
            index = -1,
            length = array ? array.length : 0,
            seen = caches[0];
          
          outer:
            while (++index < length) {
              value = array[index];
              if ((seen ? cacheIndexOf(seen, value) : indexOf(result, value, 0)) < 0) {
                var othIndex = othLength;
                while (--othIndex) {
                  var cache = caches[othIndex];
                  if ((cache ? cacheIndexOf(cache, value) : indexOf(arrays[othIndex], value, 0)) < 0) {
                    continue outer;
                  }
                }
                if (seen) {
                  seen.push(value);
                }
                result.push(value);
              }
            }
          return result;
        });
        
        /**
         * Gets the last element of `array`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @returns {*} Returns the last element of `array`.
         * @example
         *
         * _.last([1, 2, 3]);
         * // => 3
         */
        function last(array) {
          var length = array ? array.length : 0;
          return length ? array[length - 1] : undefined;
        }
        
        /**
         * This method is like `_.indexOf` except that it iterates over elements of
         * `array` from right to left.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to search.
         * @param {*} value The value to search for.
         * @param {boolean|number} [fromIndex=array.length-1] The index to search from
         *  or `true` to perform a binary search on a sorted array.
         * @returns {number} Returns the index of the matched value, else `-1`.
         * @example
         *
         * _.lastIndexOf([1, 2, 1, 2], 2);
         * // => 3
         *
         * // using `fromIndex`
         * _.lastIndexOf([1, 2, 1, 2], 2, 2);
         * // => 1
         *
         * // performing a binary search
         * _.lastIndexOf([1, 1, 2, 2], 2, true);
         * // => 3
         */
        function lastIndexOf(array, value, fromIndex) {
          var length = array ? array.length : 0;
          if (!length) {
            return -1;
          }
          var index = length;
          if (typeof fromIndex == 'number') {
            index = (fromIndex < 0 ? nativeMax(length + fromIndex, 0) : nativeMin(fromIndex || 0, length - 1)) + 1;
          } else if (fromIndex) {
            index = binaryIndex(array, value, true) - 1;
            var other = array[index];
            if (value === value ? (value === other) : (other !== other)) {
              return index;
            }
            return -1;
          }
          if (value !== value) {
            return indexOfNaN(array, index, true);
          }
          while (index--) {
            if (array[index] === value) {
              return index;
            }
          }
          return -1;
        }
        
        /**
         * Removes all provided values from `array` using
         * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * **Note:** Unlike `_.without`, this method mutates `array`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to modify.
         * @param {...*} [values] The values to remove.
         * @returns {Array} Returns `array`.
         * @example
         *
         * var array = [1, 2, 3, 1, 2, 3];
         *
         * _.pull(array, 2, 3);
         * console.log(array);
         * // => [1, 1]
         */
        function pull() {
          var args = arguments,
            array = args[0];
          
          if (!(array && array.length)) {
            return array;
          }
          var index = 0,
            indexOf = getIndexOf(),
            length = args.length;
          
          while (++index < length) {
            var fromIndex = 0,
              value = args[index];
            
            while ((fromIndex = indexOf(array, value, fromIndex)) > -1) {
              splice.call(array, fromIndex, 1);
            }
          }
          return array;
        }
        
        /**
         * Removes elements from `array` corresponding to the given indexes and returns
         * an array of the removed elements. Indexes may be specified as an array of
         * indexes or as individual arguments.
         *
         * **Note:** Unlike `_.at`, this method mutates `array`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to modify.
         * @param {...(number|number[])} [indexes] The indexes of elements to remove,
         *  specified as individual indexes or arrays of indexes.
         * @returns {Array} Returns the new array of removed elements.
         * @example
         *
         * var array = [5, 10, 15, 20];
         * var evens = _.pullAt(array, 1, 3);
         *
         * console.log(array);
         * // => [5, 15]
         *
         * console.log(evens);
         * // => [10, 20]
         */
        var pullAt = restParam(function(array, indexes) {
          indexes = baseFlatten(indexes);
          
          var result = baseAt(array, indexes);
          basePullAt(array, indexes.sort(baseCompareAscending));
          return result;
        });
        
        /**
         * Removes all elements from `array` that `predicate` returns truthy for
         * and returns an array of the removed elements. The predicate is bound to
         * `thisArg` and invoked with three arguments: (value, index, array).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * **Note:** Unlike `_.filter`, this method mutates `array`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to modify.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Array} Returns the new array of removed elements.
         * @example
         *
         * var array = [1, 2, 3, 4];
         * var evens = _.remove(array, function(n) {
     *   return n % 2 == 0;
     * });
         *
         * console.log(array);
         * // => [1, 3]
         *
         * console.log(evens);
         * // => [2, 4]
         */
        function remove(array, predicate, thisArg) {
          var result = [];
          if (!(array && array.length)) {
            return result;
          }
          var index = -1,
            indexes = [],
            length = array.length;
          
          predicate = getCallback(predicate, thisArg, 3);
          while (++index < length) {
            var value = array[index];
            if (predicate(value, index, array)) {
              result.push(value);
              indexes.push(index);
            }
          }
          basePullAt(array, indexes);
          return result;
        }
        
        /**
         * Gets all but the first element of `array`.
         *
         * @static
         * @memberOf _
         * @alias tail
         * @category Array
         * @param {Array} array The array to query.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.rest([1, 2, 3]);
         * // => [2, 3]
         */
        function rest(array) {
          return drop(array, 1);
        }
        
        /**
         * Creates a slice of `array` from `start` up to, but not including, `end`.
         *
         * **Note:** This method is used instead of `Array#slice` to support node
         * lists in IE < 9 and to ensure dense arrays are returned.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to slice.
         * @param {number} [start=0] The start position.
         * @param {number} [end=array.length] The end position.
         * @returns {Array} Returns the slice of `array`.
         */
        function slice(array, start, end) {
          var length = array ? array.length : 0;
          if (!length) {
            return [];
          }
          if (end && typeof end != 'number' && isIterateeCall(array, start, end)) {
            start = 0;
            end = length;
          }
          return baseSlice(array, start, end);
        }
        
        /**
         * Uses a binary search to determine the lowest index at which `value` should
         * be inserted into `array` in order to maintain its sort order. If an iteratee
         * function is provided it is invoked for `value` and each element of `array`
         * to compute their sort ranking. The iteratee is bound to `thisArg` and
         * invoked with one argument; (value).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         * @example
         *
         * _.sortedIndex([30, 50], 40);
         * // => 1
         *
         * _.sortedIndex([4, 4, 5, 5], 5);
         * // => 2
         *
         * var dict = { 'data': { 'thirty': 30, 'forty': 40, 'fifty': 50 } };
         *
         * // using an iteratee function
         * _.sortedIndex(['thirty', 'fifty'], 'forty', function(word) {
     *   return this.data[word];
     * }, dict);
         * // => 1
         *
         * // using the `_.property` callback shorthand
         * _.sortedIndex([{ 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
         * // => 1
         */
        var sortedIndex = createSortedIndex();
        
        /**
         * This method is like `_.sortedIndex` except that it returns the highest
         * index at which `value` should be inserted into `array` in order to
         * maintain its sort order.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The sorted array to inspect.
         * @param {*} value The value to evaluate.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {number} Returns the index at which `value` should be inserted
         *  into `array`.
         * @example
         *
         * _.sortedLastIndex([4, 4, 5, 5], 5);
         * // => 4
         */
        var sortedLastIndex = createSortedIndex(true);
        
        /**
         * Creates a slice of `array` with `n` elements taken from the beginning.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=1] The number of elements to take.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.take([1, 2, 3]);
         * // => [1]
         *
         * _.take([1, 2, 3], 2);
         * // => [1, 2]
         *
         * _.take([1, 2, 3], 5);
         * // => [1, 2, 3]
         *
         * _.take([1, 2, 3], 0);
         * // => []
         */
        function take(array, n, guard) {
          var length = array ? array.length : 0;
          if (!length) {
            return [];
          }
          if (guard ? isIterateeCall(array, n, guard) : n == null) {
            n = 1;
          }
          return baseSlice(array, 0, n < 0 ? 0 : n);
        }
        
        /**
         * Creates a slice of `array` with `n` elements taken from the end.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @param {number} [n=1] The number of elements to take.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.takeRight([1, 2, 3]);
         * // => [3]
         *
         * _.takeRight([1, 2, 3], 2);
         * // => [2, 3]
         *
         * _.takeRight([1, 2, 3], 5);
         * // => [1, 2, 3]
         *
         * _.takeRight([1, 2, 3], 0);
         * // => []
         */
        function takeRight(array, n, guard) {
          var length = array ? array.length : 0;
          if (!length) {
            return [];
          }
          if (guard ? isIterateeCall(array, n, guard) : n == null) {
            n = 1;
          }
          n = length - (+n || 0);
          return baseSlice(array, n < 0 ? 0 : n);
        }
        
        /**
         * Creates a slice of `array` with elements taken from the end. Elements are
         * taken until `predicate` returns falsey. The predicate is bound to `thisArg`
         * and invoked with three arguments: (value, index, array).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.takeRightWhile([1, 2, 3], function(n) {
     *   return n > 1;
     * });
         * // => [2, 3]
         *
         * var users = [
         *   { 'user': 'barney',  'active': true },
         *   { 'user': 'fred',    'active': false },
         *   { 'user': 'pebbles', 'active': false }
         * ];
         *
         * // using the `_.matches` callback shorthand
         * _.pluck(_.takeRightWhile(users, { 'user': 'pebbles', 'active': false }), 'user');
         * // => ['pebbles']
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.pluck(_.takeRightWhile(users, 'active', false), 'user');
         * // => ['fred', 'pebbles']
         *
         * // using the `_.property` callback shorthand
         * _.pluck(_.takeRightWhile(users, 'active'), 'user');
         * // => []
         */
        function takeRightWhile(array, predicate, thisArg) {
          return (array && array.length)
            ? baseWhile(array, getCallback(predicate, thisArg, 3), false, true)
            : [];
        }
        
        /**
         * Creates a slice of `array` with elements taken from the beginning. Elements
         * are taken until `predicate` returns falsey. The predicate is bound to
         * `thisArg` and invoked with three arguments: (value, index, array).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to query.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Array} Returns the slice of `array`.
         * @example
         *
         * _.takeWhile([1, 2, 3], function(n) {
     *   return n < 3;
     * });
         * // => [1, 2]
         *
         * var users = [
         *   { 'user': 'barney',  'active': false },
         *   { 'user': 'fred',    'active': false},
         *   { 'user': 'pebbles', 'active': true }
         * ];
         *
         * // using the `_.matches` callback shorthand
         * _.pluck(_.takeWhile(users, { 'user': 'barney', 'active': false }), 'user');
         * // => ['barney']
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.pluck(_.takeWhile(users, 'active', false), 'user');
         * // => ['barney', 'fred']
         *
         * // using the `_.property` callback shorthand
         * _.pluck(_.takeWhile(users, 'active'), 'user');
         * // => []
         */
        function takeWhile(array, predicate, thisArg) {
          return (array && array.length)
            ? baseWhile(array, getCallback(predicate, thisArg, 3))
            : [];
        }
        
        /**
         * Creates an array of unique values, in order, from all of the provided arrays
         * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @returns {Array} Returns the new array of combined values.
         * @example
         *
         * _.union([1, 2], [4, 2], [2, 1]);
         * // => [1, 2, 4]
         */
        var union = restParam(function(arrays) {
          return baseUniq(baseFlatten(arrays, false, true));
        });
        
        /**
         * Creates a duplicate-free version of an array, using
         * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
         * for equality comparisons, in which only the first occurence of each element
         * is kept. Providing `true` for `isSorted` performs a faster search algorithm
         * for sorted arrays. If an iteratee function is provided it is invoked for
         * each element in the array to generate the criterion by which uniqueness
         * is computed. The `iteratee` is bound to `thisArg` and invoked with three
         * arguments: (value, index, array).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @alias unique
         * @category Array
         * @param {Array} array The array to inspect.
         * @param {boolean} [isSorted] Specify the array is sorted.
         * @param {Function|Object|string} [iteratee] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Array} Returns the new duplicate-value-free array.
         * @example
         *
         * _.uniq([2, 1, 2]);
         * // => [2, 1]
         *
         * // using `isSorted`
         * _.uniq([1, 1, 2], true);
         * // => [1, 2]
         *
         * // using an iteratee function
         * _.uniq([1, 2.5, 1.5, 2], function(n) {
     *   return this.floor(n);
     * }, Math);
         * // => [1, 2.5]
         *
         * // using the `_.property` callback shorthand
         * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
         * // => [{ 'x': 1 }, { 'x': 2 }]
         */
        function uniq(array, isSorted, iteratee, thisArg) {
          var length = array ? array.length : 0;
          if (!length) {
            return [];
          }
          if (isSorted != null && typeof isSorted != 'boolean') {
            thisArg = iteratee;
            iteratee = isIterateeCall(array, isSorted, thisArg) ? undefined : isSorted;
            isSorted = false;
          }
          var callback = getCallback();
          if (!(iteratee == null && callback === baseCallback)) {
            iteratee = callback(iteratee, thisArg, 3);
          }
          return (isSorted && getIndexOf() == baseIndexOf)
            ? sortedUniq(array, iteratee)
            : baseUniq(array, iteratee);
        }
        
        /**
         * This method is like `_.zip` except that it accepts an array of grouped
         * elements and creates an array regrouping the elements to their pre-zip
         * configuration.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array of grouped elements to process.
         * @returns {Array} Returns the new array of regrouped elements.
         * @example
         *
         * var zipped = _.zip(['fred', 'barney'], [30, 40], [true, false]);
         * // => [['fred', 30, true], ['barney', 40, false]]
         *
         * _.unzip(zipped);
         * // => [['fred', 'barney'], [30, 40], [true, false]]
         */
        function unzip(array) {
          if (!(array && array.length)) {
            return [];
          }
          var index = -1,
            length = 0;
          
          array = arrayFilter(array, function(group) {
            if (isArrayLike(group)) {
              length = nativeMax(group.length, length);
              return true;
            }
          });
          var result = Array(length);
          while (++index < length) {
            result[index] = arrayMap(array, baseProperty(index));
          }
          return result;
        }
        
        /**
         * This method is like `_.unzip` except that it accepts an iteratee to specify
         * how regrouped values should be combined. The `iteratee` is bound to `thisArg`
         * and invoked with four arguments: (accumulator, value, index, group).
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array of grouped elements to process.
         * @param {Function} [iteratee] The function to combine regrouped values.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Array} Returns the new array of regrouped elements.
         * @example
         *
         * var zipped = _.zip([1, 2], [10, 20], [100, 200]);
         * // => [[1, 10, 100], [2, 20, 200]]
         *
         * _.unzipWith(zipped, _.add);
         * // => [3, 30, 300]
         */
        function unzipWith(array, iteratee, thisArg) {
          var length = array ? array.length : 0;
          if (!length) {
            return [];
          }
          var result = unzip(array);
          if (iteratee == null) {
            return result;
          }
          iteratee = bindCallback(iteratee, thisArg, 4);
          return arrayMap(result, function(group) {
            return arrayReduce(group, iteratee, undefined, true);
          });
        }
        
        /**
         * Creates an array excluding all provided values using
         * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
         * for equality comparisons.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {Array} array The array to filter.
         * @param {...*} [values] The values to exclude.
         * @returns {Array} Returns the new array of filtered values.
         * @example
         *
         * _.without([1, 2, 1, 3], 1, 2);
         * // => [3]
         */
        var without = restParam(function(array, values) {
          return isArrayLike(array)
            ? baseDifference(array, values)
            : [];
        });
        
        /**
         * Creates an array of unique values that is the [symmetric difference](https://en.wikipedia.org/wiki/Symmetric_difference)
         * of the provided arrays.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {...Array} [arrays] The arrays to inspect.
         * @returns {Array} Returns the new array of values.
         * @example
         *
         * _.xor([1, 2], [4, 2]);
         * // => [1, 4]
         */
        function xor() {
          var index = -1,
            length = arguments.length;
          
          while (++index < length) {
            var array = arguments[index];
            if (isArrayLike(array)) {
              var result = result
                ? arrayPush(baseDifference(result, array), baseDifference(array, result))
                : array;
            }
          }
          return result ? baseUniq(result) : [];
        }
        
        /**
         * Creates an array of grouped elements, the first of which contains the first
         * elements of the given arrays, the second of which contains the second elements
         * of the given arrays, and so on.
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {...Array} [arrays] The arrays to process.
         * @returns {Array} Returns the new array of grouped elements.
         * @example
         *
         * _.zip(['fred', 'barney'], [30, 40], [true, false]);
         * // => [['fred', 30, true], ['barney', 40, false]]
         */
        var zip = restParam(unzip);
        
        /**
         * The inverse of `_.pairs`; this method returns an object composed from arrays
         * of property names and values. Provide either a single two dimensional array,
         * e.g. `[[key1, value1], [key2, value2]]` or two arrays, one of property names
         * and one of corresponding values.
         *
         * @static
         * @memberOf _
         * @alias object
         * @category Array
         * @param {Array} props The property names.
         * @param {Array} [values=[]] The property values.
         * @returns {Object} Returns the new object.
         * @example
         *
         * _.zipObject([['fred', 30], ['barney', 40]]);
         * // => { 'fred': 30, 'barney': 40 }
         *
         * _.zipObject(['fred', 'barney'], [30, 40]);
         * // => { 'fred': 30, 'barney': 40 }
         */
        function zipObject(props, values) {
          var index = -1,
            length = props ? props.length : 0,
            result = {};
          
          if (length && !values && !isArray(props[0])) {
            values = [];
          }
          while (++index < length) {
            var key = props[index];
            if (values) {
              result[key] = values[index];
            } else if (key) {
              result[key[0]] = key[1];
            }
          }
          return result;
        }
        
        /**
         * This method is like `_.zip` except that it accepts an iteratee to specify
         * how grouped values should be combined. The `iteratee` is bound to `thisArg`
         * and invoked with four arguments: (accumulator, value, index, group).
         *
         * @static
         * @memberOf _
         * @category Array
         * @param {...Array} [arrays] The arrays to process.
         * @param {Function} [iteratee] The function to combine grouped values.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Array} Returns the new array of grouped elements.
         * @example
         *
         * _.zipWith([1, 2], [10, 20], [100, 200], _.add);
         * // => [111, 222]
         */
        var zipWith = restParam(function(arrays) {
          var length = arrays.length,
            iteratee = length > 2 ? arrays[length - 2] : undefined,
            thisArg = length > 1 ? arrays[length - 1] : undefined;
          
          if (length > 2 && typeof iteratee == 'function') {
            length -= 2;
          } else {
            iteratee = (length > 1 && typeof thisArg == 'function') ? (--length, thisArg) : undefined;
            thisArg = undefined;
          }
          arrays.length = length;
          return unzipWith(arrays, iteratee, thisArg);
        });
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Creates a `lodash` object that wraps `value` with explicit method
         * chaining enabled.
         *
         * @static
         * @memberOf _
         * @category Chain
         * @param {*} value The value to wrap.
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'age': 36 },
         *   { 'user': 'fred',    'age': 40 },
         *   { 'user': 'pebbles', 'age': 1 }
         * ];
         *
         * var youngest = _.chain(users)
         *   .sortBy('age')
         *   .map(function(chr) {
     *     return chr.user + ' is ' + chr.age;
     *   })
         *   .first()
         *   .value();
         * // => 'pebbles is 1'
         */
        function chain(value) {
          var result = lodash(value);
          result.__chain__ = true;
          return result;
        }
        
        /**
         * This method invokes `interceptor` and returns `value`. The interceptor is
         * bound to `thisArg` and invoked with one argument; (value). The purpose of
         * this method is to "tap into" a method chain in order to perform operations
         * on intermediate results within the chain.
         *
         * @static
         * @memberOf _
         * @category Chain
         * @param {*} value The value to provide to `interceptor`.
         * @param {Function} interceptor The function to invoke.
         * @param {*} [thisArg] The `this` binding of `interceptor`.
         * @returns {*} Returns `value`.
         * @example
         *
         * _([1, 2, 3])
         *  .tap(function(array) {
     *    array.pop();
     *  })
         *  .reverse()
         *  .value();
         * // => [2, 1]
         */
        function tap(value, interceptor, thisArg) {
          interceptor.call(thisArg, value);
          return value;
        }
        
        /**
         * This method is like `_.tap` except that it returns the result of `interceptor`.
         *
         * @static
         * @memberOf _
         * @category Chain
         * @param {*} value The value to provide to `interceptor`.
         * @param {Function} interceptor The function to invoke.
         * @param {*} [thisArg] The `this` binding of `interceptor`.
         * @returns {*} Returns the result of `interceptor`.
         * @example
         *
         * _('  abc  ')
         *  .chain()
         *  .trim()
         *  .thru(function(value) {
     *    return [value];
     *  })
         *  .value();
         * // => ['abc']
         */
        function thru(value, interceptor, thisArg) {
          return interceptor.call(thisArg, value);
        }
        
        /**
         * Enables explicit method chaining on the wrapper object.
         *
         * @name chain
         * @memberOf _
         * @category Chain
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36 },
         *   { 'user': 'fred',   'age': 40 }
         * ];
         *
         * // without explicit chaining
         * _(users).first();
         * // => { 'user': 'barney', 'age': 36 }
         *
         * // with explicit chaining
         * _(users).chain()
         *   .first()
         *   .pick('user')
         *   .value();
         * // => { 'user': 'barney' }
         */
        function wrapperChain() {
          return chain(this);
        }
        
        /**
         * Executes the chained sequence and returns the wrapped result.
         *
         * @name commit
         * @memberOf _
         * @category Chain
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var array = [1, 2];
         * var wrapped = _(array).push(3);
         *
         * console.log(array);
         * // => [1, 2]
         *
         * wrapped = wrapped.commit();
         * console.log(array);
         * // => [1, 2, 3]
         *
         * wrapped.last();
         * // => 3
         *
         * console.log(array);
         * // => [1, 2, 3]
         */
        function wrapperCommit() {
          return new LodashWrapper(this.value(), this.__chain__);
        }
        
        /**
         * Creates a new array joining a wrapped array with any additional arrays
         * and/or values.
         *
         * @name concat
         * @memberOf _
         * @category Chain
         * @param {...*} [values] The values to concatenate.
         * @returns {Array} Returns the new concatenated array.
         * @example
         *
         * var array = [1];
         * var wrapped = _(array).concat(2, [3], [[4]]);
         *
         * console.log(wrapped.value());
         * // => [1, 2, 3, [4]]
         *
         * console.log(array);
         * // => [1]
         */
        var wrapperConcat = restParam(function(values) {
          values = baseFlatten(values);
          return this.thru(function(array) {
            return arrayConcat(isArray(array) ? array : [toObject(array)], values);
          });
        });
        
        /**
         * Creates a clone of the chained sequence planting `value` as the wrapped value.
         *
         * @name plant
         * @memberOf _
         * @category Chain
         * @returns {Object} Returns the new `lodash` wrapper instance.
         * @example
         *
         * var array = [1, 2];
         * var wrapped = _(array).map(function(value) {
     *   return Math.pow(value, 2);
     * });
         *
         * var other = [3, 4];
         * var otherWrapped = wrapped.plant(other);
         *
         * otherWrapped.value();
         * // => [9, 16]
         *
         * wrapped.value();
         * // => [1, 4]
         */
        function wrapperPlant(value) {
          var result,
            parent = this;
          
          while (parent instanceof baseLodash) {
            var clone = wrapperClone(parent);
            if (result) {
              previous.__wrapped__ = clone;
            } else {
              result = clone;
            }
            var previous = clone;
            parent = parent.__wrapped__;
          }
          previous.__wrapped__ = value;
          return result;
        }
        
        /**
         * Reverses the wrapped array so the first element becomes the last, the
         * second element becomes the second to last, and so on.
         *
         * **Note:** This method mutates the wrapped array.
         *
         * @name reverse
         * @memberOf _
         * @category Chain
         * @returns {Object} Returns the new reversed `lodash` wrapper instance.
         * @example
         *
         * var array = [1, 2, 3];
         *
         * _(array).reverse().value()
         * // => [3, 2, 1]
         *
         * console.log(array);
         * // => [3, 2, 1]
         */
        function wrapperReverse() {
          var value = this.__wrapped__;
          
          var interceptor = function(value) {
            return (wrapped && wrapped.__dir__ < 0) ? value : value.reverse();
          };
          if (value instanceof LazyWrapper) {
            var wrapped = value;
            if (this.__actions__.length) {
              wrapped = new LazyWrapper(this);
            }
            wrapped = wrapped.reverse();
            wrapped.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
            return new LodashWrapper(wrapped, this.__chain__);
          }
          return this.thru(interceptor);
        }
        
        /**
         * Produces the result of coercing the unwrapped value to a string.
         *
         * @name toString
         * @memberOf _
         * @category Chain
         * @returns {string} Returns the coerced string value.
         * @example
         *
         * _([1, 2, 3]).toString();
         * // => '1,2,3'
         */
        function wrapperToString() {
          return (this.value() + '');
        }
        
        /**
         * Executes the chained sequence to extract the unwrapped value.
         *
         * @name value
         * @memberOf _
         * @alias run, toJSON, valueOf
         * @category Chain
         * @returns {*} Returns the resolved unwrapped value.
         * @example
         *
         * _([1, 2, 3]).value();
         * // => [1, 2, 3]
         */
        function wrapperValue() {
          return baseWrapperValue(this.__wrapped__, this.__actions__);
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Creates an array of elements corresponding to the given keys, or indexes,
         * of `collection`. Keys may be specified as individual arguments or as arrays
         * of keys.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {...(number|number[]|string|string[])} [props] The property names
         *  or indexes of elements to pick, specified individually or in arrays.
         * @returns {Array} Returns the new array of picked elements.
         * @example
         *
         * _.at(['a', 'b', 'c'], [0, 2]);
         * // => ['a', 'c']
         *
         * _.at(['barney', 'fred', 'pebbles'], 0, 2);
         * // => ['barney', 'pebbles']
         */
        var at = restParam(function(collection, props) {
          return baseAt(collection, baseFlatten(props));
        });
        
        /**
         * Creates an object composed of keys generated from the results of running
         * each element of `collection` through `iteratee`. The corresponding value
         * of each key is the number of times the key was returned by `iteratee`.
         * The `iteratee` is bound to `thisArg` and invoked with three arguments:
         * (value, index|key, collection).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns the composed aggregate object.
         * @example
         *
         * _.countBy([4.3, 6.1, 6.4], function(n) {
     *   return Math.floor(n);
     * });
         * // => { '4': 1, '6': 2 }
         *
         * _.countBy([4.3, 6.1, 6.4], function(n) {
     *   return this.floor(n);
     * }, Math);
         * // => { '4': 1, '6': 2 }
         *
         * _.countBy(['one', 'two', 'three'], 'length');
         * // => { '3': 2, '5': 1 }
         */
        var countBy = createAggregator(function(result, value, key) {
          hasOwnProperty.call(result, key) ? ++result[key] : (result[key] = 1);
        });
        
        /**
         * Checks if `predicate` returns truthy for **all** elements of `collection`.
         * The predicate is bound to `thisArg` and invoked with three arguments:
         * (value, index|key, collection).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @alias all
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {boolean} Returns `true` if all elements pass the predicate check,
         *  else `false`.
         * @example
         *
         * _.every([true, 1, null, 'yes'], Boolean);
         * // => false
         *
         * var users = [
         *   { 'user': 'barney', 'active': false },
         *   { 'user': 'fred',   'active': false }
         * ];
         *
         * // using the `_.matches` callback shorthand
         * _.every(users, { 'user': 'barney', 'active': false });
         * // => false
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.every(users, 'active', false);
         * // => true
         *
         * // using the `_.property` callback shorthand
         * _.every(users, 'active');
         * // => false
         */
        function every(collection, predicate, thisArg) {
          var func = isArray(collection) ? arrayEvery : baseEvery;
          if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
            predicate = undefined;
          }
          if (typeof predicate != 'function' || thisArg !== undefined) {
            predicate = getCallback(predicate, thisArg, 3);
          }
          return func(collection, predicate);
        }
        
        /**
         * Iterates over elements of `collection`, returning an array of all elements
         * `predicate` returns truthy for. The predicate is bound to `thisArg` and
         * invoked with three arguments: (value, index|key, collection).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @alias select
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Array} Returns the new filtered array.
         * @example
         *
         * _.filter([4, 5, 6], function(n) {
     *   return n % 2 == 0;
     * });
         * // => [4, 6]
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': true },
         *   { 'user': 'fred',   'age': 40, 'active': false }
         * ];
         *
         * // using the `_.matches` callback shorthand
         * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
         * // => ['barney']
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.pluck(_.filter(users, 'active', false), 'user');
         * // => ['fred']
         *
         * // using the `_.property` callback shorthand
         * _.pluck(_.filter(users, 'active'), 'user');
         * // => ['barney']
         */
        function filter(collection, predicate, thisArg) {
          var func = isArray(collection) ? arrayFilter : baseFilter;
          predicate = getCallback(predicate, thisArg, 3);
          return func(collection, predicate);
        }
        
        /**
         * Iterates over elements of `collection`, returning the first element
         * `predicate` returns truthy for. The predicate is bound to `thisArg` and
         * invoked with three arguments: (value, index|key, collection).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @alias detect
         * @category Collection
         * @param {Array|Object|string} collection The collection to search.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {*} Returns the matched element, else `undefined`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney',  'age': 36, 'active': true },
         *   { 'user': 'fred',    'age': 40, 'active': false },
         *   { 'user': 'pebbles', 'age': 1,  'active': true }
         * ];
         *
         * _.result(_.find(users, function(chr) {
     *   return chr.age < 40;
     * }), 'user');
         * // => 'barney'
         *
         * // using the `_.matches` callback shorthand
         * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
         * // => 'pebbles'
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.result(_.find(users, 'active', false), 'user');
         * // => 'fred'
         *
         * // using the `_.property` callback shorthand
         * _.result(_.find(users, 'active'), 'user');
         * // => 'barney'
         */
        var find = createFind(baseEach);
        
        /**
         * This method is like `_.find` except that it iterates over elements of
         * `collection` from right to left.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to search.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {*} Returns the matched element, else `undefined`.
         * @example
         *
         * _.findLast([1, 2, 3, 4], function(n) {
     *   return n % 2 == 1;
     * });
         * // => 3
         */
        var findLast = createFind(baseEachRight, true);
        
        /**
         * Performs a deep comparison between each element in `collection` and the
         * source object, returning the first element that has equivalent property
         * values.
         *
         * **Note:** This method supports comparing arrays, booleans, `Date` objects,
         * numbers, `Object` objects, regexes, and strings. Objects are compared by
         * their own, not inherited, enumerable properties. For comparing a single
         * own or inherited property value see `_.matchesProperty`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to search.
         * @param {Object} source The object of property values to match.
         * @returns {*} Returns the matched element, else `undefined`.
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': true },
         *   { 'user': 'fred',   'age': 40, 'active': false }
         * ];
         *
         * _.result(_.findWhere(users, { 'age': 36, 'active': true }), 'user');
         * // => 'barney'
         *
         * _.result(_.findWhere(users, { 'age': 40, 'active': false }), 'user');
         * // => 'fred'
         */
        function findWhere(collection, source) {
          return find(collection, baseMatches(source));
        }
        
        /**
         * Iterates over elements of `collection` invoking `iteratee` for each element.
         * The `iteratee` is bound to `thisArg` and invoked with three arguments:
         * (value, index|key, collection). Iteratee functions may exit iteration early
         * by explicitly returning `false`.
         *
         * **Note:** As with other "Collections" methods, objects with a "length" property
         * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
         * may be used for object iteration.
         *
         * @static
         * @memberOf _
         * @alias each
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Array|Object|string} Returns `collection`.
         * @example
         *
         * _([1, 2]).forEach(function(n) {
     *   console.log(n);
     * }).value();
         * // => logs each value from left to right and returns the array
         *
         * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
     *   console.log(n, key);
     * });
         * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
         */
        var forEach = createForEach(arrayEach, baseEach);
        
        /**
         * This method is like `_.forEach` except that it iterates over elements of
         * `collection` from right to left.
         *
         * @static
         * @memberOf _
         * @alias eachRight
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Array|Object|string} Returns `collection`.
         * @example
         *
         * _([1, 2]).forEachRight(function(n) {
     *   console.log(n);
     * }).value();
         * // => logs each value from right to left and returns the array
         */
        var forEachRight = createForEach(arrayEachRight, baseEachRight);
        
        /**
         * Creates an object composed of keys generated from the results of running
         * each element of `collection` through `iteratee`. The corresponding value
         * of each key is an array of the elements responsible for generating the key.
         * The `iteratee` is bound to `thisArg` and invoked with three arguments:
         * (value, index|key, collection).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns the composed aggregate object.
         * @example
         *
         * _.groupBy([4.2, 6.1, 6.4], function(n) {
     *   return Math.floor(n);
     * });
         * // => { '4': [4.2], '6': [6.1, 6.4] }
         *
         * _.groupBy([4.2, 6.1, 6.4], function(n) {
     *   return this.floor(n);
     * }, Math);
         * // => { '4': [4.2], '6': [6.1, 6.4] }
         *
         * // using the `_.property` callback shorthand
         * _.groupBy(['one', 'two', 'three'], 'length');
         * // => { '3': ['one', 'two'], '5': ['three'] }
         */
        var groupBy = createAggregator(function(result, value, key) {
          if (hasOwnProperty.call(result, key)) {
            result[key].push(value);
          } else {
            result[key] = [value];
          }
        });
        
        /**
         * Checks if `value` is in `collection` using
         * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
         * for equality comparisons. If `fromIndex` is negative, it is used as the offset
         * from the end of `collection`.
         *
         * @static
         * @memberOf _
         * @alias contains, include
         * @category Collection
         * @param {Array|Object|string} collection The collection to search.
         * @param {*} target The value to search for.
         * @param {number} [fromIndex=0] The index to search from.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
         * @returns {boolean} Returns `true` if a matching element is found, else `false`.
         * @example
         *
         * _.includes([1, 2, 3], 1);
         * // => true
         *
         * _.includes([1, 2, 3], 1, 2);
         * // => false
         *
         * _.includes({ 'user': 'fred', 'age': 40 }, 'fred');
         * // => true
         *
         * _.includes('pebbles', 'eb');
         * // => true
         */
        function includes(collection, target, fromIndex, guard) {
          var length = collection ? getLength(collection) : 0;
          if (!isLength(length)) {
            collection = values(collection);
            length = collection.length;
          }
          if (typeof fromIndex != 'number' || (guard && isIterateeCall(target, fromIndex, guard))) {
            fromIndex = 0;
          } else {
            fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : (fromIndex || 0);
          }
          return (typeof collection == 'string' || !isArray(collection) && isString(collection))
            ? (fromIndex <= length && collection.indexOf(target, fromIndex) > -1)
            : (!!length && getIndexOf(collection, target, fromIndex) > -1);
        }
        
        /**
         * Creates an object composed of keys generated from the results of running
         * each element of `collection` through `iteratee`. The corresponding value
         * of each key is the last element responsible for generating the key. The
         * iteratee function is bound to `thisArg` and invoked with three arguments:
         * (value, index|key, collection).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns the composed aggregate object.
         * @example
         *
         * var keyData = [
         *   { 'dir': 'left', 'code': 97 },
         *   { 'dir': 'right', 'code': 100 }
         * ];
         *
         * _.indexBy(keyData, 'dir');
         * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
         *
         * _.indexBy(keyData, function(object) {
     *   return String.fromCharCode(object.code);
     * });
         * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
         *
         * _.indexBy(keyData, function(object) {
     *   return this.fromCharCode(object.code);
     * }, String);
         * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
         */
        var indexBy = createAggregator(function(result, value, key) {
          result[key] = value;
        });
        
        /**
         * Invokes the method at `path` of each element in `collection`, returning
         * an array of the results of each invoked method. Any additional arguments
         * are provided to each invoked method. If `methodName` is a function it is
         * invoked for, and `this` bound to, each element in `collection`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Array|Function|string} path The path of the method to invoke or
         *  the function invoked per iteration.
         * @param {...*} [args] The arguments to invoke the method with.
         * @returns {Array} Returns the array of results.
         * @example
         *
         * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
         * // => [[1, 5, 7], [1, 2, 3]]
         *
         * _.invoke([123, 456], String.prototype.split, '');
         * // => [['1', '2', '3'], ['4', '5', '6']]
         */
        var invoke = restParam(function(collection, path, args) {
          var index = -1,
            isFunc = typeof path == 'function',
            isProp = isKey(path),
            result = isArrayLike(collection) ? Array(collection.length) : [];
          
          baseEach(collection, function(value) {
            var func = isFunc ? path : ((isProp && value != null) ? value[path] : undefined);
            result[++index] = func ? func.apply(value, args) : invokePath(value, path, args);
          });
          return result;
        });
        
        /**
         * Creates an array of values by running each element in `collection` through
         * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
         * arguments: (value, index|key, collection).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * Many lodash methods are guarded to work as iteratees for methods like
         * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
         *
         * The guarded methods are:
         * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
         * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
         * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
         * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
         * `sum`, `uniq`, and `words`
         *
         * @static
         * @memberOf _
         * @alias collect
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Array} Returns the new mapped array.
         * @example
         *
         * function timesThree(n) {
     *   return n * 3;
     * }
         *
         * _.map([1, 2], timesThree);
         * // => [3, 6]
         *
         * _.map({ 'a': 1, 'b': 2 }, timesThree);
         * // => [3, 6] (iteration order is not guaranteed)
         *
         * var users = [
         *   { 'user': 'barney' },
         *   { 'user': 'fred' }
         * ];
         *
         * // using the `_.property` callback shorthand
         * _.map(users, 'user');
         * // => ['barney', 'fred']
         */
        function map(collection, iteratee, thisArg) {
          var func = isArray(collection) ? arrayMap : baseMap;
          iteratee = getCallback(iteratee, thisArg, 3);
          return func(collection, iteratee);
        }
        
        /**
         * Creates an array of elements split into two groups, the first of which
         * contains elements `predicate` returns truthy for, while the second of which
         * contains elements `predicate` returns falsey for. The predicate is bound
         * to `thisArg` and invoked with three arguments: (value, index|key, collection).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Array} Returns the array of grouped elements.
         * @example
         *
         * _.partition([1, 2, 3], function(n) {
     *   return n % 2;
     * });
         * // => [[1, 3], [2]]
         *
         * _.partition([1.2, 2.3, 3.4], function(n) {
     *   return this.floor(n) % 2;
     * }, Math);
         * // => [[1.2, 3.4], [2.3]]
         *
         * var users = [
         *   { 'user': 'barney',  'age': 36, 'active': false },
         *   { 'user': 'fred',    'age': 40, 'active': true },
         *   { 'user': 'pebbles', 'age': 1,  'active': false }
         * ];
         *
         * var mapper = function(array) {
     *   return _.pluck(array, 'user');
     * };
         *
         * // using the `_.matches` callback shorthand
         * _.map(_.partition(users, { 'age': 1, 'active': false }), mapper);
         * // => [['pebbles'], ['barney', 'fred']]
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.map(_.partition(users, 'active', false), mapper);
         * // => [['barney', 'pebbles'], ['fred']]
         *
         * // using the `_.property` callback shorthand
         * _.map(_.partition(users, 'active'), mapper);
         * // => [['fred'], ['barney', 'pebbles']]
         */
        var partition = createAggregator(function(result, value, key) {
          result[key ? 0 : 1].push(value);
        }, function() { return [[], []]; });
        
        /**
         * Gets the property value of `path` from all elements in `collection`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Array|string} path The path of the property to pluck.
         * @returns {Array} Returns the property values.
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36 },
         *   { 'user': 'fred',   'age': 40 }
         * ];
         *
         * _.pluck(users, 'user');
         * // => ['barney', 'fred']
         *
         * var userIndex = _.indexBy(users, 'user');
         * _.pluck(userIndex, 'age');
         * // => [36, 40] (iteration order is not guaranteed)
         */
        function pluck(collection, path) {
          return map(collection, property(path));
        }
        
        /**
         * Reduces `collection` to a value which is the accumulated result of running
         * each element in `collection` through `iteratee`, where each successive
         * invocation is supplied the return value of the previous. If `accumulator`
         * is not provided the first element of `collection` is used as the initial
         * value. The `iteratee` is bound to `thisArg` and invoked with four arguments:
         * (accumulator, value, index|key, collection).
         *
         * Many lodash methods are guarded to work as iteratees for methods like
         * `_.reduce`, `_.reduceRight`, and `_.transform`.
         *
         * The guarded methods are:
         * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `sortByAll`,
         * and `sortByOrder`
         *
         * @static
         * @memberOf _
         * @alias foldl, inject
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [accumulator] The initial value.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {*} Returns the accumulated value.
         * @example
         *
         * _.reduce([1, 2], function(total, n) {
     *   return total + n;
     * });
         * // => 3
         *
         * _.reduce({ 'a': 1, 'b': 2 }, function(result, n, key) {
     *   result[key] = n * 3;
     *   return result;
     * }, {});
         * // => { 'a': 3, 'b': 6 } (iteration order is not guaranteed)
         */
        var reduce = createReduce(arrayReduce, baseEach);
        
        /**
         * This method is like `_.reduce` except that it iterates over elements of
         * `collection` from right to left.
         *
         * @static
         * @memberOf _
         * @alias foldr
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [accumulator] The initial value.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {*} Returns the accumulated value.
         * @example
         *
         * var array = [[0, 1], [2, 3], [4, 5]];
         *
         * _.reduceRight(array, function(flattened, other) {
     *   return flattened.concat(other);
     * }, []);
         * // => [4, 5, 2, 3, 0, 1]
         */
        var reduceRight = createReduce(arrayReduceRight, baseEachRight);
        
        /**
         * The opposite of `_.filter`; this method returns the elements of `collection`
         * that `predicate` does **not** return truthy for.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Array} Returns the new filtered array.
         * @example
         *
         * _.reject([1, 2, 3, 4], function(n) {
     *   return n % 2 == 0;
     * });
         * // => [1, 3]
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': false },
         *   { 'user': 'fred',   'age': 40, 'active': true }
         * ];
         *
         * // using the `_.matches` callback shorthand
         * _.pluck(_.reject(users, { 'age': 40, 'active': true }), 'user');
         * // => ['barney']
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.pluck(_.reject(users, 'active', false), 'user');
         * // => ['fred']
         *
         * // using the `_.property` callback shorthand
         * _.pluck(_.reject(users, 'active'), 'user');
         * // => ['barney']
         */
        function reject(collection, predicate, thisArg) {
          var func = isArray(collection) ? arrayFilter : baseFilter;
          predicate = getCallback(predicate, thisArg, 3);
          return func(collection, function(value, index, collection) {
            return !predicate(value, index, collection);
          });
        }
        
        /**
         * Gets a random element or `n` random elements from a collection.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to sample.
         * @param {number} [n] The number of elements to sample.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {*} Returns the random sample(s).
         * @example
         *
         * _.sample([1, 2, 3, 4]);
         * // => 2
         *
         * _.sample([1, 2, 3, 4], 2);
         * // => [3, 1]
         */
        function sample(collection, n, guard) {
          if (guard ? isIterateeCall(collection, n, guard) : n == null) {
            collection = toIterable(collection);
            var length = collection.length;
            return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
          }
          var index = -1,
            result = toArray(collection),
            length = result.length,
            lastIndex = length - 1;
          
          n = nativeMin(n < 0 ? 0 : (+n || 0), length);
          while (++index < n) {
            var rand = baseRandom(index, lastIndex),
              value = result[rand];
            
            result[rand] = result[index];
            result[index] = value;
          }
          result.length = n;
          return result;
        }
        
        /**
         * Creates an array of shuffled values, using a version of the
         * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to shuffle.
         * @returns {Array} Returns the new shuffled array.
         * @example
         *
         * _.shuffle([1, 2, 3, 4]);
         * // => [4, 1, 3, 2]
         */
        function shuffle(collection) {
          return sample(collection, POSITIVE_INFINITY);
        }
        
        /**
         * Gets the size of `collection` by returning its length for array-like
         * values or the number of own enumerable properties for objects.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to inspect.
         * @returns {number} Returns the size of `collection`.
         * @example
         *
         * _.size([1, 2, 3]);
         * // => 3
         *
         * _.size({ 'a': 1, 'b': 2 });
         * // => 2
         *
         * _.size('pebbles');
         * // => 7
         */
        function size(collection) {
          var length = collection ? getLength(collection) : 0;
          return isLength(length) ? length : keys(collection).length;
        }
        
        /**
         * Checks if `predicate` returns truthy for **any** element of `collection`.
         * The function returns as soon as it finds a passing value and does not iterate
         * over the entire collection. The predicate is bound to `thisArg` and invoked
         * with three arguments: (value, index|key, collection).
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @alias any
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {boolean} Returns `true` if any element passes the predicate check,
         *  else `false`.
         * @example
         *
         * _.some([null, 0, 'yes', false], Boolean);
         * // => true
         *
         * var users = [
         *   { 'user': 'barney', 'active': true },
         *   { 'user': 'fred',   'active': false }
         * ];
         *
         * // using the `_.matches` callback shorthand
         * _.some(users, { 'user': 'barney', 'active': false });
         * // => false
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.some(users, 'active', false);
         * // => true
         *
         * // using the `_.property` callback shorthand
         * _.some(users, 'active');
         * // => true
         */
        function some(collection, predicate, thisArg) {
          var func = isArray(collection) ? arraySome : baseSome;
          if (thisArg && isIterateeCall(collection, predicate, thisArg)) {
            predicate = undefined;
          }
          if (typeof predicate != 'function' || thisArg !== undefined) {
            predicate = getCallback(predicate, thisArg, 3);
          }
          return func(collection, predicate);
        }
        
        /**
         * Creates an array of elements, sorted in ascending order by the results of
         * running each element in a collection through `iteratee`. This method performs
         * a stable sort, that is, it preserves the original sort order of equal elements.
         * The `iteratee` is bound to `thisArg` and invoked with three arguments:
         * (value, index|key, collection).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Array} Returns the new sorted array.
         * @example
         *
         * _.sortBy([1, 2, 3], function(n) {
     *   return Math.sin(n);
     * });
         * // => [3, 1, 2]
         *
         * _.sortBy([1, 2, 3], function(n) {
     *   return this.sin(n);
     * }, Math);
         * // => [3, 1, 2]
         *
         * var users = [
         *   { 'user': 'fred' },
         *   { 'user': 'pebbles' },
         *   { 'user': 'barney' }
         * ];
         *
         * // using the `_.property` callback shorthand
         * _.pluck(_.sortBy(users, 'user'), 'user');
         * // => ['barney', 'fred', 'pebbles']
         */
        function sortBy(collection, iteratee, thisArg) {
          if (collection == null) {
            return [];
          }
          if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
            iteratee = undefined;
          }
          var index = -1;
          iteratee = getCallback(iteratee, thisArg, 3);
          
          var result = baseMap(collection, function(value, key, collection) {
            return { 'criteria': iteratee(value, key, collection), 'index': ++index, 'value': value };
          });
          return baseSortBy(result, compareAscending);
        }
        
        /**
         * This method is like `_.sortBy` except that it can sort by multiple iteratees
         * or property names.
         *
         * If a property name is provided for an iteratee the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If an object is provided for an iteratee the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {...(Function|Function[]|Object|Object[]|string|string[])} iteratees
         *  The iteratees to sort by, specified as individual values or arrays of values.
         * @returns {Array} Returns the new sorted array.
         * @example
         *
         * var users = [
         *   { 'user': 'fred',   'age': 48 },
         *   { 'user': 'barney', 'age': 36 },
         *   { 'user': 'fred',   'age': 42 },
         *   { 'user': 'barney', 'age': 34 }
         * ];
         *
         * _.map(_.sortByAll(users, ['user', 'age']), _.values);
         * // => [['barney', 34], ['barney', 36], ['fred', 42], ['fred', 48]]
         *
         * _.map(_.sortByAll(users, 'user', function(chr) {
     *   return Math.floor(chr.age / 10);
     * }), _.values);
         * // => [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
         */
        var sortByAll = restParam(function(collection, iteratees) {
          if (collection == null) {
            return [];
          }
          var guard = iteratees[2];
          if (guard && isIterateeCall(iteratees[0], iteratees[1], guard)) {
            iteratees.length = 1;
          }
          return baseSortByOrder(collection, baseFlatten(iteratees), []);
        });
        
        /**
         * This method is like `_.sortByAll` except that it allows specifying the
         * sort orders of the iteratees to sort by. If `orders` is unspecified, all
         * values are sorted in ascending order. Otherwise, a value is sorted in
         * ascending order if its corresponding order is "asc", and descending if "desc".
         *
         * If a property name is provided for an iteratee the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If an object is provided for an iteratee the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
         * @param {boolean[]} [orders] The sort orders of `iteratees`.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.reduce`.
         * @returns {Array} Returns the new sorted array.
         * @example
         *
         * var users = [
         *   { 'user': 'fred',   'age': 48 },
         *   { 'user': 'barney', 'age': 34 },
         *   { 'user': 'fred',   'age': 42 },
         *   { 'user': 'barney', 'age': 36 }
         * ];
         *
         * // sort by `user` in ascending order and by `age` in descending order
         * _.map(_.sortByOrder(users, ['user', 'age'], ['asc', 'desc']), _.values);
         * // => [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 42]]
         */
        function sortByOrder(collection, iteratees, orders, guard) {
          if (collection == null) {
            return [];
          }
          if (guard && isIterateeCall(iteratees, orders, guard)) {
            orders = undefined;
          }
          if (!isArray(iteratees)) {
            iteratees = iteratees == null ? [] : [iteratees];
          }
          if (!isArray(orders)) {
            orders = orders == null ? [] : [orders];
          }
          return baseSortByOrder(collection, iteratees, orders);
        }
        
        /**
         * Performs a deep comparison between each element in `collection` and the
         * source object, returning an array of all elements that have equivalent
         * property values.
         *
         * **Note:** This method supports comparing arrays, booleans, `Date` objects,
         * numbers, `Object` objects, regexes, and strings. Objects are compared by
         * their own, not inherited, enumerable properties. For comparing a single
         * own or inherited property value see `_.matchesProperty`.
         *
         * @static
         * @memberOf _
         * @category Collection
         * @param {Array|Object|string} collection The collection to search.
         * @param {Object} source The object of property values to match.
         * @returns {Array} Returns the new filtered array.
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': false, 'pets': ['hoppy'] },
         *   { 'user': 'fred',   'age': 40, 'active': true, 'pets': ['baby puss', 'dino'] }
         * ];
         *
         * _.pluck(_.where(users, { 'age': 36, 'active': false }), 'user');
         * // => ['barney']
         *
         * _.pluck(_.where(users, { 'pets': ['dino'] }), 'user');
         * // => ['fred']
         */
        function where(collection, source) {
          return filter(collection, baseMatches(source));
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Gets the number of milliseconds that have elapsed since the Unix epoch
         * (1 January 1970 00:00:00 UTC).
         *
         * @static
         * @memberOf _
         * @category Date
         * @example
         *
         * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
         * // => logs the number of milliseconds it took for the deferred function to be invoked
         */
        var now = nativeNow || function() {
            return new Date().getTime();
          };
        
        /*------------------------------------------------------------------------*/
        
        /**
         * The opposite of `_.before`; this method creates a function that invokes
         * `func` once it is called `n` or more times.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {number} n The number of calls before `func` is invoked.
         * @param {Function} func The function to restrict.
         * @returns {Function} Returns the new restricted function.
         * @example
         *
         * var saves = ['profile', 'settings'];
         *
         * var done = _.after(saves.length, function() {
     *   console.log('done saving!');
     * });
         *
         * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
         * // => logs 'done saving!' after the two async saves have completed
         */
        function after(n, func) {
          if (typeof func != 'function') {
            if (typeof n == 'function') {
              var temp = n;
              n = func;
              func = temp;
            } else {
              throw new TypeError(FUNC_ERROR_TEXT);
            }
          }
          n = nativeIsFinite(n = +n) ? n : 0;
          return function() {
            if (--n < 1) {
              return func.apply(this, arguments);
            }
          };
        }
        
        /**
         * Creates a function that accepts up to `n` arguments ignoring any
         * additional arguments.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to cap arguments for.
         * @param {number} [n=func.length] The arity cap.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Function} Returns the new function.
         * @example
         *
         * _.map(['6', '8', '10'], _.ary(parseInt, 1));
         * // => [6, 8, 10]
         */
        function ary(func, n, guard) {
          if (guard && isIterateeCall(func, n, guard)) {
            n = undefined;
          }
          n = (func && n == null) ? func.length : nativeMax(+n || 0, 0);
          return createWrapper(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
        }
        
        /**
         * Creates a function that invokes `func`, with the `this` binding and arguments
         * of the created function, while it is called less than `n` times. Subsequent
         * calls to the created function return the result of the last `func` invocation.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {number} n The number of calls at which `func` is no longer invoked.
         * @param {Function} func The function to restrict.
         * @returns {Function} Returns the new restricted function.
         * @example
         *
         * jQuery('#add').on('click', _.before(5, addContactToList));
         * // => allows adding up to 4 contacts to the list
         */
        function before(n, func) {
          var result;
          if (typeof func != 'function') {
            if (typeof n == 'function') {
              var temp = n;
              n = func;
              func = temp;
            } else {
              throw new TypeError(FUNC_ERROR_TEXT);
            }
          }
          return function() {
            if (--n > 0) {
              result = func.apply(this, arguments);
            }
            if (n <= 1) {
              func = undefined;
            }
            return result;
          };
        }
        
        /**
         * Creates a function that invokes `func` with the `this` binding of `thisArg`
         * and prepends any additional `_.bind` arguments to those provided to the
         * bound function.
         *
         * The `_.bind.placeholder` value, which defaults to `_` in monolithic builds,
         * may be used as a placeholder for partially applied arguments.
         *
         * **Note:** Unlike native `Function#bind` this method does not set the "length"
         * property of bound functions.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to bind.
         * @param {*} thisArg The `this` binding of `func`.
         * @param {...*} [partials] The arguments to be partially applied.
         * @returns {Function} Returns the new bound function.
         * @example
         *
         * var greet = function(greeting, punctuation) {
     *   return greeting + ' ' + this.user + punctuation;
     * };
         *
         * var object = { 'user': 'fred' };
         *
         * var bound = _.bind(greet, object, 'hi');
         * bound('!');
         * // => 'hi fred!'
         *
         * // using placeholders
         * var bound = _.bind(greet, object, _, '!');
         * bound('hi');
         * // => 'hi fred!'
         */
        var bind = restParam(function(func, thisArg, partials) {
          var bitmask = BIND_FLAG;
          if (partials.length) {
            var holders = replaceHolders(partials, bind.placeholder);
            bitmask |= PARTIAL_FLAG;
          }
          return createWrapper(func, bitmask, thisArg, partials, holders);
        });
        
        /**
         * Binds methods of an object to the object itself, overwriting the existing
         * method. Method names may be specified as individual arguments or as arrays
         * of method names. If no method names are provided all enumerable function
         * properties, own and inherited, of `object` are bound.
         *
         * **Note:** This method does not set the "length" property of bound functions.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Object} object The object to bind and assign the bound methods to.
         * @param {...(string|string[])} [methodNames] The object method names to bind,
         *  specified as individual method names or arrays of method names.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var view = {
     *   'label': 'docs',
     *   'onClick': function() {
     *     console.log('clicked ' + this.label);
     *   }
     * };
         *
         * _.bindAll(view);
         * jQuery('#docs').on('click', view.onClick);
         * // => logs 'clicked docs' when the element is clicked
         */
        var bindAll = restParam(function(object, methodNames) {
          methodNames = methodNames.length ? baseFlatten(methodNames) : functions(object);
          
          var index = -1,
            length = methodNames.length;
          
          while (++index < length) {
            var key = methodNames[index];
            object[key] = createWrapper(object[key], BIND_FLAG, object);
          }
          return object;
        });
        
        /**
         * Creates a function that invokes the method at `object[key]` and prepends
         * any additional `_.bindKey` arguments to those provided to the bound function.
         *
         * This method differs from `_.bind` by allowing bound functions to reference
         * methods that may be redefined or don't yet exist.
         * See [Peter Michaux's article](http://peter.michaux.ca/articles/lazy-function-definition-pattern)
         * for more details.
         *
         * The `_.bindKey.placeholder` value, which defaults to `_` in monolithic
         * builds, may be used as a placeholder for partially applied arguments.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Object} object The object the method belongs to.
         * @param {string} key The key of the method.
         * @param {...*} [partials] The arguments to be partially applied.
         * @returns {Function} Returns the new bound function.
         * @example
         *
         * var object = {
     *   'user': 'fred',
     *   'greet': function(greeting, punctuation) {
     *     return greeting + ' ' + this.user + punctuation;
     *   }
     * };
         *
         * var bound = _.bindKey(object, 'greet', 'hi');
         * bound('!');
         * // => 'hi fred!'
         *
         * object.greet = function(greeting, punctuation) {
     *   return greeting + 'ya ' + this.user + punctuation;
     * };
         *
         * bound('!');
         * // => 'hiya fred!'
         *
         * // using placeholders
         * var bound = _.bindKey(object, 'greet', _, '!');
         * bound('hi');
         * // => 'hiya fred!'
         */
        var bindKey = restParam(function(object, key, partials) {
          var bitmask = BIND_FLAG | BIND_KEY_FLAG;
          if (partials.length) {
            var holders = replaceHolders(partials, bindKey.placeholder);
            bitmask |= PARTIAL_FLAG;
          }
          return createWrapper(key, bitmask, object, partials, holders);
        });
        
        /**
         * Creates a function that accepts one or more arguments of `func` that when
         * called either invokes `func` returning its result, if all `func` arguments
         * have been provided, or returns a function that accepts one or more of the
         * remaining `func` arguments, and so on. The arity of `func` may be specified
         * if `func.length` is not sufficient.
         *
         * The `_.curry.placeholder` value, which defaults to `_` in monolithic builds,
         * may be used as a placeholder for provided arguments.
         *
         * **Note:** This method does not set the "length" property of curried functions.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to curry.
         * @param {number} [arity=func.length] The arity of `func`.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Function} Returns the new curried function.
         * @example
         *
         * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
         *
         * var curried = _.curry(abc);
         *
         * curried(1)(2)(3);
         * // => [1, 2, 3]
         *
         * curried(1, 2)(3);
         * // => [1, 2, 3]
         *
         * curried(1, 2, 3);
         * // => [1, 2, 3]
         *
         * // using placeholders
         * curried(1)(_, 3)(2);
         * // => [1, 2, 3]
         */
        var curry = createCurry(CURRY_FLAG);
        
        /**
         * This method is like `_.curry` except that arguments are applied to `func`
         * in the manner of `_.partialRight` instead of `_.partial`.
         *
         * The `_.curryRight.placeholder` value, which defaults to `_` in monolithic
         * builds, may be used as a placeholder for provided arguments.
         *
         * **Note:** This method does not set the "length" property of curried functions.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to curry.
         * @param {number} [arity=func.length] The arity of `func`.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Function} Returns the new curried function.
         * @example
         *
         * var abc = function(a, b, c) {
     *   return [a, b, c];
     * };
         *
         * var curried = _.curryRight(abc);
         *
         * curried(3)(2)(1);
         * // => [1, 2, 3]
         *
         * curried(2, 3)(1);
         * // => [1, 2, 3]
         *
         * curried(1, 2, 3);
         * // => [1, 2, 3]
         *
         * // using placeholders
         * curried(3)(1, _)(2);
         * // => [1, 2, 3]
         */
        var curryRight = createCurry(CURRY_RIGHT_FLAG);
        
        /**
         * Creates a debounced function that delays invoking `func` until after `wait`
         * milliseconds have elapsed since the last time the debounced function was
         * invoked. The debounced function comes with a `cancel` method to cancel
         * delayed invocations. Provide an options object to indicate that `func`
         * should be invoked on the leading and/or trailing edge of the `wait` timeout.
         * Subsequent calls to the debounced function return the result of the last
         * `func` invocation.
         *
         * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
         * on the trailing edge of the timeout only if the the debounced function is
         * invoked more than once during the `wait` timeout.
         *
         * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
         * for details over the differences between `_.debounce` and `_.throttle`.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to debounce.
         * @param {number} [wait=0] The number of milliseconds to delay.
         * @param {Object} [options] The options object.
         * @param {boolean} [options.leading=false] Specify invoking on the leading
         *  edge of the timeout.
         * @param {number} [options.maxWait] The maximum time `func` is allowed to be
         *  delayed before it is invoked.
         * @param {boolean} [options.trailing=true] Specify invoking on the trailing
         *  edge of the timeout.
         * @returns {Function} Returns the new debounced function.
         * @example
         *
         * // avoid costly calculations while the window size is in flux
         * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
         *
         * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
         * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
         *
         * // ensure `batchLog` is invoked once after 1 second of debounced calls
         * var source = new EventSource('/stream');
         * jQuery(source).on('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }));
         *
         * // cancel a debounced call
         * var todoChanges = _.debounce(batchLog, 1000);
         * Object.observe(models.todo, todoChanges);
         *
         * Object.observe(models, function(changes) {
     *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
     *     todoChanges.cancel();
     *   }
     * }, ['delete']);
         *
         * // ...at some point `models.todo` is changed
         * models.todo.completed = true;
         *
         * // ...before 1 second has passed `models.todo` is deleted
         * // which cancels the debounced `todoChanges` call
         * delete models.todo;
         */
        function debounce(func, wait, options) {
          var args,
            maxTimeoutId,
            result,
            stamp,
            thisArg,
            timeoutId,
            trailingCall,
            lastCalled = 0,
            maxWait = false,
            trailing = true;
          
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          wait = wait < 0 ? 0 : (+wait || 0);
          if (options === true) {
            var leading = true;
            trailing = false;
          } else if (isObject(options)) {
            leading = !!options.leading;
            maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
            trailing = 'trailing' in options ? !!options.trailing : trailing;
          }
          
          function cancel() {
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            if (maxTimeoutId) {
              clearTimeout(maxTimeoutId);
            }
            lastCalled = 0;
            maxTimeoutId = timeoutId = trailingCall = undefined;
          }
          
          function complete(isCalled, id) {
            if (id) {
              clearTimeout(id);
            }
            maxTimeoutId = timeoutId = trailingCall = undefined;
            if (isCalled) {
              lastCalled = now();
              result = func.apply(thisArg, args);
              if (!timeoutId && !maxTimeoutId) {
                args = thisArg = undefined;
              }
            }
          }
          
          function delayed() {
            var remaining = wait - (now() - stamp);
            if (remaining <= 0 || remaining > wait) {
              complete(trailingCall, maxTimeoutId);
            } else {
              timeoutId = setTimeout(delayed, remaining);
            }
          }
          
          function maxDelayed() {
            complete(trailing, timeoutId);
          }
          
          function debounced() {
            args = arguments;
            stamp = now();
            thisArg = this;
            trailingCall = trailing && (timeoutId || !leading);
            
            if (maxWait === false) {
              var leadingCall = leading && !timeoutId;
            } else {
              if (!maxTimeoutId && !leading) {
                lastCalled = stamp;
              }
              var remaining = maxWait - (stamp - lastCalled),
                isCalled = remaining <= 0 || remaining > maxWait;
              
              if (isCalled) {
                if (maxTimeoutId) {
                  maxTimeoutId = clearTimeout(maxTimeoutId);
                }
                lastCalled = stamp;
                result = func.apply(thisArg, args);
              }
              else if (!maxTimeoutId) {
                maxTimeoutId = setTimeout(maxDelayed, remaining);
              }
            }
            if (isCalled && timeoutId) {
              timeoutId = clearTimeout(timeoutId);
            }
            else if (!timeoutId && wait !== maxWait) {
              timeoutId = setTimeout(delayed, wait);
            }
            if (leadingCall) {
              isCalled = true;
              result = func.apply(thisArg, args);
            }
            if (isCalled && !timeoutId && !maxTimeoutId) {
              args = thisArg = undefined;
            }
            return result;
          }
          debounced.cancel = cancel;
          return debounced;
        }
        
        /**
         * Defers invoking the `func` until the current call stack has cleared. Any
         * additional arguments are provided to `func` when it is invoked.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to defer.
         * @param {...*} [args] The arguments to invoke the function with.
         * @returns {number} Returns the timer id.
         * @example
         *
         * _.defer(function(text) {
     *   console.log(text);
     * }, 'deferred');
         * // logs 'deferred' after one or more milliseconds
         */
        var defer = restParam(function(func, args) {
          return baseDelay(func, 1, args);
        });
        
        /**
         * Invokes `func` after `wait` milliseconds. Any additional arguments are
         * provided to `func` when it is invoked.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to delay.
         * @param {number} wait The number of milliseconds to delay invocation.
         * @param {...*} [args] The arguments to invoke the function with.
         * @returns {number} Returns the timer id.
         * @example
         *
         * _.delay(function(text) {
     *   console.log(text);
     * }, 1000, 'later');
         * // => logs 'later' after one second
         */
        var delay = restParam(function(func, wait, args) {
          return baseDelay(func, wait, args);
        });
        
        /**
         * Creates a function that returns the result of invoking the provided
         * functions with the `this` binding of the created function, where each
         * successive invocation is supplied the return value of the previous.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {...Function} [funcs] Functions to invoke.
         * @returns {Function} Returns the new function.
         * @example
         *
         * function square(n) {
     *   return n * n;
     * }
         *
         * var addSquare = _.flow(_.add, square);
         * addSquare(1, 2);
         * // => 9
         */
        var flow = createFlow();
        
        /**
         * This method is like `_.flow` except that it creates a function that
         * invokes the provided functions from right to left.
         *
         * @static
         * @memberOf _
         * @alias backflow, compose
         * @category Function
         * @param {...Function} [funcs] Functions to invoke.
         * @returns {Function} Returns the new function.
         * @example
         *
         * function square(n) {
     *   return n * n;
     * }
         *
         * var addSquare = _.flowRight(square, _.add);
         * addSquare(1, 2);
         * // => 9
         */
        var flowRight = createFlow(true);
        
        /**
         * Creates a function that memoizes the result of `func`. If `resolver` is
         * provided it determines the cache key for storing the result based on the
         * arguments provided to the memoized function. By default, the first argument
         * provided to the memoized function is coerced to a string and used as the
         * cache key. The `func` is invoked with the `this` binding of the memoized
         * function.
         *
         * **Note:** The cache is exposed as the `cache` property on the memoized
         * function. Its creation may be customized by replacing the `_.memoize.Cache`
         * constructor with one whose instances implement the [`Map`](http://ecma-international.org/ecma-262/6.0/#sec-properties-of-the-map-prototype-object)
         * method interface of `get`, `has`, and `set`.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to have its output memoized.
         * @param {Function} [resolver] The function to resolve the cache key.
         * @returns {Function} Returns the new memoizing function.
         * @example
         *
         * var upperCase = _.memoize(function(string) {
     *   return string.toUpperCase();
     * });
         *
         * upperCase('fred');
         * // => 'FRED'
         *
         * // modifying the result cache
         * upperCase.cache.set('fred', 'BARNEY');
         * upperCase('fred');
         * // => 'BARNEY'
         *
         * // replacing `_.memoize.Cache`
         * var object = { 'user': 'fred' };
         * var other = { 'user': 'barney' };
         * var identity = _.memoize(_.identity);
         *
         * identity(object);
         * // => { 'user': 'fred' }
         * identity(other);
         * // => { 'user': 'fred' }
         *
         * _.memoize.Cache = WeakMap;
         * var identity = _.memoize(_.identity);
         *
         * identity(object);
         * // => { 'user': 'fred' }
         * identity(other);
         * // => { 'user': 'barney' }
         */
        function memoize(func, resolver) {
          if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          var memoized = function() {
            var args = arguments,
              key = resolver ? resolver.apply(this, args) : args[0],
              cache = memoized.cache;
            
            if (cache.has(key)) {
              return cache.get(key);
            }
            var result = func.apply(this, args);
            memoized.cache = cache.set(key, result);
            return result;
          };
          memoized.cache = new memoize.Cache;
          return memoized;
        }
        
        /**
         * Creates a function that runs each argument through a corresponding
         * transform function.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to wrap.
         * @param {...(Function|Function[])} [transforms] The functions to transform
         * arguments, specified as individual functions or arrays of functions.
         * @returns {Function} Returns the new function.
         * @example
         *
         * function doubled(n) {
     *   return n * 2;
     * }
         *
         * function square(n) {
     *   return n * n;
     * }
         *
         * var modded = _.modArgs(function(x, y) {
     *   return [x, y];
     * }, square, doubled);
         *
         * modded(1, 2);
         * // => [1, 4]
         *
         * modded(5, 10);
         * // => [25, 20]
         */
        var modArgs = restParam(function(func, transforms) {
          transforms = baseFlatten(transforms);
          if (typeof func != 'function' || !arrayEvery(transforms, baseIsFunction)) {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          var length = transforms.length;
          return restParam(function(args) {
            var index = nativeMin(args.length, length);
            while (index--) {
              args[index] = transforms[index](args[index]);
            }
            return func.apply(this, args);
          });
        });
        
        /**
         * Creates a function that negates the result of the predicate `func`. The
         * `func` predicate is invoked with the `this` binding and arguments of the
         * created function.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} predicate The predicate to negate.
         * @returns {Function} Returns the new function.
         * @example
         *
         * function isEven(n) {
     *   return n % 2 == 0;
     * }
         *
         * _.filter([1, 2, 3, 4, 5, 6], _.negate(isEven));
         * // => [1, 3, 5]
         */
        function negate(predicate) {
          if (typeof predicate != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          return function() {
            return !predicate.apply(this, arguments);
          };
        }
        
        /**
         * Creates a function that is restricted to invoking `func` once. Repeat calls
         * to the function return the value of the first call. The `func` is invoked
         * with the `this` binding and arguments of the created function.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to restrict.
         * @returns {Function} Returns the new restricted function.
         * @example
         *
         * var initialize = _.once(createApplication);
         * initialize();
         * initialize();
         * // `initialize` invokes `createApplication` once
         */
        function once(func) {
          return before(2, func);
        }
        
        /**
         * Creates a function that invokes `func` with `partial` arguments prepended
         * to those provided to the new function. This method is like `_.bind` except
         * it does **not** alter the `this` binding.
         *
         * The `_.partial.placeholder` value, which defaults to `_` in monolithic
         * builds, may be used as a placeholder for partially applied arguments.
         *
         * **Note:** This method does not set the "length" property of partially
         * applied functions.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to partially apply arguments to.
         * @param {...*} [partials] The arguments to be partially applied.
         * @returns {Function} Returns the new partially applied function.
         * @example
         *
         * var greet = function(greeting, name) {
     *   return greeting + ' ' + name;
     * };
         *
         * var sayHelloTo = _.partial(greet, 'hello');
         * sayHelloTo('fred');
         * // => 'hello fred'
         *
         * // using placeholders
         * var greetFred = _.partial(greet, _, 'fred');
         * greetFred('hi');
         * // => 'hi fred'
         */
        var partial = createPartial(PARTIAL_FLAG);
        
        /**
         * This method is like `_.partial` except that partially applied arguments
         * are appended to those provided to the new function.
         *
         * The `_.partialRight.placeholder` value, which defaults to `_` in monolithic
         * builds, may be used as a placeholder for partially applied arguments.
         *
         * **Note:** This method does not set the "length" property of partially
         * applied functions.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to partially apply arguments to.
         * @param {...*} [partials] The arguments to be partially applied.
         * @returns {Function} Returns the new partially applied function.
         * @example
         *
         * var greet = function(greeting, name) {
     *   return greeting + ' ' + name;
     * };
         *
         * var greetFred = _.partialRight(greet, 'fred');
         * greetFred('hi');
         * // => 'hi fred'
         *
         * // using placeholders
         * var sayHelloTo = _.partialRight(greet, 'hello', _);
         * sayHelloTo('fred');
         * // => 'hello fred'
         */
        var partialRight = createPartial(PARTIAL_RIGHT_FLAG);
        
        /**
         * Creates a function that invokes `func` with arguments arranged according
         * to the specified indexes where the argument value at the first index is
         * provided as the first argument, the argument value at the second index is
         * provided as the second argument, and so on.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to rearrange arguments for.
         * @param {...(number|number[])} indexes The arranged argument indexes,
         *  specified as individual indexes or arrays of indexes.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var rearged = _.rearg(function(a, b, c) {
     *   return [a, b, c];
     * }, 2, 0, 1);
         *
         * rearged('b', 'c', 'a')
         * // => ['a', 'b', 'c']
         *
         * var map = _.rearg(_.map, [1, 0]);
         * map(function(n) {
     *   return n * 3;
     * }, [1, 2, 3]);
         * // => [3, 6, 9]
         */
        var rearg = restParam(function(func, indexes) {
          return createWrapper(func, REARG_FLAG, undefined, undefined, undefined, baseFlatten(indexes));
        });
        
        /**
         * Creates a function that invokes `func` with the `this` binding of the
         * created function and arguments from `start` and beyond provided as an array.
         *
         * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters).
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to apply a rest parameter to.
         * @param {number} [start=func.length-1] The start position of the rest parameter.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var say = _.restParam(function(what, names) {
     *   return what + ' ' + _.initial(names).join(', ') +
     *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
     * });
         *
         * say('hello', 'fred', 'barney', 'pebbles');
         * // => 'hello fred, barney, & pebbles'
         */
        function restParam(func, start) {
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
          return function() {
            var args = arguments,
              index = -1,
              length = nativeMax(args.length - start, 0),
              rest = Array(length);
            
            while (++index < length) {
              rest[index] = args[start + index];
            }
            switch (start) {
              case 0: return func.call(this, rest);
              case 1: return func.call(this, args[0], rest);
              case 2: return func.call(this, args[0], args[1], rest);
            }
            var otherArgs = Array(start + 1);
            index = -1;
            while (++index < start) {
              otherArgs[index] = args[index];
            }
            otherArgs[start] = rest;
            return func.apply(this, otherArgs);
          };
        }
        
        /**
         * Creates a function that invokes `func` with the `this` binding of the created
         * function and an array of arguments much like [`Function#apply`](https://es5.github.io/#x15.3.4.3).
         *
         * **Note:** This method is based on the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator).
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to spread arguments over.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var say = _.spread(function(who, what) {
     *   return who + ' says ' + what;
     * });
         *
         * say(['fred', 'hello']);
         * // => 'fred says hello'
         *
         * // with a Promise
         * var numbers = Promise.all([
         *   Promise.resolve(40),
         *   Promise.resolve(36)
         * ]);
         *
         * numbers.then(_.spread(function(x, y) {
     *   return x + y;
     * }));
         * // => a Promise of 76
         */
        function spread(func) {
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          return function(array) {
            return func.apply(this, array);
          };
        }
        
        /**
         * Creates a throttled function that only invokes `func` at most once per
         * every `wait` milliseconds. The throttled function comes with a `cancel`
         * method to cancel delayed invocations. Provide an options object to indicate
         * that `func` should be invoked on the leading and/or trailing edge of the
         * `wait` timeout. Subsequent calls to the throttled function return the
         * result of the last `func` call.
         *
         * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
         * on the trailing edge of the timeout only if the the throttled function is
         * invoked more than once during the `wait` timeout.
         *
         * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
         * for details over the differences between `_.throttle` and `_.debounce`.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to throttle.
         * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
         * @param {Object} [options] The options object.
         * @param {boolean} [options.leading=true] Specify invoking on the leading
         *  edge of the timeout.
         * @param {boolean} [options.trailing=true] Specify invoking on the trailing
         *  edge of the timeout.
         * @returns {Function} Returns the new throttled function.
         * @example
         *
         * // avoid excessively updating the position while scrolling
         * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
         *
         * // invoke `renewToken` when the click event is fired, but not more than once every 5 minutes
         * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
         *
         * // cancel a trailing throttled call
         * jQuery(window).on('popstate', throttled.cancel);
         */
        function throttle(func, wait, options) {
          var leading = true,
            trailing = true;
          
          if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
          }
          if (options === false) {
            leading = false;
          } else if (isObject(options)) {
            leading = 'leading' in options ? !!options.leading : leading;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
          }
          return debounce(func, wait, { 'leading': leading, 'maxWait': +wait, 'trailing': trailing });
        }
        
        /**
         * Creates a function that provides `value` to the wrapper function as its
         * first argument. Any additional arguments provided to the function are
         * appended to those provided to the wrapper function. The wrapper is invoked
         * with the `this` binding of the created function.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {*} value The value to wrap.
         * @param {Function} wrapper The wrapper function.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
         *
         * p('fred, barney, & pebbles');
         * // => '<p>fred, barney, &amp; pebbles</p>'
         */
        function wrap(value, wrapper) {
          wrapper = wrapper == null ? identity : wrapper;
          return createWrapper(wrapper, PARTIAL_FLAG, undefined, [value], []);
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Creates a clone of `value`. If `isDeep` is `true` nested objects are cloned,
         * otherwise they are assigned by reference. If `customizer` is provided it is
         * invoked to produce the cloned values. If `customizer` returns `undefined`
         * cloning is handled by the method instead. The `customizer` is bound to
         * `thisArg` and invoked with two argument; (value [, index|key, object]).
         *
         * **Note:** This method is loosely based on the
         * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
         * The enumerable properties of `arguments` objects and objects created by
         * constructors other than `Object` are cloned to plain `Object` objects. An
         * empty object is returned for uncloneable values such as functions, DOM nodes,
         * Maps, Sets, and WeakMaps.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to clone.
         * @param {boolean} [isDeep] Specify a deep clone.
         * @param {Function} [customizer] The function to customize cloning values.
         * @param {*} [thisArg] The `this` binding of `customizer`.
         * @returns {*} Returns the cloned value.
         * @example
         *
         * var users = [
         *   { 'user': 'barney' },
         *   { 'user': 'fred' }
         * ];
         *
         * var shallow = _.clone(users);
         * shallow[0] === users[0];
         * // => true
         *
         * var deep = _.clone(users, true);
         * deep[0] === users[0];
         * // => false
         *
         * // using a customizer callback
         * var el = _.clone(document.body, function(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(false);
     *   }
     * });
         *
         * el === document.body
         * // => false
         * el.nodeName
         * // => BODY
         * el.childNodes.length;
         * // => 0
         */
        function clone(value, isDeep, customizer, thisArg) {
          if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
            isDeep = false;
          }
          else if (typeof isDeep == 'function') {
            thisArg = customizer;
            customizer = isDeep;
            isDeep = false;
          }
          return typeof customizer == 'function'
            ? baseClone(value, isDeep, bindCallback(customizer, thisArg, 1))
            : baseClone(value, isDeep);
        }
        
        /**
         * Creates a deep clone of `value`. If `customizer` is provided it is invoked
         * to produce the cloned values. If `customizer` returns `undefined` cloning
         * is handled by the method instead. The `customizer` is bound to `thisArg`
         * and invoked with two argument; (value [, index|key, object]).
         *
         * **Note:** This method is loosely based on the
         * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
         * The enumerable properties of `arguments` objects and objects created by
         * constructors other than `Object` are cloned to plain `Object` objects. An
         * empty object is returned for uncloneable values such as functions, DOM nodes,
         * Maps, Sets, and WeakMaps.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to deep clone.
         * @param {Function} [customizer] The function to customize cloning values.
         * @param {*} [thisArg] The `this` binding of `customizer`.
         * @returns {*} Returns the deep cloned value.
         * @example
         *
         * var users = [
         *   { 'user': 'barney' },
         *   { 'user': 'fred' }
         * ];
         *
         * var deep = _.cloneDeep(users);
         * deep[0] === users[0];
         * // => false
         *
         * // using a customizer callback
         * var el = _.cloneDeep(document.body, function(value) {
     *   if (_.isElement(value)) {
     *     return value.cloneNode(true);
     *   }
     * });
         *
         * el === document.body
         * // => false
         * el.nodeName
         * // => BODY
         * el.childNodes.length;
         * // => 20
         */
        function cloneDeep(value, customizer, thisArg) {
          return typeof customizer == 'function'
            ? baseClone(value, true, bindCallback(customizer, thisArg, 1))
            : baseClone(value, true);
        }
        
        /**
         * Checks if `value` is greater than `other`.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is greater than `other`, else `false`.
         * @example
         *
         * _.gt(3, 1);
         * // => true
         *
         * _.gt(3, 3);
         * // => false
         *
         * _.gt(1, 3);
         * // => false
         */
        function gt(value, other) {
          return value > other;
        }
        
        /**
         * Checks if `value` is greater than or equal to `other`.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is greater than or equal to `other`, else `false`.
         * @example
         *
         * _.gte(3, 1);
         * // => true
         *
         * _.gte(3, 3);
         * // => true
         *
         * _.gte(1, 3);
         * // => false
         */
        function gte(value, other) {
          return value >= other;
        }
        
        /**
         * Checks if `value` is classified as an `arguments` object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isArguments(function() { return arguments; }());
         * // => true
         *
         * _.isArguments([1, 2, 3]);
         * // => false
         */
        function isArguments(value) {
          return isObjectLike(value) && isArrayLike(value) &&
            hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
        }
        
        /**
         * Checks if `value` is classified as an `Array` object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isArray([1, 2, 3]);
         * // => true
         *
         * _.isArray(function() { return arguments; }());
         * // => false
         */
        var isArray = nativeIsArray || function(value) {
            return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
          };
        
        /**
         * Checks if `value` is classified as a boolean primitive or object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isBoolean(false);
         * // => true
         *
         * _.isBoolean(null);
         * // => false
         */
        function isBoolean(value) {
          return value === true || value === false || (isObjectLike(value) && objToString.call(value) == boolTag);
        }
        
        /**
         * Checks if `value` is classified as a `Date` object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isDate(new Date);
         * // => true
         *
         * _.isDate('Mon April 23 2012');
         * // => false
         */
        function isDate(value) {
          return isObjectLike(value) && objToString.call(value) == dateTag;
        }
        
        /**
         * Checks if `value` is a DOM element.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
         * @example
         *
         * _.isElement(document.body);
         * // => true
         *
         * _.isElement('<body>');
         * // => false
         */
        function isElement(value) {
          return !!value && value.nodeType === 1 && isObjectLike(value) && !isPlainObject(value);
        }
        
        /**
         * Checks if `value` is empty. A value is considered empty unless it is an
         * `arguments` object, array, string, or jQuery-like collection with a length
         * greater than `0` or an object with own enumerable properties.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {Array|Object|string} value The value to inspect.
         * @returns {boolean} Returns `true` if `value` is empty, else `false`.
         * @example
         *
         * _.isEmpty(null);
         * // => true
         *
         * _.isEmpty(true);
         * // => true
         *
         * _.isEmpty(1);
         * // => true
         *
         * _.isEmpty([1, 2, 3]);
         * // => false
         *
         * _.isEmpty({ 'a': 1 });
         * // => false
         */
        function isEmpty(value) {
          if (value == null) {
            return true;
          }
          if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) ||
            (isObjectLike(value) && isFunction(value.splice)))) {
            return !value.length;
          }
          return !keys(value).length;
        }
        
        /**
         * Performs a deep comparison between two values to determine if they are
         * equivalent. If `customizer` is provided it is invoked to compare values.
         * If `customizer` returns `undefined` comparisons are handled by the method
         * instead. The `customizer` is bound to `thisArg` and invoked with three
         * arguments: (value, other [, index|key]).
         *
         * **Note:** This method supports comparing arrays, booleans, `Date` objects,
         * numbers, `Object` objects, regexes, and strings. Objects are compared by
         * their own, not inherited, enumerable properties. Functions and DOM nodes
         * are **not** supported. Provide a customizer function to extend support
         * for comparing other values.
         *
         * @static
         * @memberOf _
         * @alias eq
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @param {Function} [customizer] The function to customize value comparisons.
         * @param {*} [thisArg] The `this` binding of `customizer`.
         * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
         * @example
         *
         * var object = { 'user': 'fred' };
         * var other = { 'user': 'fred' };
         *
         * object == other;
         * // => false
         *
         * _.isEqual(object, other);
         * // => true
         *
         * // using a customizer callback
         * var array = ['hello', 'goodbye'];
         * var other = ['hi', 'goodbye'];
         *
         * _.isEqual(array, other, function(value, other) {
     *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
     *     return true;
     *   }
     * });
         * // => true
         */
        function isEqual(value, other, customizer, thisArg) {
          customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
          var result = customizer ? customizer(value, other) : undefined;
          return  result === undefined ? baseIsEqual(value, other, customizer) : !!result;
        }
        
        /**
         * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
         * `SyntaxError`, `TypeError`, or `URIError` object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
         * @example
         *
         * _.isError(new Error);
         * // => true
         *
         * _.isError(Error);
         * // => false
         */
        function isError(value) {
          return isObjectLike(value) && typeof value.message == 'string' && objToString.call(value) == errorTag;
        }
        
        /**
         * Checks if `value` is a finite primitive number.
         *
         * **Note:** This method is based on [`Number.isFinite`](http://ecma-international.org/ecma-262/6.0/#sec-number.isfinite).
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
         * @example
         *
         * _.isFinite(10);
         * // => true
         *
         * _.isFinite('10');
         * // => false
         *
         * _.isFinite(true);
         * // => false
         *
         * _.isFinite(Object(10));
         * // => false
         *
         * _.isFinite(Infinity);
         * // => false
         */
        function isFinite(value) {
          return typeof value == 'number' && nativeIsFinite(value);
        }
        
        /**
         * Checks if `value` is classified as a `Function` object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isFunction(_);
         * // => true
         *
         * _.isFunction(/abc/);
         * // => false
         */
        function isFunction(value) {
          // The use of `Object#toString` avoids issues with the `typeof` operator
          // in older versions of Chrome and Safari which return 'function' for regexes
          // and Safari 8 equivalents which return 'object' for typed array constructors.
          return isObject(value) && objToString.call(value) == funcTag;
        }
        
        /**
         * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
         * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an object, else `false`.
         * @example
         *
         * _.isObject({});
         * // => true
         *
         * _.isObject([1, 2, 3]);
         * // => true
         *
         * _.isObject(1);
         * // => false
         */
        function isObject(value) {
          // Avoid a V8 JIT bug in Chrome 19-20.
          // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
          var type = typeof value;
          return !!value && (type == 'object' || type == 'function');
        }
        
        /**
         * Performs a deep comparison between `object` and `source` to determine if
         * `object` contains equivalent property values. If `customizer` is provided
         * it is invoked to compare values. If `customizer` returns `undefined`
         * comparisons are handled by the method instead. The `customizer` is bound
         * to `thisArg` and invoked with three arguments: (value, other, index|key).
         *
         * **Note:** This method supports comparing properties of arrays, booleans,
         * `Date` objects, numbers, `Object` objects, regexes, and strings. Functions
         * and DOM nodes are **not** supported. Provide a customizer function to extend
         * support for comparing other values.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {Object} object The object to inspect.
         * @param {Object} source The object of property values to match.
         * @param {Function} [customizer] The function to customize value comparisons.
         * @param {*} [thisArg] The `this` binding of `customizer`.
         * @returns {boolean} Returns `true` if `object` is a match, else `false`.
         * @example
         *
         * var object = { 'user': 'fred', 'age': 40 };
         *
         * _.isMatch(object, { 'age': 40 });
         * // => true
         *
         * _.isMatch(object, { 'age': 36 });
         * // => false
         *
         * // using a customizer callback
         * var object = { 'greeting': 'hello' };
         * var source = { 'greeting': 'hi' };
         *
         * _.isMatch(object, source, function(value, other) {
     *   return _.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/) || undefined;
     * });
         * // => true
         */
        function isMatch(object, source, customizer, thisArg) {
          customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
          return baseIsMatch(object, getMatchData(source), customizer);
        }
        
        /**
         * Checks if `value` is `NaN`.
         *
         * **Note:** This method is not the same as [`isNaN`](https://es5.github.io/#x15.1.2.4)
         * which returns `true` for `undefined` and other non-numeric values.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
         * @example
         *
         * _.isNaN(NaN);
         * // => true
         *
         * _.isNaN(new Number(NaN));
         * // => true
         *
         * isNaN(undefined);
         * // => true
         *
         * _.isNaN(undefined);
         * // => false
         */
        function isNaN(value) {
          // An `NaN` primitive is the only value that is not equal to itself.
          // Perform the `toStringTag` check first to avoid errors with some host objects in IE.
          return isNumber(value) && value != +value;
        }
        
        /**
         * Checks if `value` is a native function.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
         * @example
         *
         * _.isNative(Array.prototype.push);
         * // => true
         *
         * _.isNative(_);
         * // => false
         */
        function isNative(value) {
          if (value == null) {
            return false;
          }
          if (isFunction(value)) {
            return reIsNative.test(fnToString.call(value));
          }
          return isObjectLike(value) && reIsHostCtor.test(value);
        }
        
        /**
         * Checks if `value` is `null`.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
         * @example
         *
         * _.isNull(null);
         * // => true
         *
         * _.isNull(void 0);
         * // => false
         */
        function isNull(value) {
          return value === null;
        }
        
        /**
         * Checks if `value` is classified as a `Number` primitive or object.
         *
         * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
         * as numbers, use the `_.isFinite` method.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isNumber(8.4);
         * // => true
         *
         * _.isNumber(NaN);
         * // => true
         *
         * _.isNumber('8.4');
         * // => false
         */
        function isNumber(value) {
          return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
        }
        
        /**
         * Checks if `value` is a plain object, that is, an object created by the
         * `Object` constructor or one with a `[[Prototype]]` of `null`.
         *
         * **Note:** This method assumes objects created by the `Object` constructor
         * have no inherited enumerable properties.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     * }
         *
         * _.isPlainObject(new Foo);
         * // => false
         *
         * _.isPlainObject([1, 2, 3]);
         * // => false
         *
         * _.isPlainObject({ 'x': 0, 'y': 0 });
         * // => true
         *
         * _.isPlainObject(Object.create(null));
         * // => true
         */
        function isPlainObject(value) {
          var Ctor;
          
          // Exit early for non `Object` objects.
          if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isArguments(value)) ||
            (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
            return false;
          }
          // IE < 9 iterates inherited properties before own properties. If the first
          // iterated property is an object's own property then there are no inherited
          // enumerable properties.
          var result;
          // In most environments an object's own properties are iterated before
          // its inherited properties. If the last iterated property is an object's
          // own property then there are no inherited enumerable properties.
          baseForIn(value, function(subValue, key) {
            result = key;
          });
          return result === undefined || hasOwnProperty.call(value, result);
        }
        
        /**
         * Checks if `value` is classified as a `RegExp` object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isRegExp(/abc/);
         * // => true
         *
         * _.isRegExp('/abc/');
         * // => false
         */
        function isRegExp(value) {
          return isObject(value) && objToString.call(value) == regexpTag;
        }
        
        /**
         * Checks if `value` is classified as a `String` primitive or object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isString('abc');
         * // => true
         *
         * _.isString(1);
         * // => false
         */
        function isString(value) {
          return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
        }
        
        /**
         * Checks if `value` is classified as a typed array.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
         * @example
         *
         * _.isTypedArray(new Uint8Array);
         * // => true
         *
         * _.isTypedArray([]);
         * // => false
         */
        function isTypedArray(value) {
          return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
        }
        
        /**
         * Checks if `value` is `undefined`.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
         * @example
         *
         * _.isUndefined(void 0);
         * // => true
         *
         * _.isUndefined(null);
         * // => false
         */
        function isUndefined(value) {
          return value === undefined;
        }
        
        /**
         * Checks if `value` is less than `other`.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is less than `other`, else `false`.
         * @example
         *
         * _.lt(1, 3);
         * // => true
         *
         * _.lt(3, 3);
         * // => false
         *
         * _.lt(3, 1);
         * // => false
         */
        function lt(value, other) {
          return value < other;
        }
        
        /**
         * Checks if `value` is less than or equal to `other`.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to compare.
         * @param {*} other The other value to compare.
         * @returns {boolean} Returns `true` if `value` is less than or equal to `other`, else `false`.
         * @example
         *
         * _.lte(1, 3);
         * // => true
         *
         * _.lte(3, 3);
         * // => true
         *
         * _.lte(3, 1);
         * // => false
         */
        function lte(value, other) {
          return value <= other;
        }
        
        /**
         * Converts `value` to an array.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {Array} Returns the converted array.
         * @example
         *
         * (function() {
     *   return _.toArray(arguments).slice(1);
     * }(1, 2, 3));
         * // => [2, 3]
         */
        function toArray(value) {
          var length = value ? getLength(value) : 0;
          if (!isLength(length)) {
            return values(value);
          }
          if (!length) {
            return [];
          }
          return arrayCopy(value);
        }
        
        /**
         * Converts `value` to a plain object flattening inherited enumerable
         * properties of `value` to own properties of the plain object.
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to convert.
         * @returns {Object} Returns the converted plain object.
         * @example
         *
         * function Foo() {
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.assign({ 'a': 1 }, new Foo);
         * // => { 'a': 1, 'b': 2 }
         *
         * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
         * // => { 'a': 1, 'b': 2, 'c': 3 }
         */
        function toPlainObject(value) {
          return baseCopy(value, keysIn(value));
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Recursively merges own enumerable properties of the source object(s), that
         * don't resolve to `undefined` into the destination object. Subsequent sources
         * overwrite property assignments of previous sources. If `customizer` is
         * provided it is invoked to produce the merged values of the destination and
         * source properties. If `customizer` returns `undefined` merging is handled
         * by the method instead. The `customizer` is bound to `thisArg` and invoked
         * with five arguments: (objectValue, sourceValue, key, object, source).
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @param {Function} [customizer] The function to customize assigned values.
         * @param {*} [thisArg] The `this` binding of `customizer`.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var users = {
     *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
     * };
         *
         * var ages = {
     *   'data': [{ 'age': 36 }, { 'age': 40 }]
     * };
         *
         * _.merge(users, ages);
         * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
         *
         * // using a customizer callback
         * var object = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
         *
         * var other = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
         *
         * _.merge(object, other, function(a, b) {
     *   if (_.isArray(a)) {
     *     return a.concat(b);
     *   }
     * });
         * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
         */
        var merge = createAssigner(baseMerge);
        
        /**
         * Assigns own enumerable properties of source object(s) to the destination
         * object. Subsequent sources overwrite property assignments of previous sources.
         * If `customizer` is provided it is invoked to produce the assigned values.
         * The `customizer` is bound to `thisArg` and invoked with five arguments:
         * (objectValue, sourceValue, key, object, source).
         *
         * **Note:** This method mutates `object` and is based on
         * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
         *
         * @static
         * @memberOf _
         * @alias extend
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @param {Function} [customizer] The function to customize assigned values.
         * @param {*} [thisArg] The `this` binding of `customizer`.
         * @returns {Object} Returns `object`.
         * @example
         *
         * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
         * // => { 'user': 'fred', 'age': 40 }
         *
         * // using a customizer callback
         * var defaults = _.partialRight(_.assign, function(value, other) {
     *   return _.isUndefined(value) ? other : value;
     * });
         *
         * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
         * // => { 'user': 'barney', 'age': 36 }
         */
        var assign = createAssigner(function(object, source, customizer) {
          return customizer
            ? assignWith(object, source, customizer)
            : baseAssign(object, source);
        });
        
        /**
         * Creates an object that inherits from the given `prototype` object. If a
         * `properties` object is provided its own enumerable properties are assigned
         * to the created object.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} prototype The object to inherit from.
         * @param {Object} [properties] The properties to assign to the object.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Object} Returns the new object.
         * @example
         *
         * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
         *
         * function Circle() {
     *   Shape.call(this);
     * }
         *
         * Circle.prototype = _.create(Shape.prototype, {
     *   'constructor': Circle
     * });
         *
         * var circle = new Circle;
         * circle instanceof Circle;
         * // => true
         *
         * circle instanceof Shape;
         * // => true
         */
        function create(prototype, properties, guard) {
          var result = baseCreate(prototype);
          if (guard && isIterateeCall(prototype, properties, guard)) {
            properties = undefined;
          }
          return properties ? baseAssign(result, properties) : result;
        }
        
        /**
         * Assigns own enumerable properties of source object(s) to the destination
         * object for all destination properties that resolve to `undefined`. Once a
         * property is set, additional values of the same property are ignored.
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @returns {Object} Returns `object`.
         * @example
         *
         * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
         * // => { 'user': 'barney', 'age': 36 }
         */
        var defaults = createDefaults(assign, assignDefaults);
        
        /**
         * This method is like `_.defaults` except that it recursively assigns
         * default properties.
         *
         * **Note:** This method mutates `object`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The destination object.
         * @param {...Object} [sources] The source objects.
         * @returns {Object} Returns `object`.
         * @example
         *
         * _.defaultsDeep({ 'user': { 'name': 'barney' } }, { 'user': { 'name': 'fred', 'age': 36 } });
         * // => { 'user': { 'name': 'barney', 'age': 36 } }
         *
         */
        var defaultsDeep = createDefaults(merge, mergeDefaults);
        
        /**
         * This method is like `_.find` except that it returns the key of the first
         * element `predicate` returns truthy for instead of the element itself.
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to search.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
         * @example
         *
         * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
         *
         * _.findKey(users, function(chr) {
     *   return chr.age < 40;
     * });
         * // => 'barney' (iteration order is not guaranteed)
         *
         * // using the `_.matches` callback shorthand
         * _.findKey(users, { 'age': 1, 'active': true });
         * // => 'pebbles'
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.findKey(users, 'active', false);
         * // => 'fred'
         *
         * // using the `_.property` callback shorthand
         * _.findKey(users, 'active');
         * // => 'barney'
         */
        var findKey = createFindKey(baseForOwn);
        
        /**
         * This method is like `_.findKey` except that it iterates over elements of
         * a collection in the opposite order.
         *
         * If a property name is provided for `predicate` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `predicate` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to search.
         * @param {Function|Object|string} [predicate=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
         * @example
         *
         * var users = {
     *   'barney':  { 'age': 36, 'active': true },
     *   'fred':    { 'age': 40, 'active': false },
     *   'pebbles': { 'age': 1,  'active': true }
     * };
         *
         * _.findLastKey(users, function(chr) {
     *   return chr.age < 40;
     * });
         * // => returns `pebbles` assuming `_.findKey` returns `barney`
         *
         * // using the `_.matches` callback shorthand
         * _.findLastKey(users, { 'age': 36, 'active': true });
         * // => 'barney'
         *
         * // using the `_.matchesProperty` callback shorthand
         * _.findLastKey(users, 'active', false);
         * // => 'fred'
         *
         * // using the `_.property` callback shorthand
         * _.findLastKey(users, 'active');
         * // => 'pebbles'
         */
        var findLastKey = createFindKey(baseForOwnRight);
        
        /**
         * Iterates over own and inherited enumerable properties of an object invoking
         * `iteratee` for each property. The `iteratee` is bound to `thisArg` and invoked
         * with three arguments: (value, key, object). Iteratee functions may exit
         * iteration early by explicitly returning `false`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns `object`.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.forIn(new Foo, function(value, key) {
     *   console.log(key);
     * });
         * // => logs 'a', 'b', and 'c' (iteration order is not guaranteed)
         */
        var forIn = createForIn(baseFor);
        
        /**
         * This method is like `_.forIn` except that it iterates over properties of
         * `object` in the opposite order.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns `object`.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.forInRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
         * // => logs 'c', 'b', and 'a' assuming `_.forIn ` logs 'a', 'b', and 'c'
         */
        var forInRight = createForIn(baseForRight);
        
        /**
         * Iterates over own enumerable properties of an object invoking `iteratee`
         * for each property. The `iteratee` is bound to `thisArg` and invoked with
         * three arguments: (value, key, object). Iteratee functions may exit iteration
         * early by explicitly returning `false`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns `object`.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.forOwn(new Foo, function(value, key) {
     *   console.log(key);
     * });
         * // => logs 'a' and 'b' (iteration order is not guaranteed)
         */
        var forOwn = createForOwn(baseForOwn);
        
        /**
         * This method is like `_.forOwn` except that it iterates over properties of
         * `object` in the opposite order.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns `object`.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.forOwnRight(new Foo, function(value, key) {
     *   console.log(key);
     * });
         * // => logs 'b' and 'a' assuming `_.forOwn` logs 'a' and 'b'
         */
        var forOwnRight = createForOwn(baseForOwnRight);
        
        /**
         * Creates an array of function property names from all enumerable properties,
         * own and inherited, of `object`.
         *
         * @static
         * @memberOf _
         * @alias methods
         * @category Object
         * @param {Object} object The object to inspect.
         * @returns {Array} Returns the new array of property names.
         * @example
         *
         * _.functions(_);
         * // => ['after', 'ary', 'assign', ...]
         */
        function functions(object) {
          return baseFunctions(object, keysIn(object));
        }
        
        /**
         * Gets the property value at `path` of `object`. If the resolved value is
         * `undefined` the `defaultValue` is used in its place.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @param {Array|string} path The path of the property to get.
         * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
         * @returns {*} Returns the resolved value.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': 3 } }] };
         *
         * _.get(object, 'a[0].b.c');
         * // => 3
         *
         * _.get(object, ['a', '0', 'b', 'c']);
         * // => 3
         *
         * _.get(object, 'a.b.c', 'default');
         * // => 'default'
         */
        function get(object, path, defaultValue) {
          var result = object == null ? undefined : baseGet(object, toPath(path), path + '');
          return result === undefined ? defaultValue : result;
        }
        
        /**
         * Checks if `path` is a direct property.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @param {Array|string} path The path to check.
         * @returns {boolean} Returns `true` if `path` is a direct property, else `false`.
         * @example
         *
         * var object = { 'a': { 'b': { 'c': 3 } } };
         *
         * _.has(object, 'a');
         * // => true
         *
         * _.has(object, 'a.b.c');
         * // => true
         *
         * _.has(object, ['a', 'b', 'c']);
         * // => true
         */
        function has(object, path) {
          if (object == null) {
            return false;
          }
          var result = hasOwnProperty.call(object, path);
          if (!result && !isKey(path)) {
            path = toPath(path);
            object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
            if (object == null) {
              return false;
            }
            path = last(path);
            result = hasOwnProperty.call(object, path);
          }
          return result || (isLength(object.length) && isIndex(path, object.length) &&
            (isArray(object) || isArguments(object)));
        }
        
        /**
         * Creates an object composed of the inverted keys and values of `object`.
         * If `object` contains duplicate values, subsequent values overwrite property
         * assignments of previous values unless `multiValue` is `true`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to invert.
         * @param {boolean} [multiValue] Allow multiple values per key.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Object} Returns the new inverted object.
         * @example
         *
         * var object = { 'a': 1, 'b': 2, 'c': 1 };
         *
         * _.invert(object);
         * // => { '1': 'c', '2': 'b' }
         *
         * // with `multiValue`
         * _.invert(object, true);
         * // => { '1': ['a', 'c'], '2': ['b'] }
         */
        function invert(object, multiValue, guard) {
          if (guard && isIterateeCall(object, multiValue, guard)) {
            multiValue = undefined;
          }
          var index = -1,
            props = keys(object),
            length = props.length,
            result = {};
          
          while (++index < length) {
            var key = props[index],
              value = object[key];
            
            if (multiValue) {
              if (hasOwnProperty.call(result, value)) {
                result[value].push(key);
              } else {
                result[value] = [key];
              }
            }
            else {
              result[value] = key;
            }
          }
          return result;
        }
        
        /**
         * Creates an array of the own enumerable property names of `object`.
         *
         * **Note:** Non-object values are coerced to objects. See the
         * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
         * for more details.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.keys(new Foo);
         * // => ['a', 'b'] (iteration order is not guaranteed)
         *
         * _.keys('hi');
         * // => ['0', '1']
         */
        var keys = !nativeKeys ? shimKeys : function(object) {
          var Ctor = object == null ? undefined : object.constructor;
          if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
            (typeof object != 'function' && isArrayLike(object))) {
            return shimKeys(object);
          }
          return isObject(object) ? nativeKeys(object) : [];
        };
        
        /**
         * Creates an array of the own and inherited enumerable property names of `object`.
         *
         * **Note:** Non-object values are coerced to objects.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property names.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.keysIn(new Foo);
         * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
         */
        function keysIn(object) {
          if (object == null) {
            return [];
          }
          if (!isObject(object)) {
            object = Object(object);
          }
          var length = object.length;
          length = (length && isLength(length) &&
            (isArray(object) || isArguments(object)) && length) || 0;
          
          var Ctor = object.constructor,
            index = -1,
            isProto = typeof Ctor == 'function' && Ctor.prototype === object,
            result = Array(length),
            skipIndexes = length > 0;
          
          while (++index < length) {
            result[index] = (index + '');
          }
          for (var key in object) {
            if (!(skipIndexes && isIndex(key, length)) &&
              !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
              result.push(key);
            }
          }
          return result;
        }
        
        /**
         * The opposite of `_.mapValues`; this method creates an object with the
         * same values as `object` and keys generated by running each own enumerable
         * property of `object` through `iteratee`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns the new mapped object.
         * @example
         *
         * _.mapKeys({ 'a': 1, 'b': 2 }, function(value, key) {
     *   return key + value;
     * });
         * // => { 'a1': 1, 'b2': 2 }
         */
        var mapKeys = createObjectMapper(true);
        
        /**
         * Creates an object with the same keys as `object` and values generated by
         * running each own enumerable property of `object` through `iteratee`. The
         * iteratee function is bound to `thisArg` and invoked with three arguments:
         * (value, key, object).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to iterate over.
         * @param {Function|Object|string} [iteratee=_.identity] The function invoked
         *  per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Object} Returns the new mapped object.
         * @example
         *
         * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
     *   return n * 3;
     * });
         * // => { 'a': 3, 'b': 6 }
         *
         * var users = {
     *   'fred':    { 'user': 'fred',    'age': 40 },
     *   'pebbles': { 'user': 'pebbles', 'age': 1 }
     * };
         *
         * // using the `_.property` callback shorthand
         * _.mapValues(users, 'age');
         * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
         */
        var mapValues = createObjectMapper();
        
        /**
         * The opposite of `_.pick`; this method creates an object composed of the
         * own and inherited enumerable properties of `object` that are not omitted.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The source object.
         * @param {Function|...(string|string[])} [predicate] The function invoked per
         *  iteration or property names to omit, specified as individual property
         *  names or arrays of property names.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Object} Returns the new object.
         * @example
         *
         * var object = { 'user': 'fred', 'age': 40 };
         *
         * _.omit(object, 'age');
         * // => { 'user': 'fred' }
         *
         * _.omit(object, _.isNumber);
         * // => { 'user': 'fred' }
         */
        var omit = restParam(function(object, props) {
          if (object == null) {
            return {};
          }
          if (typeof props[0] != 'function') {
            var props = arrayMap(baseFlatten(props), String);
            return pickByArray(object, baseDifference(keysIn(object), props));
          }
          var predicate = bindCallback(props[0], props[1], 3);
          return pickByCallback(object, function(value, key, object) {
            return !predicate(value, key, object);
          });
        });
        
        /**
         * Creates a two dimensional array of the key-value pairs for `object`,
         * e.g. `[[key1, value1], [key2, value2]]`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the new array of key-value pairs.
         * @example
         *
         * _.pairs({ 'barney': 36, 'fred': 40 });
         * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
         */
        function pairs(object) {
          object = toObject(object);
          
          var index = -1,
            props = keys(object),
            length = props.length,
            result = Array(length);
          
          while (++index < length) {
            var key = props[index];
            result[index] = [key, object[key]];
          }
          return result;
        }
        
        /**
         * Creates an object composed of the picked `object` properties. Property
         * names may be specified as individual arguments or as arrays of property
         * names. If `predicate` is provided it is invoked for each property of `object`
         * picking the properties `predicate` returns truthy for. The predicate is
         * bound to `thisArg` and invoked with three arguments: (value, key, object).
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The source object.
         * @param {Function|...(string|string[])} [predicate] The function invoked per
         *  iteration or property names to pick, specified as individual property
         *  names or arrays of property names.
         * @param {*} [thisArg] The `this` binding of `predicate`.
         * @returns {Object} Returns the new object.
         * @example
         *
         * var object = { 'user': 'fred', 'age': 40 };
         *
         * _.pick(object, 'user');
         * // => { 'user': 'fred' }
         *
         * _.pick(object, _.isString);
         * // => { 'user': 'fred' }
         */
        var pick = restParam(function(object, props) {
          if (object == null) {
            return {};
          }
          return typeof props[0] == 'function'
            ? pickByCallback(object, bindCallback(props[0], props[1], 3))
            : pickByArray(object, baseFlatten(props));
        });
        
        /**
         * This method is like `_.get` except that if the resolved value is a function
         * it is invoked with the `this` binding of its parent object and its result
         * is returned.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @param {Array|string} path The path of the property to resolve.
         * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
         * @returns {*} Returns the resolved value.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c1': 3, 'c2': _.constant(4) } }] };
         *
         * _.result(object, 'a[0].b.c1');
         * // => 3
         *
         * _.result(object, 'a[0].b.c2');
         * // => 4
         *
         * _.result(object, 'a.b.c', 'default');
         * // => 'default'
         *
         * _.result(object, 'a.b.c', _.constant('default'));
         * // => 'default'
         */
        function result(object, path, defaultValue) {
          var result = object == null ? undefined : object[path];
          if (result === undefined) {
            if (object != null && !isKey(path, object)) {
              path = toPath(path);
              object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
              result = object == null ? undefined : object[last(path)];
            }
            result = result === undefined ? defaultValue : result;
          }
          return isFunction(result) ? result.call(object) : result;
        }
        
        /**
         * Sets the property value of `path` on `object`. If a portion of `path`
         * does not exist it is created.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to augment.
         * @param {Array|string} path The path of the property to set.
         * @param {*} value The value to set.
         * @returns {Object} Returns `object`.
         * @example
         *
         * var object = { 'a': [{ 'b': { 'c': 3 } }] };
         *
         * _.set(object, 'a[0].b.c', 4);
         * console.log(object.a[0].b.c);
         * // => 4
         *
         * _.set(object, 'x[0].y.z', 5);
         * console.log(object.x[0].y.z);
         * // => 5
         */
        function set(object, path, value) {
          if (object == null) {
            return object;
          }
          var pathKey = (path + '');
          path = (object[pathKey] != null || isKey(path, object)) ? [pathKey] : toPath(path);
          
          var index = -1,
            length = path.length,
            lastIndex = length - 1,
            nested = object;
          
          while (nested != null && ++index < length) {
            var key = path[index];
            if (isObject(nested)) {
              if (index == lastIndex) {
                nested[key] = value;
              } else if (nested[key] == null) {
                nested[key] = isIndex(path[index + 1]) ? [] : {};
              }
            }
            nested = nested[key];
          }
          return object;
        }
        
        /**
         * An alternative to `_.reduce`; this method transforms `object` to a new
         * `accumulator` object which is the result of running each of its own enumerable
         * properties through `iteratee`, with each invocation potentially mutating
         * the `accumulator` object. The `iteratee` is bound to `thisArg` and invoked
         * with four arguments: (accumulator, value, key, object). Iteratee functions
         * may exit iteration early by explicitly returning `false`.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Array|Object} object The object to iterate over.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [accumulator] The custom accumulator value.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {*} Returns the accumulated value.
         * @example
         *
         * _.transform([2, 3, 4], function(result, n) {
     *   result.push(n *= n);
     *   return n % 2 == 0;
     * });
         * // => [4, 9]
         *
         * _.transform({ 'a': 1, 'b': 2 }, function(result, n, key) {
     *   result[key] = n * 3;
     * });
         * // => { 'a': 3, 'b': 6 }
         */
        function transform(object, iteratee, accumulator, thisArg) {
          var isArr = isArray(object) || isTypedArray(object);
          iteratee = getCallback(iteratee, thisArg, 4);
          
          if (accumulator == null) {
            if (isArr || isObject(object)) {
              var Ctor = object.constructor;
              if (isArr) {
                accumulator = isArray(object) ? new Ctor : [];
              } else {
                accumulator = baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
              }
            } else {
              accumulator = {};
            }
          }
          (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
            return iteratee(accumulator, value, index, object);
          });
          return accumulator;
        }
        
        /**
         * Creates an array of the own enumerable property values of `object`.
         *
         * **Note:** Non-object values are coerced to objects.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property values.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.values(new Foo);
         * // => [1, 2] (iteration order is not guaranteed)
         *
         * _.values('hi');
         * // => ['h', 'i']
         */
        function values(object) {
          return baseValues(object, keys(object));
        }
        
        /**
         * Creates an array of the own and inherited enumerable property values
         * of `object`.
         *
         * **Note:** Non-object values are coerced to objects.
         *
         * @static
         * @memberOf _
         * @category Object
         * @param {Object} object The object to query.
         * @returns {Array} Returns the array of property values.
         * @example
         *
         * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
         *
         * Foo.prototype.c = 3;
         *
         * _.valuesIn(new Foo);
         * // => [1, 2, 3] (iteration order is not guaranteed)
         */
        function valuesIn(object) {
          return baseValues(object, keysIn(object));
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Checks if `n` is between `start` and up to but not including, `end`. If
         * `end` is not specified it is set to `start` with `start` then set to `0`.
         *
         * @static
         * @memberOf _
         * @category Number
         * @param {number} n The number to check.
         * @param {number} [start=0] The start of the range.
         * @param {number} end The end of the range.
         * @returns {boolean} Returns `true` if `n` is in the range, else `false`.
         * @example
         *
         * _.inRange(3, 2, 4);
         * // => true
         *
         * _.inRange(4, 8);
         * // => true
         *
         * _.inRange(4, 2);
         * // => false
         *
         * _.inRange(2, 2);
         * // => false
         *
         * _.inRange(1.2, 2);
         * // => true
         *
         * _.inRange(5.2, 4);
         * // => false
         */
        function inRange(value, start, end) {
          start = +start || 0;
          if (end === undefined) {
            end = start;
            start = 0;
          } else {
            end = +end || 0;
          }
          return value >= nativeMin(start, end) && value < nativeMax(start, end);
        }
        
        /**
         * Produces a random number between `min` and `max` (inclusive). If only one
         * argument is provided a number between `0` and the given number is returned.
         * If `floating` is `true`, or either `min` or `max` are floats, a floating-point
         * number is returned instead of an integer.
         *
         * @static
         * @memberOf _
         * @category Number
         * @param {number} [min=0] The minimum possible value.
         * @param {number} [max=1] The maximum possible value.
         * @param {boolean} [floating] Specify returning a floating-point number.
         * @returns {number} Returns the random number.
         * @example
         *
         * _.random(0, 5);
         * // => an integer between 0 and 5
         *
         * _.random(5);
         * // => also an integer between 0 and 5
         *
         * _.random(5, true);
         * // => a floating-point number between 0 and 5
         *
         * _.random(1.2, 5.2);
         * // => a floating-point number between 1.2 and 5.2
         */
        function random(min, max, floating) {
          if (floating && isIterateeCall(min, max, floating)) {
            max = floating = undefined;
          }
          var noMin = min == null,
            noMax = max == null;
          
          if (floating == null) {
            if (noMax && typeof min == 'boolean') {
              floating = min;
              min = 1;
            }
            else if (typeof max == 'boolean') {
              floating = max;
              noMax = true;
            }
          }
          if (noMin && noMax) {
            max = 1;
            noMax = false;
          }
          min = +min || 0;
          if (noMax) {
            max = min;
            min = 0;
          } else {
            max = +max || 0;
          }
          if (floating || min % 1 || max % 1) {
            var rand = nativeRandom();
            return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1)))), max);
          }
          return baseRandom(min, max);
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Converts `string` to [camel case](https://en.wikipedia.org/wiki/CamelCase).
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the camel cased string.
         * @example
         *
         * _.camelCase('Foo Bar');
         * // => 'fooBar'
         *
         * _.camelCase('--foo-bar');
         * // => 'fooBar'
         *
         * _.camelCase('__foo_bar__');
         * // => 'fooBar'
         */
        var camelCase = createCompounder(function(result, word, index) {
          word = word.toLowerCase();
          return result + (index ? (word.charAt(0).toUpperCase() + word.slice(1)) : word);
        });
        
        /**
         * Capitalizes the first character of `string`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to capitalize.
         * @returns {string} Returns the capitalized string.
         * @example
         *
         * _.capitalize('fred');
         * // => 'Fred'
         */
        function capitalize(string) {
          string = baseToString(string);
          return string && (string.charAt(0).toUpperCase() + string.slice(1));
        }
        
        /**
         * Deburrs `string` by converting [latin-1 supplementary letters](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
         * to basic latin letters and removing [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to deburr.
         * @returns {string} Returns the deburred string.
         * @example
         *
         * _.deburr('dÃ©jÃ  vu');
         * // => 'deja vu'
         */
        function deburr(string) {
          string = baseToString(string);
          return string && string.replace(reLatin1, deburrLetter).replace(reComboMark, '');
        }
        
        /**
         * Checks if `string` ends with the given target string.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to search.
         * @param {string} [target] The string to search for.
         * @param {number} [position=string.length] The position to search from.
         * @returns {boolean} Returns `true` if `string` ends with `target`, else `false`.
         * @example
         *
         * _.endsWith('abc', 'c');
         * // => true
         *
         * _.endsWith('abc', 'b');
         * // => false
         *
         * _.endsWith('abc', 'b', 2);
         * // => true
         */
        function endsWith(string, target, position) {
          string = baseToString(string);
          target = (target + '');
          
          var length = string.length;
          position = position === undefined
            ? length
            : nativeMin(position < 0 ? 0 : (+position || 0), length);
          
          position -= target.length;
          return position >= 0 && string.indexOf(target, position) == position;
        }
        
        /**
         * Converts the characters "&", "<", ">", '"', "'", and "\`", in `string` to
         * their corresponding HTML entities.
         *
         * **Note:** No other characters are escaped. To escape additional characters
         * use a third-party library like [_he_](https://mths.be/he).
         *
         * Though the ">" character is escaped for symmetry, characters like
         * ">" and "/" don't need escaping in HTML and have no special meaning
         * unless they're part of a tag or unquoted attribute value.
         * See [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
         * (under "semi-related fun fact") for more details.
         *
         * Backticks are escaped because in Internet Explorer < 9, they can break out
         * of attribute values or HTML comments. See [#59](https://html5sec.org/#59),
         * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
         * [#133](https://html5sec.org/#133) of the [HTML5 Security Cheatsheet](https://html5sec.org/)
         * for more details.
         *
         * When working with HTML you should always [quote attribute values](http://wonko.com/post/html-escaping)
         * to reduce XSS vectors.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to escape.
         * @returns {string} Returns the escaped string.
         * @example
         *
         * _.escape('fred, barney, & pebbles');
         * // => 'fred, barney, &amp; pebbles'
         */
        function escape(string) {
          // Reset `lastIndex` because in IE < 9 `String#replace` does not.
          string = baseToString(string);
          return (string && reHasUnescapedHtml.test(string))
            ? string.replace(reUnescapedHtml, escapeHtmlChar)
            : string;
        }
        
        /**
         * Escapes the `RegExp` special characters "\", "/", "^", "$", ".", "|", "?",
         * "*", "+", "(", ")", "[", "]", "{" and "}" in `string`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to escape.
         * @returns {string} Returns the escaped string.
         * @example
         *
         * _.escapeRegExp('[lodash](https://lodash.com/)');
         * // => '\[lodash\]\(https:\/\/lodash\.com\/\)'
         */
        function escapeRegExp(string) {
          string = baseToString(string);
          return (string && reHasRegExpChars.test(string))
            ? string.replace(reRegExpChars, escapeRegExpChar)
            : (string || '(?:)');
        }
        
        /**
         * Converts `string` to [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the kebab cased string.
         * @example
         *
         * _.kebabCase('Foo Bar');
         * // => 'foo-bar'
         *
         * _.kebabCase('fooBar');
         * // => 'foo-bar'
         *
         * _.kebabCase('__foo_bar__');
         * // => 'foo-bar'
         */
        var kebabCase = createCompounder(function(result, word, index) {
          return result + (index ? '-' : '') + word.toLowerCase();
        });
        
        /**
         * Pads `string` on the left and right sides if it's shorter than `length`.
         * Padding characters are truncated if they can't be evenly divided by `length`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to pad.
         * @param {number} [length=0] The padding length.
         * @param {string} [chars=' '] The string used as padding.
         * @returns {string} Returns the padded string.
         * @example
         *
         * _.pad('abc', 8);
         * // => '  abc   '
         *
         * _.pad('abc', 8, '_-');
         * // => '_-abc_-_'
         *
         * _.pad('abc', 3);
         * // => 'abc'
         */
        function pad(string, length, chars) {
          string = baseToString(string);
          length = +length;
          
          var strLength = string.length;
          if (strLength >= length || !nativeIsFinite(length)) {
            return string;
          }
          var mid = (length - strLength) / 2,
            leftLength = nativeFloor(mid),
            rightLength = nativeCeil(mid);
          
          chars = createPadding('', rightLength, chars);
          return chars.slice(0, leftLength) + string + chars;
        }
        
        /**
         * Pads `string` on the left side if it's shorter than `length`. Padding
         * characters are truncated if they exceed `length`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to pad.
         * @param {number} [length=0] The padding length.
         * @param {string} [chars=' '] The string used as padding.
         * @returns {string} Returns the padded string.
         * @example
         *
         * _.padLeft('abc', 6);
         * // => '   abc'
         *
         * _.padLeft('abc', 6, '_-');
         * // => '_-_abc'
         *
         * _.padLeft('abc', 3);
         * // => 'abc'
         */
        var padLeft = createPadDir();
        
        /**
         * Pads `string` on the right side if it's shorter than `length`. Padding
         * characters are truncated if they exceed `length`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to pad.
         * @param {number} [length=0] The padding length.
         * @param {string} [chars=' '] The string used as padding.
         * @returns {string} Returns the padded string.
         * @example
         *
         * _.padRight('abc', 6);
         * // => 'abc   '
         *
         * _.padRight('abc', 6, '_-');
         * // => 'abc_-_'
         *
         * _.padRight('abc', 3);
         * // => 'abc'
         */
        var padRight = createPadDir(true);
        
        /**
         * Converts `string` to an integer of the specified radix. If `radix` is
         * `undefined` or `0`, a `radix` of `10` is used unless `value` is a hexadecimal,
         * in which case a `radix` of `16` is used.
         *
         * **Note:** This method aligns with the [ES5 implementation](https://es5.github.io/#E)
         * of `parseInt`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} string The string to convert.
         * @param {number} [radix] The radix to interpret `value` by.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {number} Returns the converted integer.
         * @example
         *
         * _.parseInt('08');
         * // => 8
         *
         * _.map(['6', '08', '10'], _.parseInt);
         * // => [6, 8, 10]
         */
        function parseInt(string, radix, guard) {
          // Firefox < 21 and Opera < 15 follow ES3 for `parseInt`.
          // Chrome fails to trim leading <BOM> whitespace characters.
          // See https://code.google.com/p/v8/issues/detail?id=3109 for more details.
          if (guard ? isIterateeCall(string, radix, guard) : radix == null) {
            radix = 0;
          } else if (radix) {
            radix = +radix;
          }
          string = trim(string);
          return nativeParseInt(string, radix || (reHasHexPrefix.test(string) ? 16 : 10));
        }
        
        /**
         * Repeats the given string `n` times.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to repeat.
         * @param {number} [n=0] The number of times to repeat the string.
         * @returns {string} Returns the repeated string.
         * @example
         *
         * _.repeat('*', 3);
         * // => '***'
         *
         * _.repeat('abc', 2);
         * // => 'abcabc'
         *
         * _.repeat('abc', 0);
         * // => ''
         */
        function repeat(string, n) {
          var result = '';
          string = baseToString(string);
          n = +n;
          if (n < 1 || !string || !nativeIsFinite(n)) {
            return result;
          }
          // Leverage the exponentiation by squaring algorithm for a faster repeat.
          // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
          do {
            if (n % 2) {
              result += string;
            }
            n = nativeFloor(n / 2);
            string += string;
          } while (n);
          
          return result;
        }
        
        /**
         * Converts `string` to [snake case](https://en.wikipedia.org/wiki/Snake_case).
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the snake cased string.
         * @example
         *
         * _.snakeCase('Foo Bar');
         * // => 'foo_bar'
         *
         * _.snakeCase('fooBar');
         * // => 'foo_bar'
         *
         * _.snakeCase('--foo-bar');
         * // => 'foo_bar'
         */
        var snakeCase = createCompounder(function(result, word, index) {
          return result + (index ? '_' : '') + word.toLowerCase();
        });
        
        /**
         * Converts `string` to [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to convert.
         * @returns {string} Returns the start cased string.
         * @example
         *
         * _.startCase('--foo-bar');
         * // => 'Foo Bar'
         *
         * _.startCase('fooBar');
         * // => 'Foo Bar'
         *
         * _.startCase('__foo_bar__');
         * // => 'Foo Bar'
         */
        var startCase = createCompounder(function(result, word, index) {
          return result + (index ? ' ' : '') + (word.charAt(0).toUpperCase() + word.slice(1));
        });
        
        /**
         * Checks if `string` starts with the given target string.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to search.
         * @param {string} [target] The string to search for.
         * @param {number} [position=0] The position to search from.
         * @returns {boolean} Returns `true` if `string` starts with `target`, else `false`.
         * @example
         *
         * _.startsWith('abc', 'a');
         * // => true
         *
         * _.startsWith('abc', 'b');
         * // => false
         *
         * _.startsWith('abc', 'b', 1);
         * // => true
         */
        function startsWith(string, target, position) {
          string = baseToString(string);
          position = position == null
            ? 0
            : nativeMin(position < 0 ? 0 : (+position || 0), string.length);
          
          return string.lastIndexOf(target, position) == position;
        }
        
        /**
         * Creates a compiled template function that can interpolate data properties
         * in "interpolate" delimiters, HTML-escape interpolated data properties in
         * "escape" delimiters, and execute JavaScript in "evaluate" delimiters. Data
         * properties may be accessed as free variables in the template. If a setting
         * object is provided it takes precedence over `_.templateSettings` values.
         *
         * **Note:** In the development build `_.template` utilizes
         * [sourceURLs](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl)
         * for easier debugging.
         *
         * For more information on precompiling templates see
         * [lodash's custom builds documentation](https://lodash.com/custom-builds).
         *
         * For more information on Chrome extension sandboxes see
         * [Chrome's extensions documentation](https://developer.chrome.com/extensions/sandboxingEval).
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The template string.
         * @param {Object} [options] The options object.
         * @param {RegExp} [options.escape] The HTML "escape" delimiter.
         * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
         * @param {Object} [options.imports] An object to import into the template as free variables.
         * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
         * @param {string} [options.sourceURL] The sourceURL of the template's compiled source.
         * @param {string} [options.variable] The data object variable name.
         * @param- {Object} [otherOptions] Enables the legacy `options` param signature.
         * @returns {Function} Returns the compiled template function.
         * @example
         *
         * // using the "interpolate" delimiter to create a compiled template
         * var compiled = _.template('hello <%= user %>!');
         * compiled({ 'user': 'fred' });
         * // => 'hello fred!'
         *
         * // using the HTML "escape" delimiter to escape data property values
         * var compiled = _.template('<b><%- value %></b>');
         * compiled({ 'value': '<script>' });
         * // => '<b>&lt;script&gt;</b>'
         *
         * // using the "evaluate" delimiter to execute JavaScript and generate HTML
         * var compiled = _.template('<% _.forEach(users, function(user) { %><li><%- user %></li><% }); %>');
         * compiled({ 'users': ['fred', 'barney'] });
         * // => '<li>fred</li><li>barney</li>'
         *
         * // using the internal `print` function in "evaluate" delimiters
         * var compiled = _.template('<% print("hello " + user); %>!');
         * compiled({ 'user': 'barney' });
         * // => 'hello barney!'
         *
         * // using the ES delimiter as an alternative to the default "interpolate" delimiter
         * var compiled = _.template('hello ${ user }!');
         * compiled({ 'user': 'pebbles' });
         * // => 'hello pebbles!'
         *
         * // using custom template delimiters
         * _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
         * var compiled = _.template('hello {{ user }}!');
         * compiled({ 'user': 'mustache' });
         * // => 'hello mustache!'
         *
         * // using backslashes to treat delimiters as plain text
         * var compiled = _.template('<%= "\\<%- value %\\>" %>');
         * compiled({ 'value': 'ignored' });
         * // => '<%- value %>'
         *
         * // using the `imports` option to import `jQuery` as `jq`
         * var text = '<% jq.each(users, function(user) { %><li><%- user %></li><% }); %>';
         * var compiled = _.template(text, { 'imports': { 'jq': jQuery } });
         * compiled({ 'users': ['fred', 'barney'] });
         * // => '<li>fred</li><li>barney</li>'
         *
         * // using the `sourceURL` option to specify a custom sourceURL for the template
         * var compiled = _.template('hello <%= user %>!', { 'sourceURL': '/basic/greeting.jst' });
         * compiled(data);
         * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
         *
         * // using the `variable` option to ensure a with-statement isn't used in the compiled template
         * var compiled = _.template('hi <%= data.user %>!', { 'variable': 'data' });
         * compiled.source;
         * // => function(data) {
     * //   var __t, __p = '';
     * //   __p += 'hi ' + ((__t = ( data.user )) == null ? '' : __t) + '!';
     * //   return __p;
     * // }
         *
         * // using the `source` property to inline compiled templates for meaningful
         * // line numbers in error messages and a stack trace
         * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
         *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
         * ');
         */
        function template(string, options, otherOptions) {
          // Based on John Resig's `tmpl` implementation (http://ejohn.org/blog/javascript-micro-templating/)
          // and Laura Doktorova's doT.js (https://github.com/olado/doT).
          var settings = lodash.templateSettings;
          
          if (otherOptions && isIterateeCall(string, options, otherOptions)) {
            options = otherOptions = undefined;
          }
          string = baseToString(string);
          options = assignWith(baseAssign({}, otherOptions || options), settings, assignOwnDefaults);
          
          var imports = assignWith(baseAssign({}, options.imports), settings.imports, assignOwnDefaults),
            importsKeys = keys(imports),
            importsValues = baseValues(imports, importsKeys);
          
          var isEscaping,
            isEvaluating,
            index = 0,
            interpolate = options.interpolate || reNoMatch,
            source = "__p += '";
          
          // Compile the regexp to match each delimiter.
          var reDelimiters = RegExp(
            (options.escape || reNoMatch).source + '|' +
            interpolate.source + '|' +
            (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
            (options.evaluate || reNoMatch).source + '|$'
            , 'g');
          
          // Use a sourceURL for easier debugging.
          var sourceURL = '//# sourceURL=' +
            ('sourceURL' in options
                ? options.sourceURL
                : ('lodash.templateSources[' + (++templateCounter) + ']')
            ) + '\n';
          
          string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
            interpolateValue || (interpolateValue = esTemplateValue);
            
            // Escape characters that can't be included in string literals.
            source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);
            
            // Replace delimiters with snippets.
            if (escapeValue) {
              isEscaping = true;
              source += "' +\n__e(" + escapeValue + ") +\n'";
            }
            if (evaluateValue) {
              isEvaluating = true;
              source += "';\n" + evaluateValue + ";\n__p += '";
            }
            if (interpolateValue) {
              source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
            }
            index = offset + match.length;
            
            // The JS engine embedded in Adobe products requires returning the `match`
            // string in order to produce the correct `offset` value.
            return match;
          });
          
          source += "';\n";
          
          // If `variable` is not specified wrap a with-statement around the generated
          // code to add the data object to the top of the scope chain.
          var variable = options.variable;
          if (!variable) {
            source = 'with (obj) {\n' + source + '\n}\n';
          }
          // Cleanup code by stripping empty strings.
          source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
            .replace(reEmptyStringMiddle, '$1')
            .replace(reEmptyStringTrailing, '$1;');
          
          // Frame code as the function body.
          source = 'function(' + (variable || 'obj') + ') {\n' +
            (variable
                ? ''
                : 'obj || (obj = {});\n'
            ) +
            "var __t, __p = ''" +
            (isEscaping
                ? ', __e = _.escape'
                : ''
            ) +
            (isEvaluating
                ? ', __j = Array.prototype.join;\n' +
              "function print() { __p += __j.call(arguments, '') }\n"
                : ';\n'
            ) +
            source +
            'return __p\n}';
          
          var result = attempt(function() {
            return Function(importsKeys, sourceURL + 'return ' + source).apply(undefined, importsValues);
          });
          
          // Provide the compiled function's source by its `toString` method or
          // the `source` property as a convenience for inlining compiled templates.
          result.source = source;
          if (isError(result)) {
            throw result;
          }
          return result;
        }
        
        /**
         * Removes leading and trailing whitespace or specified characters from `string`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to trim.
         * @param {string} [chars=whitespace] The characters to trim.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {string} Returns the trimmed string.
         * @example
         *
         * _.trim('  abc  ');
         * // => 'abc'
         *
         * _.trim('-_-abc-_-', '_-');
         * // => 'abc'
         *
         * _.map(['  foo  ', '  bar  '], _.trim);
         * // => ['foo', 'bar']
         */
        function trim(string, chars, guard) {
          var value = string;
          string = baseToString(string);
          if (!string) {
            return string;
          }
          if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
            return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);
          }
          chars = (chars + '');
          return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);
        }
        
        /**
         * Removes leading whitespace or specified characters from `string`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to trim.
         * @param {string} [chars=whitespace] The characters to trim.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {string} Returns the trimmed string.
         * @example
         *
         * _.trimLeft('  abc  ');
         * // => 'abc  '
         *
         * _.trimLeft('-_-abc-_-', '_-');
         * // => 'abc-_-'
         */
        function trimLeft(string, chars, guard) {
          var value = string;
          string = baseToString(string);
          if (!string) {
            return string;
          }
          if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
            return string.slice(trimmedLeftIndex(string));
          }
          return string.slice(charsLeftIndex(string, (chars + '')));
        }
        
        /**
         * Removes trailing whitespace or specified characters from `string`.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to trim.
         * @param {string} [chars=whitespace] The characters to trim.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {string} Returns the trimmed string.
         * @example
         *
         * _.trimRight('  abc  ');
         * // => '  abc'
         *
         * _.trimRight('-_-abc-_-', '_-');
         * // => '-_-abc'
         */
        function trimRight(string, chars, guard) {
          var value = string;
          string = baseToString(string);
          if (!string) {
            return string;
          }
          if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
            return string.slice(0, trimmedRightIndex(string) + 1);
          }
          return string.slice(0, charsRightIndex(string, (chars + '')) + 1);
        }
        
        /**
         * Truncates `string` if it's longer than the given maximum string length.
         * The last characters of the truncated string are replaced with the omission
         * string which defaults to "...".
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to truncate.
         * @param {Object|number} [options] The options object or maximum string length.
         * @param {number} [options.length=30] The maximum string length.
         * @param {string} [options.omission='...'] The string to indicate text is omitted.
         * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {string} Returns the truncated string.
         * @example
         *
         * _.trunc('hi-diddly-ho there, neighborino');
         * // => 'hi-diddly-ho there, neighbo...'
         *
         * _.trunc('hi-diddly-ho there, neighborino', 24);
         * // => 'hi-diddly-ho there, n...'
         *
         * _.trunc('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': ' '
     * });
         * // => 'hi-diddly-ho there,...'
         *
         * _.trunc('hi-diddly-ho there, neighborino', {
     *   'length': 24,
     *   'separator': /,? +/
     * });
         * // => 'hi-diddly-ho there...'
         *
         * _.trunc('hi-diddly-ho there, neighborino', {
     *   'omission': ' [...]'
     * });
         * // => 'hi-diddly-ho there, neig [...]'
         */
        function trunc(string, options, guard) {
          if (guard && isIterateeCall(string, options, guard)) {
            options = undefined;
          }
          var length = DEFAULT_TRUNC_LENGTH,
            omission = DEFAULT_TRUNC_OMISSION;
          
          if (options != null) {
            if (isObject(options)) {
              var separator = 'separator' in options ? options.separator : separator;
              length = 'length' in options ? (+options.length || 0) : length;
              omission = 'omission' in options ? baseToString(options.omission) : omission;
            } else {
              length = +options || 0;
            }
          }
          string = baseToString(string);
          if (length >= string.length) {
            return string;
          }
          var end = length - omission.length;
          if (end < 1) {
            return omission;
          }
          var result = string.slice(0, end);
          if (separator == null) {
            return result + omission;
          }
          if (isRegExp(separator)) {
            if (string.slice(end).search(separator)) {
              var match,
                newEnd,
                substring = string.slice(0, end);
              
              if (!separator.global) {
                separator = RegExp(separator.source, (reFlags.exec(separator) || '') + 'g');
              }
              separator.lastIndex = 0;
              while ((match = separator.exec(substring))) {
                newEnd = match.index;
              }
              result = result.slice(0, newEnd == null ? end : newEnd);
            }
          } else if (string.indexOf(separator, end) != end) {
            var index = result.lastIndexOf(separator);
            if (index > -1) {
              result = result.slice(0, index);
            }
          }
          return result + omission;
        }
        
        /**
         * The inverse of `_.escape`; this method converts the HTML entities
         * `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, and `&#96;` in `string` to their
         * corresponding characters.
         *
         * **Note:** No other HTML entities are unescaped. To unescape additional HTML
         * entities use a third-party library like [_he_](https://mths.be/he).
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to unescape.
         * @returns {string} Returns the unescaped string.
         * @example
         *
         * _.unescape('fred, barney, &amp; pebbles');
         * // => 'fred, barney, & pebbles'
         */
        function unescape(string) {
          string = baseToString(string);
          return (string && reHasEscapedHtml.test(string))
            ? string.replace(reEscapedHtml, unescapeHtmlChar)
            : string;
        }
        
        /**
         * Splits `string` into an array of its words.
         *
         * @static
         * @memberOf _
         * @category String
         * @param {string} [string=''] The string to inspect.
         * @param {RegExp|string} [pattern] The pattern to match words.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Array} Returns the words of `string`.
         * @example
         *
         * _.words('fred, barney, & pebbles');
         * // => ['fred', 'barney', 'pebbles']
         *
         * _.words('fred, barney, & pebbles', /[^, ]+/g);
         * // => ['fred', 'barney', '&', 'pebbles']
         */
        function words(string, pattern, guard) {
          if (guard && isIterateeCall(string, pattern, guard)) {
            pattern = undefined;
          }
          string = baseToString(string);
          return string.match(pattern || reWords) || [];
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Attempts to invoke `func`, returning either the result or the caught error
         * object. Any additional arguments are provided to `func` when it is invoked.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {Function} func The function to attempt.
         * @returns {*} Returns the `func` result or error object.
         * @example
         *
         * // avoid throwing errors for invalid selectors
         * var elements = _.attempt(function(selector) {
     *   return document.querySelectorAll(selector);
     * }, '>_>');
         *
         * if (_.isError(elements)) {
     *   elements = [];
     * }
         */
        var attempt = restParam(function(func, args) {
          try {
            return func.apply(undefined, args);
          } catch(e) {
            return isError(e) ? e : new Error(e);
          }
        });
        
        /**
         * Creates a function that invokes `func` with the `this` binding of `thisArg`
         * and arguments of the created function. If `func` is a property name the
         * created callback returns the property value for a given element. If `func`
         * is an object the created callback returns `true` for elements that contain
         * the equivalent object properties, otherwise it returns `false`.
         *
         * @static
         * @memberOf _
         * @alias iteratee
         * @category Utility
         * @param {*} [func=_.identity] The value to convert to a callback.
         * @param {*} [thisArg] The `this` binding of `func`.
         * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
         * @returns {Function} Returns the callback.
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36 },
         *   { 'user': 'fred',   'age': 40 }
         * ];
         *
         * // wrap to create custom callback shorthands
         * _.callback = _.wrap(_.callback, function(callback, func, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(func);
     *   if (!match) {
     *     return callback(func, thisArg);
     *   }
     *   return function(object) {
     *     return match[2] == 'gt'
     *       ? object[match[1]] > match[3]
     *       : object[match[1]] < match[3];
     *   };
     * });
         *
         * _.filter(users, 'age__gt36');
         * // => [{ 'user': 'fred', 'age': 40 }]
         */
        function callback(func, thisArg, guard) {
          if (guard && isIterateeCall(func, thisArg, guard)) {
            thisArg = undefined;
          }
          return isObjectLike(func)
            ? matches(func)
            : baseCallback(func, thisArg);
        }
        
        /**
         * Creates a function that returns `value`.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {*} value The value to return from the new function.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var object = { 'user': 'fred' };
         * var getter = _.constant(object);
         *
         * getter() === object;
         * // => true
         */
        function constant(value) {
          return function() {
            return value;
          };
        }
        
        /**
         * This method returns the first argument provided to it.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {*} value Any value.
         * @returns {*} Returns `value`.
         * @example
         *
         * var object = { 'user': 'fred' };
         *
         * _.identity(object) === object;
         * // => true
         */
        function identity(value) {
          return value;
        }
        
        /**
         * Creates a function that performs a deep comparison between a given object
         * and `source`, returning `true` if the given object has equivalent property
         * values, else `false`.
         *
         * **Note:** This method supports comparing arrays, booleans, `Date` objects,
         * numbers, `Object` objects, regexes, and strings. Objects are compared by
         * their own, not inherited, enumerable properties. For comparing a single
         * own or inherited property value see `_.matchesProperty`.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {Object} source The object of property values to match.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36, 'active': true },
         *   { 'user': 'fred',   'age': 40, 'active': false }
         * ];
         *
         * _.filter(users, _.matches({ 'age': 40, 'active': false }));
         * // => [{ 'user': 'fred', 'age': 40, 'active': false }]
         */
        function matches(source) {
          return baseMatches(baseClone(source, true));
        }
        
        /**
         * Creates a function that compares the property value of `path` on a given
         * object to `value`.
         *
         * **Note:** This method supports comparing arrays, booleans, `Date` objects,
         * numbers, `Object` objects, regexes, and strings. Objects are compared by
         * their own, not inherited, enumerable properties.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {Array|string} path The path of the property to get.
         * @param {*} srcValue The value to match.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var users = [
         *   { 'user': 'barney' },
         *   { 'user': 'fred' }
         * ];
         *
         * _.find(users, _.matchesProperty('user', 'fred'));
         * // => { 'user': 'fred' }
         */
        function matchesProperty(path, srcValue) {
          return baseMatchesProperty(path, baseClone(srcValue, true));
        }
        
        /**
         * Creates a function that invokes the method at `path` on a given object.
         * Any additional arguments are provided to the invoked method.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {Array|string} path The path of the method to invoke.
         * @param {...*} [args] The arguments to invoke the method with.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var objects = [
         *   { 'a': { 'b': { 'c': _.constant(2) } } },
         *   { 'a': { 'b': { 'c': _.constant(1) } } }
         * ];
         *
         * _.map(objects, _.method('a.b.c'));
         * // => [2, 1]
         *
         * _.invoke(_.sortBy(objects, _.method(['a', 'b', 'c'])), 'a.b.c');
         * // => [1, 2]
         */
        var method = restParam(function(path, args) {
          return function(object) {
            return invokePath(object, path, args);
          };
        });
        
        /**
         * The opposite of `_.method`; this method creates a function that invokes
         * the method at a given path on `object`. Any additional arguments are
         * provided to the invoked method.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {Object} object The object to query.
         * @param {...*} [args] The arguments to invoke the method with.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var array = _.times(3, _.constant),
         *     object = { 'a': array, 'b': array, 'c': array };
         *
         * _.map(['a[2]', 'c[0]'], _.methodOf(object));
         * // => [2, 0]
         *
         * _.map([['a', '2'], ['c', '0']], _.methodOf(object));
         * // => [2, 0]
         */
        var methodOf = restParam(function(object, args) {
          return function(path) {
            return invokePath(object, path, args);
          };
        });
        
        /**
         * Adds all own enumerable function properties of a source object to the
         * destination object. If `object` is a function then methods are added to
         * its prototype as well.
         *
         * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
         * avoid conflicts caused by modifying the original.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {Function|Object} [object=lodash] The destination object.
         * @param {Object} source The object of functions to add.
         * @param {Object} [options] The options object.
         * @param {boolean} [options.chain=true] Specify whether the functions added
         *  are chainable.
         * @returns {Function|Object} Returns `object`.
         * @example
         *
         * function vowels(string) {
     *   return _.filter(string, function(v) {
     *     return /[aeiou]/i.test(v);
     *   });
     * }
         *
         * _.mixin({ 'vowels': vowels });
         * _.vowels('fred');
         * // => ['e']
         *
         * _('fred').vowels().value();
         * // => ['e']
         *
         * _.mixin({ 'vowels': vowels }, { 'chain': false });
         * _('fred').vowels();
         * // => ['e']
         */
        function mixin(object, source, options) {
          if (options == null) {
            var isObj = isObject(source),
              props = isObj ? keys(source) : undefined,
              methodNames = (props && props.length) ? baseFunctions(source, props) : undefined;
            
            if (!(methodNames ? methodNames.length : isObj)) {
              methodNames = false;
              options = source;
              source = object;
              object = this;
            }
          }
          if (!methodNames) {
            methodNames = baseFunctions(source, keys(source));
          }
          var chain = true,
            index = -1,
            isFunc = isFunction(object),
            length = methodNames.length;
          
          if (options === false) {
            chain = false;
          } else if (isObject(options) && 'chain' in options) {
            chain = options.chain;
          }
          while (++index < length) {
            var methodName = methodNames[index],
              func = source[methodName];
            
            object[methodName] = func;
            if (isFunc) {
              object.prototype[methodName] = (function(func) {
                return function() {
                  var chainAll = this.__chain__;
                  if (chain || chainAll) {
                    var result = object(this.__wrapped__),
                      actions = result.__actions__ = arrayCopy(this.__actions__);
                    
                    actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
                    result.__chain__ = chainAll;
                    return result;
                  }
                  return func.apply(object, arrayPush([this.value()], arguments));
                };
              }(func));
            }
          }
          return object;
        }
        
        /**
         * Reverts the `_` variable to its previous value and returns a reference to
         * the `lodash` function.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @returns {Function} Returns the `lodash` function.
         * @example
         *
         * var lodash = _.noConflict();
         */
        function noConflict() {
          root._ = oldDash;
          return this;
        }
        
        /**
         * A no-operation function that returns `undefined` regardless of the
         * arguments it receives.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @example
         *
         * var object = { 'user': 'fred' };
         *
         * _.noop(object) === undefined;
         * // => true
         */
        function noop() {
          // No operation performed.
        }
        
        /**
         * Creates a function that returns the property value at `path` on a
         * given object.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {Array|string} path The path of the property to get.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var objects = [
         *   { 'a': { 'b': { 'c': 2 } } },
         *   { 'a': { 'b': { 'c': 1 } } }
         * ];
         *
         * _.map(objects, _.property('a.b.c'));
         * // => [2, 1]
         *
         * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
         * // => [1, 2]
         */
        function property(path) {
          return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
        }
        
        /**
         * The opposite of `_.property`; this method creates a function that returns
         * the property value at a given path on `object`.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {Object} object The object to query.
         * @returns {Function} Returns the new function.
         * @example
         *
         * var array = [0, 1, 2],
         *     object = { 'a': array, 'b': array, 'c': array };
         *
         * _.map(['a[2]', 'c[0]'], _.propertyOf(object));
         * // => [2, 0]
         *
         * _.map([['a', '2'], ['c', '0']], _.propertyOf(object));
         * // => [2, 0]
         */
        function propertyOf(object) {
          return function(path) {
            return baseGet(object, toPath(path), path + '');
          };
        }
        
        /**
         * Creates an array of numbers (positive and/or negative) progressing from
         * `start` up to, but not including, `end`. If `end` is not specified it is
         * set to `start` with `start` then set to `0`. If `end` is less than `start`
         * a zero-length range is created unless a negative `step` is specified.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {number} [start=0] The start of the range.
         * @param {number} end The end of the range.
         * @param {number} [step=1] The value to increment or decrement by.
         * @returns {Array} Returns the new array of numbers.
         * @example
         *
         * _.range(4);
         * // => [0, 1, 2, 3]
         *
         * _.range(1, 5);
         * // => [1, 2, 3, 4]
         *
         * _.range(0, 20, 5);
         * // => [0, 5, 10, 15]
         *
         * _.range(0, -4, -1);
         * // => [0, -1, -2, -3]
         *
         * _.range(1, 4, 0);
         * // => [1, 1, 1]
         *
         * _.range(0);
         * // => []
         */
        function range(start, end, step) {
          if (step && isIterateeCall(start, end, step)) {
            end = step = undefined;
          }
          start = +start || 0;
          step = step == null ? 1 : (+step || 0);
          
          if (end == null) {
            end = start;
            start = 0;
          } else {
            end = +end || 0;
          }
          // Use `Array(length)` so engines like Chakra and V8 avoid slower modes.
          // See https://youtu.be/XAqIpGU8ZZk#t=17m25s for more details.
          var index = -1,
            length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
            result = Array(length);
          
          while (++index < length) {
            result[index] = start;
            start += step;
          }
          return result;
        }
        
        /**
         * Invokes the iteratee function `n` times, returning an array of the results
         * of each invocation. The `iteratee` is bound to `thisArg` and invoked with
         * one argument; (index).
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {number} n The number of times to invoke `iteratee`.
         * @param {Function} [iteratee=_.identity] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {Array} Returns the array of results.
         * @example
         *
         * var diceRolls = _.times(3, _.partial(_.random, 1, 6, false));
         * // => [3, 6, 4]
         *
         * _.times(3, function(n) {
     *   mage.castSpell(n);
     * });
         * // => invokes `mage.castSpell(n)` three times with `n` of `0`, `1`, and `2`
         *
         * _.times(3, function(n) {
     *   this.cast(n);
     * }, mage);
         * // => also invokes `mage.castSpell(n)` three times
         */
        function times(n, iteratee, thisArg) {
          n = nativeFloor(n);
          
          // Exit early to avoid a JSC JIT bug in Safari 8
          // where `Array(0)` is treated as `Array(1)`.
          if (n < 1 || !nativeIsFinite(n)) {
            return [];
          }
          var index = -1,
            result = Array(nativeMin(n, MAX_ARRAY_LENGTH));
          
          iteratee = bindCallback(iteratee, thisArg, 1);
          while (++index < n) {
            if (index < MAX_ARRAY_LENGTH) {
              result[index] = iteratee(index);
            } else {
              iteratee(index);
            }
          }
          return result;
        }
        
        /**
         * Generates a unique ID. If `prefix` is provided the ID is appended to it.
         *
         * @static
         * @memberOf _
         * @category Utility
         * @param {string} [prefix] The value to prefix the ID with.
         * @returns {string} Returns the unique ID.
         * @example
         *
         * _.uniqueId('contact_');
         * // => 'contact_104'
         *
         * _.uniqueId();
         * // => '105'
         */
        function uniqueId(prefix) {
          var id = ++idCounter;
          return baseToString(prefix) + id;
        }
        
        /*------------------------------------------------------------------------*/
        
        /**
         * Adds two numbers.
         *
         * @static
         * @memberOf _
         * @category Math
         * @param {number} augend The first number to add.
         * @param {number} addend The second number to add.
         * @returns {number} Returns the sum.
         * @example
         *
         * _.add(6, 4);
         * // => 10
         */
        function add(augend, addend) {
          return (+augend || 0) + (+addend || 0);
        }
        
        /**
         * Calculates `n` rounded up to `precision`.
         *
         * @static
         * @memberOf _
         * @category Math
         * @param {number} n The number to round up.
         * @param {number} [precision=0] The precision to round up to.
         * @returns {number} Returns the rounded up number.
         * @example
         *
         * _.ceil(4.006);
         * // => 5
         *
         * _.ceil(6.004, 2);
         * // => 6.01
         *
         * _.ceil(6040, -2);
         * // => 6100
         */
        var ceil = createRound('ceil');
        
        /**
         * Calculates `n` rounded down to `precision`.
         *
         * @static
         * @memberOf _
         * @category Math
         * @param {number} n The number to round down.
         * @param {number} [precision=0] The precision to round down to.
         * @returns {number} Returns the rounded down number.
         * @example
         *
         * _.floor(4.006);
         * // => 4
         *
         * _.floor(0.046, 2);
         * // => 0.04
         *
         * _.floor(4060, -2);
         * // => 4000
         */
        var floor = createRound('floor');
        
        /**
         * Gets the maximum value of `collection`. If `collection` is empty or falsey
         * `-Infinity` is returned. If an iteratee function is provided it is invoked
         * for each value in `collection` to generate the criterion by which the value
         * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
         * arguments: (value, index, collection).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Math
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [iteratee] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {*} Returns the maximum value.
         * @example
         *
         * _.max([4, 2, 8, 6]);
         * // => 8
         *
         * _.max([]);
         * // => -Infinity
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36 },
         *   { 'user': 'fred',   'age': 40 }
         * ];
         *
         * _.max(users, function(chr) {
     *   return chr.age;
     * });
         * // => { 'user': 'fred', 'age': 40 }
         *
         * // using the `_.property` callback shorthand
         * _.max(users, 'age');
         * // => { 'user': 'fred', 'age': 40 }
         */
        var max = createExtremum(gt, NEGATIVE_INFINITY);
        
        /**
         * Gets the minimum value of `collection`. If `collection` is empty or falsey
         * `Infinity` is returned. If an iteratee function is provided it is invoked
         * for each value in `collection` to generate the criterion by which the value
         * is ranked. The `iteratee` is bound to `thisArg` and invoked with three
         * arguments: (value, index, collection).
         *
         * If a property name is provided for `iteratee` the created `_.property`
         * style callback returns the property value of the given element.
         *
         * If a value is also provided for `thisArg` the created `_.matchesProperty`
         * style callback returns `true` for elements that have a matching property
         * value, else `false`.
         *
         * If an object is provided for `iteratee` the created `_.matches` style
         * callback returns `true` for elements that have the properties of the given
         * object, else `false`.
         *
         * @static
         * @memberOf _
         * @category Math
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [iteratee] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {*} Returns the minimum value.
         * @example
         *
         * _.min([4, 2, 8, 6]);
         * // => 2
         *
         * _.min([]);
         * // => Infinity
         *
         * var users = [
         *   { 'user': 'barney', 'age': 36 },
         *   { 'user': 'fred',   'age': 40 }
         * ];
         *
         * _.min(users, function(chr) {
     *   return chr.age;
     * });
         * // => { 'user': 'barney', 'age': 36 }
         *
         * // using the `_.property` callback shorthand
         * _.min(users, 'age');
         * // => { 'user': 'barney', 'age': 36 }
         */
        var min = createExtremum(lt, POSITIVE_INFINITY);
        
        /**
         * Calculates `n` rounded to `precision`.
         *
         * @static
         * @memberOf _
         * @category Math
         * @param {number} n The number to round.
         * @param {number} [precision=0] The precision to round to.
         * @returns {number} Returns the rounded number.
         * @example
         *
         * _.round(4.006);
         * // => 4
         *
         * _.round(4.006, 2);
         * // => 4.01
         *
         * _.round(4060, -2);
         * // => 4100
         */
        var round = createRound('round');
        
        /**
         * Gets the sum of the values in `collection`.
         *
         * @static
         * @memberOf _
         * @category Math
         * @param {Array|Object|string} collection The collection to iterate over.
         * @param {Function|Object|string} [iteratee] The function invoked per iteration.
         * @param {*} [thisArg] The `this` binding of `iteratee`.
         * @returns {number} Returns the sum.
         * @example
         *
         * _.sum([4, 6]);
         * // => 10
         *
         * _.sum({ 'a': 4, 'b': 6 });
         * // => 10
         *
         * var objects = [
         *   { 'n': 4 },
         *   { 'n': 6 }
         * ];
         *
         * _.sum(objects, function(object) {
     *   return object.n;
     * });
         * // => 10
         *
         * // using the `_.property` callback shorthand
         * _.sum(objects, 'n');
         * // => 10
         */
        function sum(collection, iteratee, thisArg) {
          if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
            iteratee = undefined;
          }
          iteratee = getCallback(iteratee, thisArg, 3);
          return iteratee.length == 1
            ? arraySum(isArray(collection) ? collection : toIterable(collection), iteratee)
            : baseSum(collection, iteratee);
        }
        
        /*------------------------------------------------------------------------*/
        
        // Ensure wrappers are instances of `baseLodash`.
        lodash.prototype = baseLodash.prototype;
        
        LodashWrapper.prototype = baseCreate(baseLodash.prototype);
        LodashWrapper.prototype.constructor = LodashWrapper;
        
        LazyWrapper.prototype = baseCreate(baseLodash.prototype);
        LazyWrapper.prototype.constructor = LazyWrapper;
        
        // Add functions to the `Map` cache.
        MapCache.prototype['delete'] = mapDelete;
        MapCache.prototype.get = mapGet;
        MapCache.prototype.has = mapHas;
        MapCache.prototype.set = mapSet;
        
        // Add functions to the `Set` cache.
        SetCache.prototype.push = cachePush;
        
        // Assign cache to `_.memoize`.
        memoize.Cache = MapCache;
        
        // Add functions that return wrapped values when chaining.
        lodash.after = after;
        lodash.ary = ary;
        lodash.assign = assign;
        lodash.at = at;
        lodash.before = before;
        lodash.bind = bind;
        lodash.bindAll = bindAll;
        lodash.bindKey = bindKey;
        lodash.callback = callback;
        lodash.chain = chain;
        lodash.chunk = chunk;
        lodash.compact = compact;
        lodash.constant = constant;
        lodash.countBy = countBy;
        lodash.create = create;
        lodash.curry = curry;
        lodash.curryRight = curryRight;
        lodash.debounce = debounce;
        lodash.defaults = defaults;
        lodash.defaultsDeep = defaultsDeep;
        lodash.defer = defer;
        lodash.delay = delay;
        lodash.difference = difference;
        lodash.drop = drop;
        lodash.dropRight = dropRight;
        lodash.dropRightWhile = dropRightWhile;
        lodash.dropWhile = dropWhile;
        lodash.fill = fill;
        lodash.filter = filter;
        lodash.flatten = flatten;
        lodash.flattenDeep = flattenDeep;
        lodash.flow = flow;
        lodash.flowRight = flowRight;
        lodash.forEach = forEach;
        lodash.forEachRight = forEachRight;
        lodash.forIn = forIn;
        lodash.forInRight = forInRight;
        lodash.forOwn = forOwn;
        lodash.forOwnRight = forOwnRight;
        lodash.functions = functions;
        lodash.groupBy = groupBy;
        lodash.indexBy = indexBy;
        lodash.initial = initial;
        lodash.intersection = intersection;
        lodash.invert = invert;
        lodash.invoke = invoke;
        lodash.keys = keys;
        lodash.keysIn = keysIn;
        lodash.map = map;
        lodash.mapKeys = mapKeys;
        lodash.mapValues = mapValues;
        lodash.matches = matches;
        lodash.matchesProperty = matchesProperty;
        lodash.memoize = memoize;
        lodash.merge = merge;
        lodash.method = method;
        lodash.methodOf = methodOf;
        lodash.mixin = mixin;
        lodash.modArgs = modArgs;
        lodash.negate = negate;
        lodash.omit = omit;
        lodash.once = once;
        lodash.pairs = pairs;
        lodash.partial = partial;
        lodash.partialRight = partialRight;
        lodash.partition = partition;
        lodash.pick = pick;
        lodash.pluck = pluck;
        lodash.property = property;
        lodash.propertyOf = propertyOf;
        lodash.pull = pull;
        lodash.pullAt = pullAt;
        lodash.range = range;
        lodash.rearg = rearg;
        lodash.reject = reject;
        lodash.remove = remove;
        lodash.rest = rest;
        lodash.restParam = restParam;
        lodash.set = set;
        lodash.shuffle = shuffle;
        lodash.slice = slice;
        lodash.sortBy = sortBy;
        lodash.sortByAll = sortByAll;
        lodash.sortByOrder = sortByOrder;
        lodash.spread = spread;
        lodash.take = take;
        lodash.takeRight = takeRight;
        lodash.takeRightWhile = takeRightWhile;
        lodash.takeWhile = takeWhile;
        lodash.tap = tap;
        lodash.throttle = throttle;
        lodash.thru = thru;
        lodash.times = times;
        lodash.toArray = toArray;
        lodash.toPlainObject = toPlainObject;
        lodash.transform = transform;
        lodash.union = union;
        lodash.uniq = uniq;
        lodash.unzip = unzip;
        lodash.unzipWith = unzipWith;
        lodash.values = values;
        lodash.valuesIn = valuesIn;
        lodash.where = where;
        lodash.without = without;
        lodash.wrap = wrap;
        lodash.xor = xor;
        lodash.zip = zip;
        lodash.zipObject = zipObject;
        lodash.zipWith = zipWith;
        
        // Add aliases.
        lodash.backflow = flowRight;
        lodash.collect = map;
        lodash.compose = flowRight;
        lodash.each = forEach;
        lodash.eachRight = forEachRight;
        lodash.extend = assign;
        lodash.iteratee = callback;
        lodash.methods = functions;
        lodash.object = zipObject;
        lodash.select = filter;
        lodash.tail = rest;
        lodash.unique = uniq;
        
        // Add functions to `lodash.prototype`.
        mixin(lodash, lodash);
        
        /*------------------------------------------------------------------------*/
        
        // Add functions that return unwrapped values when chaining.
        lodash.add = add;
        lodash.attempt = attempt;
        lodash.camelCase = camelCase;
        lodash.capitalize = capitalize;
        lodash.ceil = ceil;
        lodash.clone = clone;
        lodash.cloneDeep = cloneDeep;
        lodash.deburr = deburr;
        lodash.endsWith = endsWith;
        lodash.escape = escape;
        lodash.escapeRegExp = escapeRegExp;
        lodash.every = every;
        lodash.find = find;
        lodash.findIndex = findIndex;
        lodash.findKey = findKey;
        lodash.findLast = findLast;
        lodash.findLastIndex = findLastIndex;
        lodash.findLastKey = findLastKey;
        lodash.findWhere = findWhere;
        lodash.first = first;
        lodash.floor = floor;
        lodash.get = get;
        lodash.gt = gt;
        lodash.gte = gte;
        lodash.has = has;
        lodash.identity = identity;
        lodash.includes = includes;
        lodash.indexOf = indexOf;
        lodash.inRange = inRange;
        lodash.isArguments = isArguments;
        lodash.isArray = isArray;
        lodash.isBoolean = isBoolean;
        lodash.isDate = isDate;
        lodash.isElement = isElement;
        lodash.isEmpty = isEmpty;
        lodash.isEqual = isEqual;
        lodash.isError = isError;
        lodash.isFinite = isFinite;
        lodash.isFunction = isFunction;
        lodash.isMatch = isMatch;
        lodash.isNaN = isNaN;
        lodash.isNative = isNative;
        lodash.isNull = isNull;
        lodash.isNumber = isNumber;
        lodash.isObject = isObject;
        lodash.isPlainObject = isPlainObject;
        lodash.isRegExp = isRegExp;
        lodash.isString = isString;
        lodash.isTypedArray = isTypedArray;
        lodash.isUndefined = isUndefined;
        lodash.kebabCase = kebabCase;
        lodash.last = last;
        lodash.lastIndexOf = lastIndexOf;
        lodash.lt = lt;
        lodash.lte = lte;
        lodash.max = max;
        lodash.min = min;
        lodash.noConflict = noConflict;
        lodash.noop = noop;
        lodash.now = now;
        lodash.pad = pad;
        lodash.padLeft = padLeft;
        lodash.padRight = padRight;
        lodash.parseInt = parseInt;
        lodash.random = random;
        lodash.reduce = reduce;
        lodash.reduceRight = reduceRight;
        lodash.repeat = repeat;
        lodash.result = result;
        lodash.round = round;
        lodash.runInContext = runInContext;
        lodash.size = size;
        lodash.snakeCase = snakeCase;
        lodash.some = some;
        lodash.sortedIndex = sortedIndex;
        lodash.sortedLastIndex = sortedLastIndex;
        lodash.startCase = startCase;
        lodash.startsWith = startsWith;
        lodash.sum = sum;
        lodash.template = template;
        lodash.trim = trim;
        lodash.trimLeft = trimLeft;
        lodash.trimRight = trimRight;
        lodash.trunc = trunc;
        lodash.unescape = unescape;
        lodash.uniqueId = uniqueId;
        lodash.words = words;
        
        // Add aliases.
        lodash.all = every;
        lodash.any = some;
        lodash.contains = includes;
        lodash.eq = isEqual;
        lodash.detect = find;
        lodash.foldl = reduce;
        lodash.foldr = reduceRight;
        lodash.head = first;
        lodash.include = includes;
        lodash.inject = reduce;
        
        mixin(lodash, (function() {
          var source = {};
          baseForOwn(lodash, function(func, methodName) {
            if (!lodash.prototype[methodName]) {
              source[methodName] = func;
            }
          });
          return source;
        }()), false);
        
        /*------------------------------------------------------------------------*/
        
        // Add functions capable of returning wrapped and unwrapped values when chaining.
        lodash.sample = sample;
        
        lodash.prototype.sample = function(n) {
          if (!this.__chain__ && n == null) {
            return sample(this.value());
          }
          return this.thru(function(value) {
            return sample(value, n);
          });
        };
        
        /*------------------------------------------------------------------------*/
        
        /**
         * The semantic version number.
         *
         * @static
         * @memberOf _
         * @type string
         */
        lodash.VERSION = VERSION;
        
        // Assign default placeholders.
        arrayEach(['bind', 'bindKey', 'curry', 'curryRight', 'partial', 'partialRight'], function(methodName) {
          lodash[methodName].placeholder = lodash;
        });
        
        // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
        arrayEach(['drop', 'take'], function(methodName, index) {
          LazyWrapper.prototype[methodName] = function(n) {
            var filtered = this.__filtered__;
            if (filtered && !index) {
              return new LazyWrapper(this);
            }
            n = n == null ? 1 : nativeMax(nativeFloor(n) || 0, 0);
            
            var result = this.clone();
            if (filtered) {
              result.__takeCount__ = nativeMin(result.__takeCount__, n);
            } else {
              result.__views__.push({ 'size': n, 'type': methodName + (result.__dir__ < 0 ? 'Right' : '') });
            }
            return result;
          };
          
          LazyWrapper.prototype[methodName + 'Right'] = function(n) {
            return this.reverse()[methodName](n).reverse();
          };
        });
        
        // Add `LazyWrapper` methods that accept an `iteratee` value.
        arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
          var type = index + 1,
            isFilter = type != LAZY_MAP_FLAG;
          
          LazyWrapper.prototype[methodName] = function(iteratee, thisArg) {
            var result = this.clone();
            result.__iteratees__.push({ 'iteratee': getCallback(iteratee, thisArg, 1), 'type': type });
            result.__filtered__ = result.__filtered__ || isFilter;
            return result;
          };
        });
        
        // Add `LazyWrapper` methods for `_.first` and `_.last`.
        arrayEach(['first', 'last'], function(methodName, index) {
          var takeName = 'take' + (index ? 'Right' : '');
          
          LazyWrapper.prototype[methodName] = function() {
            return this[takeName](1).value()[0];
          };
        });
        
        // Add `LazyWrapper` methods for `_.initial` and `_.rest`.
        arrayEach(['initial', 'rest'], function(methodName, index) {
          var dropName = 'drop' + (index ? '' : 'Right');
          
          LazyWrapper.prototype[methodName] = function() {
            return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
          };
        });
        
        // Add `LazyWrapper` methods for `_.pluck` and `_.where`.
        arrayEach(['pluck', 'where'], function(methodName, index) {
          var operationName = index ? 'filter' : 'map',
            createCallback = index ? baseMatches : property;
          
          LazyWrapper.prototype[methodName] = function(value) {
            return this[operationName](createCallback(value));
          };
        });
        
        LazyWrapper.prototype.compact = function() {
          return this.filter(identity);
        };
        
        LazyWrapper.prototype.reject = function(predicate, thisArg) {
          predicate = getCallback(predicate, thisArg, 1);
          return this.filter(function(value) {
            return !predicate(value);
          });
        };
        
        LazyWrapper.prototype.slice = function(start, end) {
          start = start == null ? 0 : (+start || 0);
          
          var result = this;
          if (result.__filtered__ && (start > 0 || end < 0)) {
            return new LazyWrapper(result);
          }
          if (start < 0) {
            result = result.takeRight(-start);
          } else if (start) {
            result = result.drop(start);
          }
          if (end !== undefined) {
            end = (+end || 0);
            result = end < 0 ? result.dropRight(-end) : result.take(end - start);
          }
          return result;
        };
        
        LazyWrapper.prototype.takeRightWhile = function(predicate, thisArg) {
          return this.reverse().takeWhile(predicate, thisArg).reverse();
        };
        
        LazyWrapper.prototype.toArray = function() {
          return this.take(POSITIVE_INFINITY);
        };
        
        // Add `LazyWrapper` methods to `lodash.prototype`.
        baseForOwn(LazyWrapper.prototype, function(func, methodName) {
          var checkIteratee = /^(?:filter|map|reject)|While$/.test(methodName),
            retUnwrapped = /^(?:first|last)$/.test(methodName),
            lodashFunc = lodash[retUnwrapped ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName];
          
          if (!lodashFunc) {
            return;
          }
          lodash.prototype[methodName] = function() {
            var args = retUnwrapped ? [1] : arguments,
              chainAll = this.__chain__,
              value = this.__wrapped__,
              isHybrid = !!this.__actions__.length,
              isLazy = value instanceof LazyWrapper,
              iteratee = args[0],
              useLazy = isLazy || isArray(value);
            
            if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
              // Avoid lazy use if the iteratee has a "length" value other than `1`.
              isLazy = useLazy = false;
            }
            var interceptor = function(value) {
              return (retUnwrapped && chainAll)
                ? lodashFunc(value, 1)[0]
                : lodashFunc.apply(undefined, arrayPush([value], args));
            };
            
            var action = { 'func': thru, 'args': [interceptor], 'thisArg': undefined },
              onlyLazy = isLazy && !isHybrid;
            
            if (retUnwrapped && !chainAll) {
              if (onlyLazy) {
                value = value.clone();
                value.__actions__.push(action);
                return func.call(value);
              }
              return lodashFunc.call(undefined, this.value())[0];
            }
            if (!retUnwrapped && useLazy) {
              value = onlyLazy ? value : new LazyWrapper(this);
              var result = func.apply(value, args);
              result.__actions__.push(action);
              return new LodashWrapper(result, chainAll);
            }
            return this.thru(interceptor);
          };
        });
        
        // Add `Array` and `String` methods to `lodash.prototype`.
        arrayEach(['join', 'pop', 'push', 'replace', 'shift', 'sort', 'splice', 'split', 'unshift'], function(methodName) {
          var func = (/^(?:replace|split)$/.test(methodName) ? stringProto : arrayProto)[methodName],
            chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
            retUnwrapped = /^(?:join|pop|replace|shift)$/.test(methodName);
          
          lodash.prototype[methodName] = function() {
            var args = arguments;
            if (retUnwrapped && !this.__chain__) {
              return func.apply(this.value(), args);
            }
            return this[chainName](function(value) {
              return func.apply(value, args);
            });
          };
        });
        
        // Map minified function names to their real names.
        baseForOwn(LazyWrapper.prototype, function(func, methodName) {
          var lodashFunc = lodash[methodName];
          if (lodashFunc) {
            var key = lodashFunc.name,
              names = realNames[key] || (realNames[key] = []);
            
            names.push({ 'name': methodName, 'func': lodashFunc });
          }
        });
        
        realNames[createHybridWrapper(undefined, BIND_KEY_FLAG).name] = [{ 'name': 'wrapper', 'func': undefined }];
        
        // Add functions to the lazy wrapper.
        LazyWrapper.prototype.clone = lazyClone;
        LazyWrapper.prototype.reverse = lazyReverse;
        LazyWrapper.prototype.value = lazyValue;
        
        // Add chaining functions to the `lodash` wrapper.
        lodash.prototype.chain = wrapperChain;
        lodash.prototype.commit = wrapperCommit;
        lodash.prototype.concat = wrapperConcat;
        lodash.prototype.plant = wrapperPlant;
        lodash.prototype.reverse = wrapperReverse;
        lodash.prototype.toString = wrapperToString;
        lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;
        
        // Add function aliases to the `lodash` wrapper.
        lodash.prototype.collect = lodash.prototype.map;
        lodash.prototype.head = lodash.prototype.first;
        lodash.prototype.select = lodash.prototype.filter;
        lodash.prototype.tail = lodash.prototype.rest;
        
        return lodash;
      }
      
      /*--------------------------------------------------------------------------*/
      
      // Export lodash.
      var _ = runInContext();
      
      // Some AMD build optimizers like r.js check for condition patterns like the following:
      if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        // Expose lodash to the global object when an AMD loader is present to avoid
        // errors in cases where lodash is loaded by a script tag and not intended
        // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
        // more details.
        root._ = _;
        
        // Define as an anonymous module so, through path mapping, it can be
        // referenced as the "underscore" module.
        define(function() {
          return _;
        });
      }
      // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
      else if (freeExports && freeModule) {
        // Export for Node.js or RingoJS.
        if (moduleExports) {
          (freeModule.exports = _)._ = _;
        }
        // Export for Rhino with CommonJS support.
        else {
          freeExports._ = _;
        }
      }
      else {
        // Export for a browser or Rhino.
        root._ = _;
      }
    }.call(this));
    
  }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  
},{}],19:[function(require,module,exports){
//! moment.js
//! version : 2.18.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
  
  ;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
      typeof define === 'function' && define.amd ? define(factory) :
        global.moment = factory()
  }(this, (function () { 'use strict';
    
    var hookCallback;
    
    function hooks () {
      return hookCallback.apply(null, arguments);
    }

// This is done to register the method called with moment()
// without creating circular dependencies.
    function setHookCallback (callback) {
      hookCallback = callback;
    }
    
    function isArray(input) {
      return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
    }
    
    function isObject(input) {
      // IE8 will treat undefined and null as object if it wasn't for
      // input != null
      return input != null && Object.prototype.toString.call(input) === '[object Object]';
    }
    
    function isObjectEmpty(obj) {
      var k;
      for (k in obj) {
        // even if its not own property I'd still call it non-empty
        return false;
      }
      return true;
    }
    
    function isUndefined(input) {
      return input === void 0;
    }
    
    function isNumber(input) {
      return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
    }
    
    function isDate(input) {
      return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
    }
    
    function map(arr, fn) {
      var res = [], i;
      for (i = 0; i < arr.length; ++i) {
        res.push(fn(arr[i], i));
      }
      return res;
    }
    
    function hasOwnProp(a, b) {
      return Object.prototype.hasOwnProperty.call(a, b);
    }
    
    function extend(a, b) {
      for (var i in b) {
        if (hasOwnProp(b, i)) {
          a[i] = b[i];
        }
      }
      
      if (hasOwnProp(b, 'toString')) {
        a.toString = b.toString;
      }
      
      if (hasOwnProp(b, 'valueOf')) {
        a.valueOf = b.valueOf;
      }
      
      return a;
    }
    
    function createUTC (input, format, locale, strict) {
      return createLocalOrUTC(input, format, locale, strict, true).utc();
    }
    
    function defaultParsingFlags() {
      // We need to deep clone this object.
      return {
        empty           : false,
        unusedTokens    : [],
        unusedInput     : [],
        overflow        : -2,
        charsLeftOver   : 0,
        nullInput       : false,
        invalidMonth    : null,
        invalidFormat   : false,
        userInvalidated : false,
        iso             : false,
        parsedDateParts : [],
        meridiem        : null,
        rfc2822         : false,
        weekdayMismatch : false
      };
    }
    
    function getParsingFlags(m) {
      if (m._pf == null) {
        m._pf = defaultParsingFlags();
      }
      return m._pf;
    }
    
    var some;
    if (Array.prototype.some) {
      some = Array.prototype.some;
    } else {
      some = function (fun) {
        var t = Object(this);
        var len = t.length >>> 0;
        
        for (var i = 0; i < len; i++) {
          if (i in t && fun.call(this, t[i], i, t)) {
            return true;
          }
        }
        
        return false;
      };
    }
    
    var some$1 = some;
    
    function isValid(m) {
      if (m._isValid == null) {
        var flags = getParsingFlags(m);
        var parsedParts = some$1.call(flags.parsedDateParts, function (i) {
          return i != null;
        });
        var isNowValid = !isNaN(m._d.getTime()) &&
          flags.overflow < 0 &&
          !flags.empty &&
          !flags.invalidMonth &&
          !flags.invalidWeekday &&
          !flags.nullInput &&
          !flags.invalidFormat &&
          !flags.userInvalidated &&
          (!flags.meridiem || (flags.meridiem && parsedParts));
        
        if (m._strict) {
          isNowValid = isNowValid &&
            flags.charsLeftOver === 0 &&
            flags.unusedTokens.length === 0 &&
            flags.bigHour === undefined;
        }
        
        if (Object.isFrozen == null || !Object.isFrozen(m)) {
          m._isValid = isNowValid;
        }
        else {
          return isNowValid;
        }
      }
      return m._isValid;
    }
    
    function createInvalid (flags) {
      var m = createUTC(NaN);
      if (flags != null) {
        extend(getParsingFlags(m), flags);
      }
      else {
        getParsingFlags(m).userInvalidated = true;
      }
      
      return m;
    }

// Plugins that add properties should also add the key here (null value),
// so we can properly clone ourselves.
    var momentProperties = hooks.momentProperties = [];
    
    function copyConfig(to, from) {
      var i, prop, val;
      
      if (!isUndefined(from._isAMomentObject)) {
        to._isAMomentObject = from._isAMomentObject;
      }
      if (!isUndefined(from._i)) {
        to._i = from._i;
      }
      if (!isUndefined(from._f)) {
        to._f = from._f;
      }
      if (!isUndefined(from._l)) {
        to._l = from._l;
      }
      if (!isUndefined(from._strict)) {
        to._strict = from._strict;
      }
      if (!isUndefined(from._tzm)) {
        to._tzm = from._tzm;
      }
      if (!isUndefined(from._isUTC)) {
        to._isUTC = from._isUTC;
      }
      if (!isUndefined(from._offset)) {
        to._offset = from._offset;
      }
      if (!isUndefined(from._pf)) {
        to._pf = getParsingFlags(from);
      }
      if (!isUndefined(from._locale)) {
        to._locale = from._locale;
      }
      
      if (momentProperties.length > 0) {
        for (i = 0; i < momentProperties.length; i++) {
          prop = momentProperties[i];
          val = from[prop];
          if (!isUndefined(val)) {
            to[prop] = val;
          }
        }
      }
      
      return to;
    }
    
    var updateInProgress = false;

// Moment prototype object
    function Moment(config) {
      copyConfig(this, config);
      this._d = new Date(config._d != null ? config._d.getTime() : NaN);
      if (!this.isValid()) {
        this._d = new Date(NaN);
      }
      // Prevent infinite loop in case updateOffset creates new moment
      // objects.
      if (updateInProgress === false) {
        updateInProgress = true;
        hooks.updateOffset(this);
        updateInProgress = false;
      }
    }
    
    function isMoment (obj) {
      return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
    }
    
    function absFloor (number) {
      if (number < 0) {
        // -0 -> 0
        return Math.ceil(number) || 0;
      } else {
        return Math.floor(number);
      }
    }
    
    function toInt(argumentForCoercion) {
      var coercedNumber = +argumentForCoercion,
        value = 0;
      
      if (coercedNumber !== 0 && isFinite(coercedNumber)) {
        value = absFloor(coercedNumber);
      }
      
      return value;
    }

// compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
      var len = Math.min(array1.length, array2.length),
        lengthDiff = Math.abs(array1.length - array2.length),
        diffs = 0,
        i;
      for (i = 0; i < len; i++) {
        if ((dontConvert && array1[i] !== array2[i]) ||
          (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
          diffs++;
        }
      }
      return diffs + lengthDiff;
    }
    
    function warn(msg) {
      if (hooks.suppressDeprecationWarnings === false &&
        (typeof console !==  'undefined') && console.warn) {
        console.warn('Deprecation warning: ' + msg);
      }
    }
    
    function deprecate(msg, fn) {
      var firstTime = true;
      
      return extend(function () {
        if (hooks.deprecationHandler != null) {
          hooks.deprecationHandler(null, msg);
        }
        if (firstTime) {
          var args = [];
          var arg;
          for (var i = 0; i < arguments.length; i++) {
            arg = '';
            if (typeof arguments[i] === 'object') {
              arg += '\n[' + i + '] ';
              for (var key in arguments[0]) {
                arg += key + ': ' + arguments[0][key] + ', ';
              }
              arg = arg.slice(0, -2); // Remove trailing comma and space
            } else {
              arg = arguments[i];
            }
            args.push(arg);
          }
          warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
          firstTime = false;
        }
        return fn.apply(this, arguments);
      }, fn);
    }
    
    var deprecations = {};
    
    function deprecateSimple(name, msg) {
      if (hooks.deprecationHandler != null) {
        hooks.deprecationHandler(name, msg);
      }
      if (!deprecations[name]) {
        warn(msg);
        deprecations[name] = true;
      }
    }
    
    hooks.suppressDeprecationWarnings = false;
    hooks.deprecationHandler = null;
    
    function isFunction(input) {
      return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
    }
    
    function set (config) {
      var prop, i;
      for (i in config) {
        prop = config[i];
        if (isFunction(prop)) {
          this[i] = prop;
        } else {
          this['_' + i] = prop;
        }
      }
      this._config = config;
      // Lenient ordinal parsing accepts just a number in addition to
      // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
      // TODO: Remove "ordinalParse" fallback in next major release.
      this._dayOfMonthOrdinalParseLenient = new RegExp(
        (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
        '|' + (/\d{1,2}/).source);
    }
    
    function mergeConfigs(parentConfig, childConfig) {
      var res = extend({}, parentConfig), prop;
      for (prop in childConfig) {
        if (hasOwnProp(childConfig, prop)) {
          if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
            res[prop] = {};
            extend(res[prop], parentConfig[prop]);
            extend(res[prop], childConfig[prop]);
          } else if (childConfig[prop] != null) {
            res[prop] = childConfig[prop];
          } else {
            delete res[prop];
          }
        }
      }
      for (prop in parentConfig) {
        if (hasOwnProp(parentConfig, prop) &&
          !hasOwnProp(childConfig, prop) &&
          isObject(parentConfig[prop])) {
          // make sure changes to properties don't modify parent config
          res[prop] = extend({}, res[prop]);
        }
      }
      return res;
    }
    
    function Locale(config) {
      if (config != null) {
        this.set(config);
      }
    }
    
    var keys;
    
    if (Object.keys) {
      keys = Object.keys;
    } else {
      keys = function (obj) {
        var i, res = [];
        for (i in obj) {
          if (hasOwnProp(obj, i)) {
            res.push(i);
          }
        }
        return res;
      };
    }
    
    var keys$1 = keys;
    
    var defaultCalendar = {
      sameDay : '[Today at] LT',
      nextDay : '[Tomorrow at] LT',
      nextWeek : 'dddd [at] LT',
      lastDay : '[Yesterday at] LT',
      lastWeek : '[Last] dddd [at] LT',
      sameElse : 'L'
    };
    
    function calendar (key, mom, now) {
      var output = this._calendar[key] || this._calendar['sameElse'];
      return isFunction(output) ? output.call(mom, now) : output;
    }
    
    var defaultLongDateFormat = {
      LTS  : 'h:mm:ss A',
      LT   : 'h:mm A',
      L    : 'MM/DD/YYYY',
      LL   : 'MMMM D, YYYY',
      LLL  : 'MMMM D, YYYY h:mm A',
      LLLL : 'dddd, MMMM D, YYYY h:mm A'
    };
    
    function longDateFormat (key) {
      var format = this._longDateFormat[key],
        formatUpper = this._longDateFormat[key.toUpperCase()];
      
      if (format || !formatUpper) {
        return format;
      }
      
      this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
        return val.slice(1);
      });
      
      return this._longDateFormat[key];
    }
    
    var defaultInvalidDate = 'Invalid date';
    
    function invalidDate () {
      return this._invalidDate;
    }
    
    var defaultOrdinal = '%d';
    var defaultDayOfMonthOrdinalParse = /\d{1,2}/;
    
    function ordinal (number) {
      return this._ordinal.replace('%d', number);
    }
    
    var defaultRelativeTime = {
      future : 'in %s',
      past   : '%s ago',
      s  : 'a few seconds',
      ss : '%d seconds',
      m  : 'a minute',
      mm : '%d minutes',
      h  : 'an hour',
      hh : '%d hours',
      d  : 'a day',
      dd : '%d days',
      M  : 'a month',
      MM : '%d months',
      y  : 'a year',
      yy : '%d years'
    };
    
    function relativeTime (number, withoutSuffix, string, isFuture) {
      var output = this._relativeTime[string];
      return (isFunction(output)) ?
        output(number, withoutSuffix, string, isFuture) :
        output.replace(/%d/i, number);
    }
    
    function pastFuture (diff, output) {
      var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
      return isFunction(format) ? format(output) : format.replace(/%s/i, output);
    }
    
    var aliases = {};
    
    function addUnitAlias (unit, shorthand) {
      var lowerCase = unit.toLowerCase();
      aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
    }
    
    function normalizeUnits(units) {
      return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
    }
    
    function normalizeObjectUnits(inputObject) {
      var normalizedInput = {},
        normalizedProp,
        prop;
      
      for (prop in inputObject) {
        if (hasOwnProp(inputObject, prop)) {
          normalizedProp = normalizeUnits(prop);
          if (normalizedProp) {
            normalizedInput[normalizedProp] = inputObject[prop];
          }
        }
      }
      
      return normalizedInput;
    }
    
    var priorities = {};
    
    function addUnitPriority(unit, priority) {
      priorities[unit] = priority;
    }
    
    function getPrioritizedUnits(unitsObj) {
      var units = [];
      for (var u in unitsObj) {
        units.push({unit: u, priority: priorities[u]});
      }
      units.sort(function (a, b) {
        return a.priority - b.priority;
      });
      return units;
    }
    
    function makeGetSet (unit, keepTime) {
      return function (value) {
        if (value != null) {
          set$1(this, unit, value);
          hooks.updateOffset(this, keepTime);
          return this;
        } else {
          return get(this, unit);
        }
      };
    }
    
    function get (mom, unit) {
      return mom.isValid() ?
        mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
    }
    
    function set$1 (mom, unit, value) {
      if (mom.isValid()) {
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
      }
    }

// MOMENTS
    
    function stringGet (units) {
      units = normalizeUnits(units);
      if (isFunction(this[units])) {
        return this[units]();
      }
      return this;
    }
    
    
    function stringSet (units, value) {
      if (typeof units === 'object') {
        units = normalizeObjectUnits(units);
        var prioritized = getPrioritizedUnits(units);
        for (var i = 0; i < prioritized.length; i++) {
          this[prioritized[i].unit](units[prioritized[i].unit]);
        }
      } else {
        units = normalizeUnits(units);
        if (isFunction(this[units])) {
          return this[units](value);
        }
      }
      return this;
    }
    
    function zeroFill(number, targetLength, forceSign) {
      var absNumber = '' + Math.abs(number),
        zerosToFill = targetLength - absNumber.length,
        sign = number >= 0;
      return (sign ? (forceSign ? '+' : '') : '-') +
        Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
    }
    
    var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;
    
    var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;
    
    var formatFunctions = {};
    
    var formatTokenFunctions = {};

// token:    'M'
// padded:   ['MM', 2]
// ordinal:  'Mo'
// callback: function () { this.month() + 1 }
    function addFormatToken (token, padded, ordinal, callback) {
      var func = callback;
      if (typeof callback === 'string') {
        func = function () {
          return this[callback]();
        };
      }
      if (token) {
        formatTokenFunctions[token] = func;
      }
      if (padded) {
        formatTokenFunctions[padded[0]] = function () {
          return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
        };
      }
      if (ordinal) {
        formatTokenFunctions[ordinal] = function () {
          return this.localeData().ordinal(func.apply(this, arguments), token);
        };
      }
    }
    
    function removeFormattingTokens(input) {
      if (input.match(/\[[\s\S]/)) {
        return input.replace(/^\[|\]$/g, '');
      }
      return input.replace(/\\/g, '');
    }
    
    function makeFormatFunction(format) {
      var array = format.match(formattingTokens), i, length;
      
      for (i = 0, length = array.length; i < length; i++) {
        if (formatTokenFunctions[array[i]]) {
          array[i] = formatTokenFunctions[array[i]];
        } else {
          array[i] = removeFormattingTokens(array[i]);
        }
      }
      
      return function (mom) {
        var output = '', i;
        for (i = 0; i < length; i++) {
          output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
        }
        return output;
      };
    }

// format date using native date object
    function formatMoment(m, format) {
      if (!m.isValid()) {
        return m.localeData().invalidDate();
      }
      
      format = expandFormat(format, m.localeData());
      formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);
      
      return formatFunctions[format](m);
    }
    
    function expandFormat(format, locale) {
      var i = 5;
      
      function replaceLongDateFormatTokens(input) {
        return locale.longDateFormat(input) || input;
      }
      
      localFormattingTokens.lastIndex = 0;
      while (i >= 0 && localFormattingTokens.test(format)) {
        format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
        localFormattingTokens.lastIndex = 0;
        i -= 1;
      }
      
      return format;
    }
    
    var match1         = /\d/;            //       0 - 9
    var match2         = /\d\d/;          //      00 - 99
    var match3         = /\d{3}/;         //     000 - 999
    var match4         = /\d{4}/;         //    0000 - 9999
    var match6         = /[+-]?\d{6}/;    // -999999 - 999999
    var match1to2      = /\d\d?/;         //       0 - 99
    var match3to4      = /\d\d\d\d?/;     //     999 - 9999
    var match5to6      = /\d\d\d\d\d\d?/; //   99999 - 999999
    var match1to3      = /\d{1,3}/;       //       0 - 999
    var match1to4      = /\d{1,4}/;       //       0 - 9999
    var match1to6      = /[+-]?\d{1,6}/;  // -999999 - 999999
    
    var matchUnsigned  = /\d+/;           //       0 - inf
    var matchSigned    = /[+-]?\d+/;      //    -inf - inf
    
    var matchOffset    = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
    var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z
    
    var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

// any word (or two) characters or numbers including two/three word month in arabic.
// includes scottish gaelic two word and hyphenated months
    var matchWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
    
    
    var regexes = {};
    
    function addRegexToken (token, regex, strictRegex) {
      regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
        return (isStrict && strictRegex) ? strictRegex : regex;
      };
    }
    
    function getParseRegexForToken (token, config) {
      if (!hasOwnProp(regexes, token)) {
        return new RegExp(unescapeFormat(token));
      }
      
      return regexes[token](config._strict, config._locale);
    }

// Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function unescapeFormat(s) {
      return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
        return p1 || p2 || p3 || p4;
      }));
    }
    
    function regexEscape(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    
    var tokens = {};
    
    function addParseToken (token, callback) {
      var i, func = callback;
      if (typeof token === 'string') {
        token = [token];
      }
      if (isNumber(callback)) {
        func = function (input, array) {
          array[callback] = toInt(input);
        };
      }
      for (i = 0; i < token.length; i++) {
        tokens[token[i]] = func;
      }
    }
    
    function addWeekParseToken (token, callback) {
      addParseToken(token, function (input, array, config, token) {
        config._w = config._w || {};
        callback(input, config._w, config, token);
      });
    }
    
    function addTimeToArrayFromToken(token, input, config) {
      if (input != null && hasOwnProp(tokens, token)) {
        tokens[token](input, config._a, config, token);
      }
    }
    
    var YEAR = 0;
    var MONTH = 1;
    var DATE = 2;
    var HOUR = 3;
    var MINUTE = 4;
    var SECOND = 5;
    var MILLISECOND = 6;
    var WEEK = 7;
    var WEEKDAY = 8;
    
    var indexOf;
    
    if (Array.prototype.indexOf) {
      indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function (o) {
        // I know
        var i;
        for (i = 0; i < this.length; ++i) {
          if (this[i] === o) {
            return i;
          }
        }
        return -1;
      };
    }
    
    var indexOf$1 = indexOf;
    
    function daysInMonth(year, month) {
      return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

// FORMATTING
    
    addFormatToken('M', ['MM', 2], 'Mo', function () {
      return this.month() + 1;
    });
    
    addFormatToken('MMM', 0, 0, function (format) {
      return this.localeData().monthsShort(this, format);
    });
    
    addFormatToken('MMMM', 0, 0, function (format) {
      return this.localeData().months(this, format);
    });

// ALIASES
    
    addUnitAlias('month', 'M');

// PRIORITY
    
    addUnitPriority('month', 8);

// PARSING
    
    addRegexToken('M',    match1to2);
    addRegexToken('MM',   match1to2, match2);
    addRegexToken('MMM',  function (isStrict, locale) {
      return locale.monthsShortRegex(isStrict);
    });
    addRegexToken('MMMM', function (isStrict, locale) {
      return locale.monthsRegex(isStrict);
    });
    
    addParseToken(['M', 'MM'], function (input, array) {
      array[MONTH] = toInt(input) - 1;
    });
    
    addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
      var month = config._locale.monthsParse(input, token, config._strict);
      // if we didn't find a month name, mark the date as invalid.
      if (month != null) {
        array[MONTH] = month;
      } else {
        getParsingFlags(config).invalidMonth = input;
      }
    });

// LOCALES
    
    var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
    var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
    function localeMonths (m, format) {
      if (!m) {
        return isArray(this._months) ? this._months :
          this._months['standalone'];
      }
      return isArray(this._months) ? this._months[m.month()] :
        this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
    }
    
    var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
    function localeMonthsShort (m, format) {
      if (!m) {
        return isArray(this._monthsShort) ? this._monthsShort :
          this._monthsShort['standalone'];
      }
      return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
        this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
    }
    
    function handleStrictParse(monthName, format, strict) {
      var i, ii, mom, llc = monthName.toLocaleLowerCase();
      if (!this._monthsParse) {
        // this is not used
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
        for (i = 0; i < 12; ++i) {
          mom = createUTC([2000, i]);
          this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
          this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
        }
      }
      
      if (strict) {
        if (format === 'MMM') {
          ii = indexOf$1.call(this._shortMonthsParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf$1.call(this._longMonthsParse, llc);
          return ii !== -1 ? ii : null;
        }
      } else {
        if (format === 'MMM') {
          ii = indexOf$1.call(this._shortMonthsParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf$1.call(this._longMonthsParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf$1.call(this._longMonthsParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf$1.call(this._shortMonthsParse, llc);
          return ii !== -1 ? ii : null;
        }
      }
    }
    
    function localeMonthsParse (monthName, format, strict) {
      var i, mom, regex;
      
      if (this._monthsParseExact) {
        return handleStrictParse.call(this, monthName, format, strict);
      }
      
      if (!this._monthsParse) {
        this._monthsParse = [];
        this._longMonthsParse = [];
        this._shortMonthsParse = [];
      }
      
      // TODO: add sorting
      // Sorting makes sure if one month (or abbr) is a prefix of another
      // see sorting in computeMonthsParse
      for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, i]);
        if (strict && !this._longMonthsParse[i]) {
          this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
          this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
        }
        if (!strict && !this._monthsParse[i]) {
          regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
          this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
          return i;
        } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
          return i;
        } else if (!strict && this._monthsParse[i].test(monthName)) {
          return i;
        }
      }
    }

// MOMENTS
    
    function setMonth (mom, value) {
      var dayOfMonth;
      
      if (!mom.isValid()) {
        // No op
        return mom;
      }
      
      if (typeof value === 'string') {
        if (/^\d+$/.test(value)) {
          value = toInt(value);
        } else {
          value = mom.localeData().monthsParse(value);
          // TODO: Another silent failure?
          if (!isNumber(value)) {
            return mom;
          }
        }
      }
      
      dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
      mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
      return mom;
    }
    
    function getSetMonth (value) {
      if (value != null) {
        setMonth(this, value);
        hooks.updateOffset(this, true);
        return this;
      } else {
        return get(this, 'Month');
      }
    }
    
    function getDaysInMonth () {
      return daysInMonth(this.year(), this.month());
    }
    
    var defaultMonthsShortRegex = matchWord;
    function monthsShortRegex (isStrict) {
      if (this._monthsParseExact) {
        if (!hasOwnProp(this, '_monthsRegex')) {
          computeMonthsParse.call(this);
        }
        if (isStrict) {
          return this._monthsShortStrictRegex;
        } else {
          return this._monthsShortRegex;
        }
      } else {
        if (!hasOwnProp(this, '_monthsShortRegex')) {
          this._monthsShortRegex = defaultMonthsShortRegex;
        }
        return this._monthsShortStrictRegex && isStrict ?
          this._monthsShortStrictRegex : this._monthsShortRegex;
      }
    }
    
    var defaultMonthsRegex = matchWord;
    function monthsRegex (isStrict) {
      if (this._monthsParseExact) {
        if (!hasOwnProp(this, '_monthsRegex')) {
          computeMonthsParse.call(this);
        }
        if (isStrict) {
          return this._monthsStrictRegex;
        } else {
          return this._monthsRegex;
        }
      } else {
        if (!hasOwnProp(this, '_monthsRegex')) {
          this._monthsRegex = defaultMonthsRegex;
        }
        return this._monthsStrictRegex && isStrict ?
          this._monthsStrictRegex : this._monthsRegex;
      }
    }
    
    function computeMonthsParse () {
      function cmpLenRev(a, b) {
        return b.length - a.length;
      }
      
      var shortPieces = [], longPieces = [], mixedPieces = [],
        i, mom;
      for (i = 0; i < 12; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, i]);
        shortPieces.push(this.monthsShort(mom, ''));
        longPieces.push(this.months(mom, ''));
        mixedPieces.push(this.months(mom, ''));
        mixedPieces.push(this.monthsShort(mom, ''));
      }
      // Sorting makes sure if one month (or abbr) is a prefix of another it
      // will match the longer piece.
      shortPieces.sort(cmpLenRev);
      longPieces.sort(cmpLenRev);
      mixedPieces.sort(cmpLenRev);
      for (i = 0; i < 12; i++) {
        shortPieces[i] = regexEscape(shortPieces[i]);
        longPieces[i] = regexEscape(longPieces[i]);
      }
      for (i = 0; i < 24; i++) {
        mixedPieces[i] = regexEscape(mixedPieces[i]);
      }
      
      this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
      this._monthsShortRegex = this._monthsRegex;
      this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
      this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
    }

// FORMATTING
    
    addFormatToken('Y', 0, 0, function () {
      var y = this.year();
      return y <= 9999 ? '' + y : '+' + y;
    });
    
    addFormatToken(0, ['YY', 2], 0, function () {
      return this.year() % 100;
    });
    
    addFormatToken(0, ['YYYY',   4],       0, 'year');
    addFormatToken(0, ['YYYYY',  5],       0, 'year');
    addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

// ALIASES
    
    addUnitAlias('year', 'y');

// PRIORITIES
    
    addUnitPriority('year', 1);

// PARSING
    
    addRegexToken('Y',      matchSigned);
    addRegexToken('YY',     match1to2, match2);
    addRegexToken('YYYY',   match1to4, match4);
    addRegexToken('YYYYY',  match1to6, match6);
    addRegexToken('YYYYYY', match1to6, match6);
    
    addParseToken(['YYYYY', 'YYYYYY'], YEAR);
    addParseToken('YYYY', function (input, array) {
      array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
    });
    addParseToken('YY', function (input, array) {
      array[YEAR] = hooks.parseTwoDigitYear(input);
    });
    addParseToken('Y', function (input, array) {
      array[YEAR] = parseInt(input, 10);
    });

// HELPERS
    
    function daysInYear(year) {
      return isLeapYear(year) ? 366 : 365;
    }
    
    function isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

// HOOKS
    
    hooks.parseTwoDigitYear = function (input) {
      return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

// MOMENTS
    
    var getSetYear = makeGetSet('FullYear', true);
    
    function getIsLeapYear () {
      return isLeapYear(this.year());
    }
    
    function createDate (y, m, d, h, M, s, ms) {
      // can't just apply() to create a date:
      // https://stackoverflow.com/q/181348
      var date = new Date(y, m, d, h, M, s, ms);
      
      // the date constructor remaps years 0-99 to 1900-1999
      if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
        date.setFullYear(y);
      }
      return date;
    }
    
    function createUTCDate (y) {
      var date = new Date(Date.UTC.apply(null, arguments));
      
      // the Date.UTC function remaps years 0-99 to 1900-1999
      if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
        date.setUTCFullYear(y);
      }
      return date;
    }

// start-of-first-week - start-of-year
    function firstWeekOffset(year, dow, doy) {
      var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
        fwd = 7 + dow - doy,
      // first-week day local weekday -- which local weekday is fwd
        fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;
      
      return -fwdlw + fwd - 1;
    }

// https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
      var localWeekday = (7 + weekday - dow) % 7,
        weekOffset = firstWeekOffset(year, dow, doy),
        dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
        resYear, resDayOfYear;
      
      if (dayOfYear <= 0) {
        resYear = year - 1;
        resDayOfYear = daysInYear(resYear) + dayOfYear;
      } else if (dayOfYear > daysInYear(year)) {
        resYear = year + 1;
        resDayOfYear = dayOfYear - daysInYear(year);
      } else {
        resYear = year;
        resDayOfYear = dayOfYear;
      }
      
      return {
        year: resYear,
        dayOfYear: resDayOfYear
      };
    }
    
    function weekOfYear(mom, dow, doy) {
      var weekOffset = firstWeekOffset(mom.year(), dow, doy),
        week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
        resWeek, resYear;
      
      if (week < 1) {
        resYear = mom.year() - 1;
        resWeek = week + weeksInYear(resYear, dow, doy);
      } else if (week > weeksInYear(mom.year(), dow, doy)) {
        resWeek = week - weeksInYear(mom.year(), dow, doy);
        resYear = mom.year() + 1;
      } else {
        resYear = mom.year();
        resWeek = week;
      }
      
      return {
        week: resWeek,
        year: resYear
      };
    }
    
    function weeksInYear(year, dow, doy) {
      var weekOffset = firstWeekOffset(year, dow, doy),
        weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
      return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
    }

// FORMATTING
    
    addFormatToken('w', ['ww', 2], 'wo', 'week');
    addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

// ALIASES
    
    addUnitAlias('week', 'w');
    addUnitAlias('isoWeek', 'W');

// PRIORITIES
    
    addUnitPriority('week', 5);
    addUnitPriority('isoWeek', 5);

// PARSING
    
    addRegexToken('w',  match1to2);
    addRegexToken('ww', match1to2, match2);
    addRegexToken('W',  match1to2);
    addRegexToken('WW', match1to2, match2);
    
    addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
      week[token.substr(0, 1)] = toInt(input);
    });

// HELPERS

// LOCALES
    
    function localeWeek (mom) {
      return weekOfYear(mom, this._week.dow, this._week.doy).week;
    }
    
    var defaultLocaleWeek = {
      dow : 0, // Sunday is the first day of the week.
      doy : 6  // The week that contains Jan 1st is the first week of the year.
    };
    
    function localeFirstDayOfWeek () {
      return this._week.dow;
    }
    
    function localeFirstDayOfYear () {
      return this._week.doy;
    }

// MOMENTS
    
    function getSetWeek (input) {
      var week = this.localeData().week(this);
      return input == null ? week : this.add((input - week) * 7, 'd');
    }
    
    function getSetISOWeek (input) {
      var week = weekOfYear(this, 1, 4).week;
      return input == null ? week : this.add((input - week) * 7, 'd');
    }

// FORMATTING
    
    addFormatToken('d', 0, 'do', 'day');
    
    addFormatToken('dd', 0, 0, function (format) {
      return this.localeData().weekdaysMin(this, format);
    });
    
    addFormatToken('ddd', 0, 0, function (format) {
      return this.localeData().weekdaysShort(this, format);
    });
    
    addFormatToken('dddd', 0, 0, function (format) {
      return this.localeData().weekdays(this, format);
    });
    
    addFormatToken('e', 0, 0, 'weekday');
    addFormatToken('E', 0, 0, 'isoWeekday');

// ALIASES
    
    addUnitAlias('day', 'd');
    addUnitAlias('weekday', 'e');
    addUnitAlias('isoWeekday', 'E');

// PRIORITY
    addUnitPriority('day', 11);
    addUnitPriority('weekday', 11);
    addUnitPriority('isoWeekday', 11);

// PARSING
    
    addRegexToken('d',    match1to2);
    addRegexToken('e',    match1to2);
    addRegexToken('E',    match1to2);
    addRegexToken('dd',   function (isStrict, locale) {
      return locale.weekdaysMinRegex(isStrict);
    });
    addRegexToken('ddd',   function (isStrict, locale) {
      return locale.weekdaysShortRegex(isStrict);
    });
    addRegexToken('dddd',   function (isStrict, locale) {
      return locale.weekdaysRegex(isStrict);
    });
    
    addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
      var weekday = config._locale.weekdaysParse(input, token, config._strict);
      // if we didn't get a weekday name, mark the date as invalid
      if (weekday != null) {
        week.d = weekday;
      } else {
        getParsingFlags(config).invalidWeekday = input;
      }
    });
    
    addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
      week[token] = toInt(input);
    });

// HELPERS
    
    function parseWeekday(input, locale) {
      if (typeof input !== 'string') {
        return input;
      }
      
      if (!isNaN(input)) {
        return parseInt(input, 10);
      }
      
      input = locale.weekdaysParse(input);
      if (typeof input === 'number') {
        return input;
      }
      
      return null;
    }
    
    function parseIsoWeekday(input, locale) {
      if (typeof input === 'string') {
        return locale.weekdaysParse(input) % 7 || 7;
      }
      return isNaN(input) ? null : input;
    }

// LOCALES
    
    var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
    function localeWeekdays (m, format) {
      if (!m) {
        return isArray(this._weekdays) ? this._weekdays :
          this._weekdays['standalone'];
      }
      return isArray(this._weekdays) ? this._weekdays[m.day()] :
        this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
    }
    
    var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
    function localeWeekdaysShort (m) {
      return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
    }
    
    var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
    function localeWeekdaysMin (m) {
      return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
    }
    
    function handleStrictParse$1(weekdayName, format, strict) {
      var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._minWeekdaysParse = [];
        
        for (i = 0; i < 7; ++i) {
          mom = createUTC([2000, 1]).day(i);
          this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
          this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
          this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
        }
      }
      
      if (strict) {
        if (format === 'dddd') {
          ii = indexOf$1.call(this._weekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
          ii = indexOf$1.call(this._shortWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf$1.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        }
      } else {
        if (format === 'dddd') {
          ii = indexOf$1.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf$1.call(this._shortWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf$1.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else if (format === 'ddd') {
          ii = indexOf$1.call(this._shortWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf$1.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf$1.call(this._minWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        } else {
          ii = indexOf$1.call(this._minWeekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf$1.call(this._weekdaysParse, llc);
          if (ii !== -1) {
            return ii;
          }
          ii = indexOf$1.call(this._shortWeekdaysParse, llc);
          return ii !== -1 ? ii : null;
        }
      }
    }
    
    function localeWeekdaysParse (weekdayName, format, strict) {
      var i, mom, regex;
      
      if (this._weekdaysParseExact) {
        return handleStrictParse$1.call(this, weekdayName, format, strict);
      }
      
      if (!this._weekdaysParse) {
        this._weekdaysParse = [];
        this._minWeekdaysParse = [];
        this._shortWeekdaysParse = [];
        this._fullWeekdaysParse = [];
      }
      
      for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already
        
        mom = createUTC([2000, 1]).day(i);
        if (strict && !this._fullWeekdaysParse[i]) {
          this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
          this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
          this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
        }
        if (!this._weekdaysParse[i]) {
          regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
          this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
        }
        // test the regex
        if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
          return i;
        } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
          return i;
        }
      }
    }

// MOMENTS
    
    function getSetDayOfWeek (input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
      if (input != null) {
        input = parseWeekday(input, this.localeData());
        return this.add(input - day, 'd');
      } else {
        return day;
      }
    }
    
    function getSetLocaleDayOfWeek (input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
      return input == null ? weekday : this.add(input - weekday, 'd');
    }
    
    function getSetISODayOfWeek (input) {
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      
      // behaves the same as moment#day except
      // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
      // as a setter, sunday should belong to the previous week.
      
      if (input != null) {
        var weekday = parseIsoWeekday(input, this.localeData());
        return this.day(this.day() % 7 ? weekday : weekday - 7);
      } else {
        return this.day() || 7;
      }
    }
    
    var defaultWeekdaysRegex = matchWord;
    function weekdaysRegex (isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysStrictRegex;
        } else {
          return this._weekdaysRegex;
        }
      } else {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
          this._weekdaysRegex = defaultWeekdaysRegex;
        }
        return this._weekdaysStrictRegex && isStrict ?
          this._weekdaysStrictRegex : this._weekdaysRegex;
      }
    }
    
    var defaultWeekdaysShortRegex = matchWord;
    function weekdaysShortRegex (isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysShortStrictRegex;
        } else {
          return this._weekdaysShortRegex;
        }
      } else {
        if (!hasOwnProp(this, '_weekdaysShortRegex')) {
          this._weekdaysShortRegex = defaultWeekdaysShortRegex;
        }
        return this._weekdaysShortStrictRegex && isStrict ?
          this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
      }
    }
    
    var defaultWeekdaysMinRegex = matchWord;
    function weekdaysMinRegex (isStrict) {
      if (this._weekdaysParseExact) {
        if (!hasOwnProp(this, '_weekdaysRegex')) {
          computeWeekdaysParse.call(this);
        }
        if (isStrict) {
          return this._weekdaysMinStrictRegex;
        } else {
          return this._weekdaysMinRegex;
        }
      } else {
        if (!hasOwnProp(this, '_weekdaysMinRegex')) {
          this._weekdaysMinRegex = defaultWeekdaysMinRegex;
        }
        return this._weekdaysMinStrictRegex && isStrict ?
          this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
      }
    }
    
    
    function computeWeekdaysParse () {
      function cmpLenRev(a, b) {
        return b.length - a.length;
      }
      
      var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
        i, mom, minp, shortp, longp;
      for (i = 0; i < 7; i++) {
        // make the regex if we don't have it already
        mom = createUTC([2000, 1]).day(i);
        minp = this.weekdaysMin(mom, '');
        shortp = this.weekdaysShort(mom, '');
        longp = this.weekdays(mom, '');
        minPieces.push(minp);
        shortPieces.push(shortp);
        longPieces.push(longp);
        mixedPieces.push(minp);
        mixedPieces.push(shortp);
        mixedPieces.push(longp);
      }
      // Sorting makes sure if one weekday (or abbr) is a prefix of another it
      // will match the longer piece.
      minPieces.sort(cmpLenRev);
      shortPieces.sort(cmpLenRev);
      longPieces.sort(cmpLenRev);
      mixedPieces.sort(cmpLenRev);
      for (i = 0; i < 7; i++) {
        shortPieces[i] = regexEscape(shortPieces[i]);
        longPieces[i] = regexEscape(longPieces[i]);
        mixedPieces[i] = regexEscape(mixedPieces[i]);
      }
      
      this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
      this._weekdaysShortRegex = this._weekdaysRegex;
      this._weekdaysMinRegex = this._weekdaysRegex;
      
      this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
      this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
      this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
    }

// FORMATTING
    
    function hFormat() {
      return this.hours() % 12 || 12;
    }
    
    function kFormat() {
      return this.hours() || 24;
    }
    
    addFormatToken('H', ['HH', 2], 0, 'hour');
    addFormatToken('h', ['hh', 2], 0, hFormat);
    addFormatToken('k', ['kk', 2], 0, kFormat);
    
    addFormatToken('hmm', 0, 0, function () {
      return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
    });
    
    addFormatToken('hmmss', 0, 0, function () {
      return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
        zeroFill(this.seconds(), 2);
    });
    
    addFormatToken('Hmm', 0, 0, function () {
      return '' + this.hours() + zeroFill(this.minutes(), 2);
    });
    
    addFormatToken('Hmmss', 0, 0, function () {
      return '' + this.hours() + zeroFill(this.minutes(), 2) +
        zeroFill(this.seconds(), 2);
    });
    
    function meridiem (token, lowercase) {
      addFormatToken(token, 0, 0, function () {
        return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
      });
    }
    
    meridiem('a', true);
    meridiem('A', false);

// ALIASES
    
    addUnitAlias('hour', 'h');

// PRIORITY
    addUnitPriority('hour', 13);

// PARSING
    
    function matchMeridiem (isStrict, locale) {
      return locale._meridiemParse;
    }
    
    addRegexToken('a',  matchMeridiem);
    addRegexToken('A',  matchMeridiem);
    addRegexToken('H',  match1to2);
    addRegexToken('h',  match1to2);
    addRegexToken('k',  match1to2);
    addRegexToken('HH', match1to2, match2);
    addRegexToken('hh', match1to2, match2);
    addRegexToken('kk', match1to2, match2);
    
    addRegexToken('hmm', match3to4);
    addRegexToken('hmmss', match5to6);
    addRegexToken('Hmm', match3to4);
    addRegexToken('Hmmss', match5to6);
    
    addParseToken(['H', 'HH'], HOUR);
    addParseToken(['k', 'kk'], function (input, array, config) {
      var kInput = toInt(input);
      array[HOUR] = kInput === 24 ? 0 : kInput;
    });
    addParseToken(['a', 'A'], function (input, array, config) {
      config._isPm = config._locale.isPM(input);
      config._meridiem = input;
    });
    addParseToken(['h', 'hh'], function (input, array, config) {
      array[HOUR] = toInt(input);
      getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmm', function (input, array, config) {
      var pos = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos));
      array[MINUTE] = toInt(input.substr(pos));
      getParsingFlags(config).bigHour = true;
    });
    addParseToken('hmmss', function (input, array, config) {
      var pos1 = input.length - 4;
      var pos2 = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos1));
      array[MINUTE] = toInt(input.substr(pos1, 2));
      array[SECOND] = toInt(input.substr(pos2));
      getParsingFlags(config).bigHour = true;
    });
    addParseToken('Hmm', function (input, array, config) {
      var pos = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos));
      array[MINUTE] = toInt(input.substr(pos));
    });
    addParseToken('Hmmss', function (input, array, config) {
      var pos1 = input.length - 4;
      var pos2 = input.length - 2;
      array[HOUR] = toInt(input.substr(0, pos1));
      array[MINUTE] = toInt(input.substr(pos1, 2));
      array[SECOND] = toInt(input.substr(pos2));
    });

// LOCALES
    
    function localeIsPM (input) {
      // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
      // Using charAt should be more compatible.
      return ((input + '').toLowerCase().charAt(0) === 'p');
    }
    
    var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
    function localeMeridiem (hours, minutes, isLower) {
      if (hours > 11) {
        return isLower ? 'pm' : 'PM';
      } else {
        return isLower ? 'am' : 'AM';
      }
    }


// MOMENTS

// Setting the hour should keep the time, because the user explicitly
// specified which hour he wants. So trying to maintain the same hour (in
// a new timezone) makes sense. Adding/subtracting hours does not follow
// this rule.
    var getSetHour = makeGetSet('Hours', true);

// months
// week
// weekdays
// meridiem
    var baseConfig = {
      calendar: defaultCalendar,
      longDateFormat: defaultLongDateFormat,
      invalidDate: defaultInvalidDate,
      ordinal: defaultOrdinal,
      dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
      relativeTime: defaultRelativeTime,
      
      months: defaultLocaleMonths,
      monthsShort: defaultLocaleMonthsShort,
      
      week: defaultLocaleWeek,
      
      weekdays: defaultLocaleWeekdays,
      weekdaysMin: defaultLocaleWeekdaysMin,
      weekdaysShort: defaultLocaleWeekdaysShort,
      
      meridiemParse: defaultLocaleMeridiemParse
    };

// internal storage for locale config files
    var locales = {};
    var localeFamilies = {};
    var globalLocale;
    
    function normalizeLocale(key) {
      return key ? key.toLowerCase().replace('_', '-') : key;
    }

// pick the locale from the array
// try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
// substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
    function chooseLocale(names) {
      var i = 0, j, next, locale, split;
      
      while (i < names.length) {
        split = normalizeLocale(names[i]).split('-');
        j = split.length;
        next = normalizeLocale(names[i + 1]);
        next = next ? next.split('-') : null;
        while (j > 0) {
          locale = loadLocale(split.slice(0, j).join('-'));
          if (locale) {
            return locale;
          }
          if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
            //the next array item is better than a shallower substring of this one
            break;
          }
          j--;
        }
        i++;
      }
      return null;
    }
    
    function loadLocale(name) {
      var oldLocale = null;
      // TODO: Find a better way to register and load all the locales in Node
      if (!locales[name] && (typeof module !== 'undefined') &&
        module && module.exports) {
        try {
          oldLocale = globalLocale._abbr;
          require('./locale/' + name);
          // because defineLocale currently also sets the global locale, we
          // want to undo that for lazy loaded locales
          getSetGlobalLocale(oldLocale);
        } catch (e) { }
      }
      return locales[name];
    }

// This function will load locale and then set the global locale.  If
// no arguments are passed in, it will simply return the current global
// locale key.
    function getSetGlobalLocale (key, values) {
      var data;
      if (key) {
        if (isUndefined(values)) {
          data = getLocale(key);
        }
        else {
          data = defineLocale(key, values);
        }
        
        if (data) {
          // moment.duration._locale = moment._locale = data;
          globalLocale = data;
        }
      }
      
      return globalLocale._abbr;
    }
    
    function defineLocale (name, config) {
      if (config !== null) {
        var parentConfig = baseConfig;
        config.abbr = name;
        if (locales[name] != null) {
          deprecateSimple('defineLocaleOverride',
            'use moment.updateLocale(localeName, config) to change ' +
            'an existing locale. moment.defineLocale(localeName, ' +
            'config) should only be used for creating a new locale ' +
            'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
          parentConfig = locales[name]._config;
        } else if (config.parentLocale != null) {
          if (locales[config.parentLocale] != null) {
            parentConfig = locales[config.parentLocale]._config;
          } else {
            if (!localeFamilies[config.parentLocale]) {
              localeFamilies[config.parentLocale] = [];
            }
            localeFamilies[config.parentLocale].push({
              name: name,
              config: config
            });
            return null;
          }
        }
        locales[name] = new Locale(mergeConfigs(parentConfig, config));
        
        if (localeFamilies[name]) {
          localeFamilies[name].forEach(function (x) {
            defineLocale(x.name, x.config);
          });
        }
        
        // backwards compat for now: also set the locale
        // make sure we set the locale AFTER all child locales have been
        // created, so we won't end up with the child locale set.
        getSetGlobalLocale(name);
        
        
        return locales[name];
      } else {
        // useful for testing
        delete locales[name];
        return null;
      }
    }
    
    function updateLocale(name, config) {
      if (config != null) {
        var locale, parentConfig = baseConfig;
        // MERGE
        if (locales[name] != null) {
          parentConfig = locales[name]._config;
        }
        config = mergeConfigs(parentConfig, config);
        locale = new Locale(config);
        locale.parentLocale = locales[name];
        locales[name] = locale;
        
        // backwards compat for now: also set the locale
        getSetGlobalLocale(name);
      } else {
        // pass null for config to unupdate, useful for tests
        if (locales[name] != null) {
          if (locales[name].parentLocale != null) {
            locales[name] = locales[name].parentLocale;
          } else if (locales[name] != null) {
            delete locales[name];
          }
        }
      }
      return locales[name];
    }

// returns locale data
    function getLocale (key) {
      var locale;
      
      if (key && key._locale && key._locale._abbr) {
        key = key._locale._abbr;
      }
      
      if (!key) {
        return globalLocale;
      }
      
      if (!isArray(key)) {
        //short-circuit everything else
        locale = loadLocale(key);
        if (locale) {
          return locale;
        }
        key = [key];
      }
      
      return chooseLocale(key);
    }
    
    function listLocales() {
      return keys$1(locales);
    }
    
    function checkOverflow (m) {
      var overflow;
      var a = m._a;
      
      if (a && getParsingFlags(m).overflow === -2) {
        overflow =
          a[MONTH]       < 0 || a[MONTH]       > 11  ? MONTH :
            a[DATE]        < 1 || a[DATE]        > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
              a[HOUR]        < 0 || a[HOUR]        > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                a[MINUTE]      < 0 || a[MINUTE]      > 59  ? MINUTE :
                  a[SECOND]      < 0 || a[SECOND]      > 59  ? SECOND :
                    a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                      -1;
        
        if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
          overflow = DATE;
        }
        if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
          overflow = WEEK;
        }
        if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
          overflow = WEEKDAY;
        }
        
        getParsingFlags(m).overflow = overflow;
      }
      
      return m;
    }

// iso 8601 regex
// 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
    var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
    
    var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;
    
    var isoDates = [
      ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
      ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
      ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
      ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
      ['YYYY-DDD', /\d{4}-\d{3}/],
      ['YYYY-MM', /\d{4}-\d\d/, false],
      ['YYYYYYMMDD', /[+-]\d{10}/],
      ['YYYYMMDD', /\d{8}/],
      // YYYYMM is NOT allowed by the standard
      ['GGGG[W]WWE', /\d{4}W\d{3}/],
      ['GGGG[W]WW', /\d{4}W\d{2}/, false],
      ['YYYYDDD', /\d{7}/]
    ];

// iso time formats and regexes
    var isoTimes = [
      ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
      ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
      ['HH:mm:ss', /\d\d:\d\d:\d\d/],
      ['HH:mm', /\d\d:\d\d/],
      ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
      ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
      ['HHmmss', /\d\d\d\d\d\d/],
      ['HHmm', /\d\d\d\d/],
      ['HH', /\d\d/]
    ];
    
    var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

// date from iso format
    function configFromISO(config) {
      var i, l,
        string = config._i,
        match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
        allowTime, dateFormat, timeFormat, tzFormat;
      
      if (match) {
        getParsingFlags(config).iso = true;
        
        for (i = 0, l = isoDates.length; i < l; i++) {
          if (isoDates[i][1].exec(match[1])) {
            dateFormat = isoDates[i][0];
            allowTime = isoDates[i][2] !== false;
            break;
          }
        }
        if (dateFormat == null) {
          config._isValid = false;
          return;
        }
        if (match[3]) {
          for (i = 0, l = isoTimes.length; i < l; i++) {
            if (isoTimes[i][1].exec(match[3])) {
              // match[2] should be 'T' or space
              timeFormat = (match[2] || ' ') + isoTimes[i][0];
              break;
            }
          }
          if (timeFormat == null) {
            config._isValid = false;
            return;
          }
        }
        if (!allowTime && timeFormat != null) {
          config._isValid = false;
          return;
        }
        if (match[4]) {
          if (tzRegex.exec(match[4])) {
            tzFormat = 'Z';
          } else {
            config._isValid = false;
            return;
          }
        }
        config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
        configFromStringAndFormat(config);
      } else {
        config._isValid = false;
      }
    }

// RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
    var basicRfcRegex = /^((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d?\d\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(?:\d\d)?\d\d\s)(\d\d:\d\d)(\:\d\d)?(\s(?:UT|GMT|[ECMP][SD]T|[A-IK-Za-ik-z]|[+-]\d{4}))$/;

// date and time from ref 2822 format
    function configFromRFC2822(config) {
      var string, match, dayFormat,
        dateFormat, timeFormat, tzFormat;
      var timezones = {
        ' GMT': ' +0000',
        ' EDT': ' -0400',
        ' EST': ' -0500',
        ' CDT': ' -0500',
        ' CST': ' -0600',
        ' MDT': ' -0600',
        ' MST': ' -0700',
        ' PDT': ' -0700',
        ' PST': ' -0800'
      };
      var military = 'YXWVUTSRQPONZABCDEFGHIKLM';
      var timezone, timezoneIndex;
      
      string = config._i
        .replace(/\([^\)]*\)|[\n\t]/g, ' ') // Remove comments and folding whitespace
        .replace(/(\s\s+)/g, ' ') // Replace multiple-spaces with a single space
        .replace(/^\s|\s$/g, ''); // Remove leading and trailing spaces
      match = basicRfcRegex.exec(string);
      
      if (match) {
        dayFormat = match[1] ? 'ddd' + ((match[1].length === 5) ? ', ' : ' ') : '';
        dateFormat = 'D MMM ' + ((match[2].length > 10) ? 'YYYY ' : 'YY ');
        timeFormat = 'HH:mm' + (match[4] ? ':ss' : '');
        
        // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
        if (match[1]) { // day of week given
          var momentDate = new Date(match[2]);
          var momentDay = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][momentDate.getDay()];
          
          if (match[1].substr(0,3) !== momentDay) {
            getParsingFlags(config).weekdayMismatch = true;
            config._isValid = false;
            return;
          }
        }
        
        switch (match[5].length) {
          case 2: // military
            if (timezoneIndex === 0) {
              timezone = ' +0000';
            } else {
              timezoneIndex = military.indexOf(match[5][1].toUpperCase()) - 12;
              timezone = ((timezoneIndex < 0) ? ' -' : ' +') +
                (('' + timezoneIndex).replace(/^-?/, '0')).match(/..$/)[0] + '00';
            }
            break;
          case 4: // Zone
            timezone = timezones[match[5]];
            break;
          default: // UT or +/-9999
            timezone = timezones[' GMT'];
        }
        match[5] = timezone;
        config._i = match.splice(1).join('');
        tzFormat = ' ZZ';
        config._f = dayFormat + dateFormat + timeFormat + tzFormat;
        configFromStringAndFormat(config);
        getParsingFlags(config).rfc2822 = true;
      } else {
        config._isValid = false;
      }
    }

// date from iso format or fallback
    function configFromString(config) {
      var matched = aspNetJsonRegex.exec(config._i);
      
      if (matched !== null) {
        config._d = new Date(+matched[1]);
        return;
      }
      
      configFromISO(config);
      if (config._isValid === false) {
        delete config._isValid;
      } else {
        return;
      }
      
      configFromRFC2822(config);
      if (config._isValid === false) {
        delete config._isValid;
      } else {
        return;
      }
      
      // Final attempt, use Input Fallback
      hooks.createFromInputFallback(config);
    }
    
    hooks.createFromInputFallback = deprecate(
      'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
      'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
      'discouraged and will be removed in an upcoming major release. Please refer to ' +
      'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
      function (config) {
        config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
      }
    );

// Pick the first defined of two or three arguments.
    function defaults(a, b, c) {
      if (a != null) {
        return a;
      }
      if (b != null) {
        return b;
      }
      return c;
    }
    
    function currentDateArray(config) {
      // hooks is actually the exported moment object
      var nowValue = new Date(hooks.now());
      if (config._useUTC) {
        return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
      }
      return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
    }

// convert an array to a date.
// the array should mirror the parameters below
// note: all values past the year are optional and will default to the lowest possible value.
// [year, month, day , hour, minute, second, millisecond]
    function configFromArray (config) {
      var i, date, input = [], currentDate, yearToUse;
      
      if (config._d) {
        return;
      }
      
      currentDate = currentDateArray(config);
      
      //compute day of the year from weeks and weekdays
      if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
        dayOfYearFromWeekInfo(config);
      }
      
      //if the day of the year is set, figure out what it is
      if (config._dayOfYear != null) {
        yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);
        
        if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
          getParsingFlags(config)._overflowDayOfYear = true;
        }
        
        date = createUTCDate(yearToUse, 0, config._dayOfYear);
        config._a[MONTH] = date.getUTCMonth();
        config._a[DATE] = date.getUTCDate();
      }
      
      // Default to current date.
      // * if no year, month, day of month are given, default to today
      // * if day of month is given, default month and year
      // * if month is given, default only year
      // * if year is given, don't default anything
      for (i = 0; i < 3 && config._a[i] == null; ++i) {
        config._a[i] = input[i] = currentDate[i];
      }
      
      // Zero out whatever was not defaulted, including time
      for (; i < 7; i++) {
        config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
      }
      
      // Check for 24:00:00.000
      if (config._a[HOUR] === 24 &&
        config._a[MINUTE] === 0 &&
        config._a[SECOND] === 0 &&
        config._a[MILLISECOND] === 0) {
        config._nextDay = true;
        config._a[HOUR] = 0;
      }
      
      config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
      // Apply timezone offset from input. The actual utcOffset can be changed
      // with parseZone.
      if (config._tzm != null) {
        config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
      }
      
      if (config._nextDay) {
        config._a[HOUR] = 24;
      }
    }
    
    function dayOfYearFromWeekInfo(config) {
      var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;
      
      w = config._w;
      if (w.GG != null || w.W != null || w.E != null) {
        dow = 1;
        doy = 4;
        
        // TODO: We need to take the current isoWeekYear, but that depends on
        // how we interpret now (local, utc, fixed offset). So create
        // a now version of current config (take local/utc/offset flags, and
        // create now).
        weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
        week = defaults(w.W, 1);
        weekday = defaults(w.E, 1);
        if (weekday < 1 || weekday > 7) {
          weekdayOverflow = true;
        }
      } else {
        dow = config._locale._week.dow;
        doy = config._locale._week.doy;
        
        var curWeek = weekOfYear(createLocal(), dow, doy);
        
        weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);
        
        // Default to current week.
        week = defaults(w.w, curWeek.week);
        
        if (w.d != null) {
          // weekday -- low day numbers are considered next week
          weekday = w.d;
          if (weekday < 0 || weekday > 6) {
            weekdayOverflow = true;
          }
        } else if (w.e != null) {
          // local weekday -- counting starts from begining of week
          weekday = w.e + dow;
          if (w.e < 0 || w.e > 6) {
            weekdayOverflow = true;
          }
        } else {
          // default to begining of week
          weekday = dow;
        }
      }
      if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
        getParsingFlags(config)._overflowWeeks = true;
      } else if (weekdayOverflow != null) {
        getParsingFlags(config)._overflowWeekday = true;
      } else {
        temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
      }
    }

// constant that refers to the ISO standard
    hooks.ISO_8601 = function () {};

// constant that refers to the RFC 2822 form
    hooks.RFC_2822 = function () {};

// date from string and format string
    function configFromStringAndFormat(config) {
      // TODO: Move this to another part of the creation flow to prevent circular deps
      if (config._f === hooks.ISO_8601) {
        configFromISO(config);
        return;
      }
      if (config._f === hooks.RFC_2822) {
        configFromRFC2822(config);
        return;
      }
      config._a = [];
      getParsingFlags(config).empty = true;
      
      // This array is used to make a Date, either with `new Date` or `Date.UTC`
      var string = '' + config._i,
        i, parsedInput, tokens, token, skipped,
        stringLength = string.length,
        totalParsedInputLength = 0;
      
      tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];
      
      for (i = 0; i < tokens.length; i++) {
        token = tokens[i];
        parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
        // console.log('token', token, 'parsedInput', parsedInput,
        //         'regex', getParseRegexForToken(token, config));
        if (parsedInput) {
          skipped = string.substr(0, string.indexOf(parsedInput));
          if (skipped.length > 0) {
            getParsingFlags(config).unusedInput.push(skipped);
          }
          string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
          totalParsedInputLength += parsedInput.length;
        }
        // don't parse if it's not a known token
        if (formatTokenFunctions[token]) {
          if (parsedInput) {
            getParsingFlags(config).empty = false;
          }
          else {
            getParsingFlags(config).unusedTokens.push(token);
          }
          addTimeToArrayFromToken(token, parsedInput, config);
        }
        else if (config._strict && !parsedInput) {
          getParsingFlags(config).unusedTokens.push(token);
        }
      }
      
      // add remaining unparsed input length to the string
      getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
      if (string.length > 0) {
        getParsingFlags(config).unusedInput.push(string);
      }
      
      // clear _12h flag if hour is <= 12
      if (config._a[HOUR] <= 12 &&
        getParsingFlags(config).bigHour === true &&
        config._a[HOUR] > 0) {
        getParsingFlags(config).bigHour = undefined;
      }
      
      getParsingFlags(config).parsedDateParts = config._a.slice(0);
      getParsingFlags(config).meridiem = config._meridiem;
      // handle meridiem
      config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);
      
      configFromArray(config);
      checkOverflow(config);
    }
    
    
    function meridiemFixWrap (locale, hour, meridiem) {
      var isPm;
      
      if (meridiem == null) {
        // nothing to do
        return hour;
      }
      if (locale.meridiemHour != null) {
        return locale.meridiemHour(hour, meridiem);
      } else if (locale.isPM != null) {
        // Fallback
        isPm = locale.isPM(meridiem);
        if (isPm && hour < 12) {
          hour += 12;
        }
        if (!isPm && hour === 12) {
          hour = 0;
        }
        return hour;
      } else {
        // this is not supposed to happen
        return hour;
      }
    }

// date from string and array of format strings
    function configFromStringAndArray(config) {
      var tempConfig,
        bestMoment,
        
        scoreToBeat,
        i,
        currentScore;
      
      if (config._f.length === 0) {
        getParsingFlags(config).invalidFormat = true;
        config._d = new Date(NaN);
        return;
      }
      
      for (i = 0; i < config._f.length; i++) {
        currentScore = 0;
        tempConfig = copyConfig({}, config);
        if (config._useUTC != null) {
          tempConfig._useUTC = config._useUTC;
        }
        tempConfig._f = config._f[i];
        configFromStringAndFormat(tempConfig);
        
        if (!isValid(tempConfig)) {
          continue;
        }
        
        // if there is any input that was not parsed add a penalty for that format
        currentScore += getParsingFlags(tempConfig).charsLeftOver;
        
        //or tokens
        currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;
        
        getParsingFlags(tempConfig).score = currentScore;
        
        if (scoreToBeat == null || currentScore < scoreToBeat) {
          scoreToBeat = currentScore;
          bestMoment = tempConfig;
        }
      }
      
      extend(config, bestMoment || tempConfig);
    }
    
    function configFromObject(config) {
      if (config._d) {
        return;
      }
      
      var i = normalizeObjectUnits(config._i);
      config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
        return obj && parseInt(obj, 10);
      });
      
      configFromArray(config);
    }
    
    function createFromConfig (config) {
      var res = new Moment(checkOverflow(prepareConfig(config)));
      if (res._nextDay) {
        // Adding is smart enough around DST
        res.add(1, 'd');
        res._nextDay = undefined;
      }
      
      return res;
    }
    
    function prepareConfig (config) {
      var input = config._i,
        format = config._f;
      
      config._locale = config._locale || getLocale(config._l);
      
      if (input === null || (format === undefined && input === '')) {
        return createInvalid({nullInput: true});
      }
      
      if (typeof input === 'string') {
        config._i = input = config._locale.preparse(input);
      }
      
      if (isMoment(input)) {
        return new Moment(checkOverflow(input));
      } else if (isDate(input)) {
        config._d = input;
      } else if (isArray(format)) {
        configFromStringAndArray(config);
      } else if (format) {
        configFromStringAndFormat(config);
      }  else {
        configFromInput(config);
      }
      
      if (!isValid(config)) {
        config._d = null;
      }
      
      return config;
    }
    
    function configFromInput(config) {
      var input = config._i;
      if (isUndefined(input)) {
        config._d = new Date(hooks.now());
      } else if (isDate(input)) {
        config._d = new Date(input.valueOf());
      } else if (typeof input === 'string') {
        configFromString(config);
      } else if (isArray(input)) {
        config._a = map(input.slice(0), function (obj) {
          return parseInt(obj, 10);
        });
        configFromArray(config);
      } else if (isObject(input)) {
        configFromObject(config);
      } else if (isNumber(input)) {
        // from milliseconds
        config._d = new Date(input);
      } else {
        hooks.createFromInputFallback(config);
      }
    }
    
    function createLocalOrUTC (input, format, locale, strict, isUTC) {
      var c = {};
      
      if (locale === true || locale === false) {
        strict = locale;
        locale = undefined;
      }
      
      if ((isObject(input) && isObjectEmpty(input)) ||
        (isArray(input) && input.length === 0)) {
        input = undefined;
      }
      // object construction must be done this way.
      // https://github.com/moment/moment/issues/1423
      c._isAMomentObject = true;
      c._useUTC = c._isUTC = isUTC;
      c._l = locale;
      c._i = input;
      c._f = format;
      c._strict = strict;
      
      return createFromConfig(c);
    }
    
    function createLocal (input, format, locale, strict) {
      return createLocalOrUTC(input, format, locale, strict, false);
    }
    
    var prototypeMin = deprecate(
      'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
      function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
          return other < this ? this : other;
        } else {
          return createInvalid();
        }
      }
    );
    
    var prototypeMax = deprecate(
      'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
      function () {
        var other = createLocal.apply(null, arguments);
        if (this.isValid() && other.isValid()) {
          return other > this ? this : other;
        } else {
          return createInvalid();
        }
      }
    );

// Pick a moment m from moments so that m[fn](other) is true for all
// other. This relies on the function fn to be transitive.
//
// moments should either be an array of moment objects or an array, whose
// first element is an array of moment objects.
    function pickBy(fn, moments) {
      var res, i;
      if (moments.length === 1 && isArray(moments[0])) {
        moments = moments[0];
      }
      if (!moments.length) {
        return createLocal();
      }
      res = moments[0];
      for (i = 1; i < moments.length; ++i) {
        if (!moments[i].isValid() || moments[i][fn](res)) {
          res = moments[i];
        }
      }
      return res;
    }

// TODO: Use [].sort instead?
    function min () {
      var args = [].slice.call(arguments, 0);
      
      return pickBy('isBefore', args);
    }
    
    function max () {
      var args = [].slice.call(arguments, 0);
      
      return pickBy('isAfter', args);
    }
    
    var now = function () {
      return Date.now ? Date.now() : +(new Date());
    };
    
    var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];
    
    function isDurationValid(m) {
      for (var key in m) {
        if (!(ordering.indexOf(key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
          return false;
        }
      }
      
      var unitHasDecimal = false;
      for (var i = 0; i < ordering.length; ++i) {
        if (m[ordering[i]]) {
          if (unitHasDecimal) {
            return false; // only allow non-integers for smallest unit
          }
          if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
            unitHasDecimal = true;
          }
        }
      }
      
      return true;
    }
    
    function isValid$1() {
      return this._isValid;
    }
    
    function createInvalid$1() {
      return createDuration(NaN);
    }
    
    function Duration (duration) {
      var normalizedInput = normalizeObjectUnits(duration),
        years = normalizedInput.year || 0,
        quarters = normalizedInput.quarter || 0,
        months = normalizedInput.month || 0,
        weeks = normalizedInput.week || 0,
        days = normalizedInput.day || 0,
        hours = normalizedInput.hour || 0,
        minutes = normalizedInput.minute || 0,
        seconds = normalizedInput.second || 0,
        milliseconds = normalizedInput.millisecond || 0;
      
      this._isValid = isDurationValid(normalizedInput);
      
      // representation for dateAddRemove
      this._milliseconds = +milliseconds +
        seconds * 1e3 + // 1000
        minutes * 6e4 + // 1000 * 60
        hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
      // Because of dateAddRemove treats 24 hours as different from a
      // day when working around DST, we need to store them separately
      this._days = +days +
        weeks * 7;
      // It is impossible translate months into days without knowing
      // which months you are are talking about, so we have to store
      // it separately.
      this._months = +months +
        quarters * 3 +
        years * 12;
      
      this._data = {};
      
      this._locale = getLocale();
      
      this._bubble();
    }
    
    function isDuration (obj) {
      return obj instanceof Duration;
    }
    
    function absRound (number) {
      if (number < 0) {
        return Math.round(-1 * number) * -1;
      } else {
        return Math.round(number);
      }
    }

// FORMATTING
    
    function offset (token, separator) {
      addFormatToken(token, 0, 0, function () {
        var offset = this.utcOffset();
        var sign = '+';
        if (offset < 0) {
          offset = -offset;
          sign = '-';
        }
        return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
      });
    }
    
    offset('Z', ':');
    offset('ZZ', '');

// PARSING
    
    addRegexToken('Z',  matchShortOffset);
    addRegexToken('ZZ', matchShortOffset);
    addParseToken(['Z', 'ZZ'], function (input, array, config) {
      config._useUTC = true;
      config._tzm = offsetFromString(matchShortOffset, input);
    });

// HELPERS

// timezone chunker
// '+10:00' > ['10',  '00']
// '-1530'  > ['-15', '30']
    var chunkOffset = /([\+\-]|\d\d)/gi;
    
    function offsetFromString(matcher, string) {
      var matches = (string || '').match(matcher);
      
      if (matches === null) {
        return null;
      }
      
      var chunk   = matches[matches.length - 1] || [];
      var parts   = (chunk + '').match(chunkOffset) || ['-', 0, 0];
      var minutes = +(parts[1] * 60) + toInt(parts[2]);
      
      return minutes === 0 ?
        0 :
        parts[0] === '+' ? minutes : -minutes;
    }

// Return a moment from input, that is local/utc/zone equivalent to model.
    function cloneWithOffset(input, model) {
      var res, diff;
      if (model._isUTC) {
        res = model.clone();
        diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
        // Use low-level api, because this fn is low-level api.
        res._d.setTime(res._d.valueOf() + diff);
        hooks.updateOffset(res, false);
        return res;
      } else {
        return createLocal(input).local();
      }
    }
    
    function getDateOffset (m) {
      // On Firefox.24 Date#getTimezoneOffset returns a floating point.
      // https://github.com/moment/moment/pull/1871
      return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
    }

// HOOKS

// This function will be called whenever a moment is mutated.
// It is intended to keep the offset in sync with the timezone.
    hooks.updateOffset = function () {};

// MOMENTS

// keepLocalTime = true means only change the timezone, without
// affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
// 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
// +0200, so we adjust the time as needed, to be valid.
//
// Keeping the time actually adds/subtracts (one hour)
// from the actual represented time. That is why we call updateOffset
// a second time. In case it wants us to change the offset again
// _changeInProgress == true case, then we have to adjust, because
// there is no such time in the given timezone.
    function getSetOffset (input, keepLocalTime, keepMinutes) {
      var offset = this._offset || 0,
        localAdjust;
      if (!this.isValid()) {
        return input != null ? this : NaN;
      }
      if (input != null) {
        if (typeof input === 'string') {
          input = offsetFromString(matchShortOffset, input);
          if (input === null) {
            return this;
          }
        } else if (Math.abs(input) < 16 && !keepMinutes) {
          input = input * 60;
        }
        if (!this._isUTC && keepLocalTime) {
          localAdjust = getDateOffset(this);
        }
        this._offset = input;
        this._isUTC = true;
        if (localAdjust != null) {
          this.add(localAdjust, 'm');
        }
        if (offset !== input) {
          if (!keepLocalTime || this._changeInProgress) {
            addSubtract(this, createDuration(input - offset, 'm'), 1, false);
          } else if (!this._changeInProgress) {
            this._changeInProgress = true;
            hooks.updateOffset(this, true);
            this._changeInProgress = null;
          }
        }
        return this;
      } else {
        return this._isUTC ? offset : getDateOffset(this);
      }
    }
    
    function getSetZone (input, keepLocalTime) {
      if (input != null) {
        if (typeof input !== 'string') {
          input = -input;
        }
        
        this.utcOffset(input, keepLocalTime);
        
        return this;
      } else {
        return -this.utcOffset();
      }
    }
    
    function setOffsetToUTC (keepLocalTime) {
      return this.utcOffset(0, keepLocalTime);
    }
    
    function setOffsetToLocal (keepLocalTime) {
      if (this._isUTC) {
        this.utcOffset(0, keepLocalTime);
        this._isUTC = false;
        
        if (keepLocalTime) {
          this.subtract(getDateOffset(this), 'm');
        }
      }
      return this;
    }
    
    function setOffsetToParsedOffset () {
      if (this._tzm != null) {
        this.utcOffset(this._tzm, false, true);
      } else if (typeof this._i === 'string') {
        var tZone = offsetFromString(matchOffset, this._i);
        if (tZone != null) {
          this.utcOffset(tZone);
        }
        else {
          this.utcOffset(0, true);
        }
      }
      return this;
    }
    
    function hasAlignedHourOffset (input) {
      if (!this.isValid()) {
        return false;
      }
      input = input ? createLocal(input).utcOffset() : 0;
      
      return (this.utcOffset() - input) % 60 === 0;
    }
    
    function isDaylightSavingTime () {
      return (
        this.utcOffset() > this.clone().month(0).utcOffset() ||
        this.utcOffset() > this.clone().month(5).utcOffset()
      );
    }
    
    function isDaylightSavingTimeShifted () {
      if (!isUndefined(this._isDSTShifted)) {
        return this._isDSTShifted;
      }
      
      var c = {};
      
      copyConfig(c, this);
      c = prepareConfig(c);
      
      if (c._a) {
        var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
        this._isDSTShifted = this.isValid() &&
          compareArrays(c._a, other.toArray()) > 0;
      } else {
        this._isDSTShifted = false;
      }
      
      return this._isDSTShifted;
    }
    
    function isLocal () {
      return this.isValid() ? !this._isUTC : false;
    }
    
    function isUtcOffset () {
      return this.isValid() ? this._isUTC : false;
    }
    
    function isUtc () {
      return this.isValid() ? this._isUTC && this._offset === 0 : false;
    }

// ASP.NET json date format regex
    var aspNetRegex = /^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

// from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
// somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
// and further modified to allow for strings containing both week and day
    var isoRegex = /^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;
    
    function createDuration (input, key) {
      var duration = input,
      // matching against regexp is expensive, do it on demand
        match = null,
        sign,
        ret,
        diffRes;
      
      if (isDuration(input)) {
        duration = {
          ms : input._milliseconds,
          d  : input._days,
          M  : input._months
        };
      } else if (isNumber(input)) {
        duration = {};
        if (key) {
          duration[key] = input;
        } else {
          duration.milliseconds = input;
        }
      } else if (!!(match = aspNetRegex.exec(input))) {
        sign = (match[1] === '-') ? -1 : 1;
        duration = {
          y  : 0,
          d  : toInt(match[DATE])                         * sign,
          h  : toInt(match[HOUR])                         * sign,
          m  : toInt(match[MINUTE])                       * sign,
          s  : toInt(match[SECOND])                       * sign,
          ms : toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
        };
      } else if (!!(match = isoRegex.exec(input))) {
        sign = (match[1] === '-') ? -1 : 1;
        duration = {
          y : parseIso(match[2], sign),
          M : parseIso(match[3], sign),
          w : parseIso(match[4], sign),
          d : parseIso(match[5], sign),
          h : parseIso(match[6], sign),
          m : parseIso(match[7], sign),
          s : parseIso(match[8], sign)
        };
      } else if (duration == null) {// checks for null or undefined
        duration = {};
      } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
        diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));
        
        duration = {};
        duration.ms = diffRes.milliseconds;
        duration.M = diffRes.months;
      }
      
      ret = new Duration(duration);
      
      if (isDuration(input) && hasOwnProp(input, '_locale')) {
        ret._locale = input._locale;
      }
      
      return ret;
    }
    
    createDuration.fn = Duration.prototype;
    createDuration.invalid = createInvalid$1;
    
    function parseIso (inp, sign) {
      // We'd normally use ~~inp for this, but unfortunately it also
      // converts floats to ints.
      // inp may be undefined, so careful calling replace on it.
      var res = inp && parseFloat(inp.replace(',', '.'));
      // apply sign while we're at it
      return (isNaN(res) ? 0 : res) * sign;
    }
    
    function positiveMomentsDifference(base, other) {
      var res = {milliseconds: 0, months: 0};
      
      res.months = other.month() - base.month() +
        (other.year() - base.year()) * 12;
      if (base.clone().add(res.months, 'M').isAfter(other)) {
        --res.months;
      }
      
      res.milliseconds = +other - +(base.clone().add(res.months, 'M'));
      
      return res;
    }
    
    function momentsDifference(base, other) {
      var res;
      if (!(base.isValid() && other.isValid())) {
        return {milliseconds: 0, months: 0};
      }
      
      other = cloneWithOffset(other, base);
      if (base.isBefore(other)) {
        res = positiveMomentsDifference(base, other);
      } else {
        res = positiveMomentsDifference(other, base);
        res.milliseconds = -res.milliseconds;
        res.months = -res.months;
      }
      
      return res;
    }

// TODO: remove 'name' arg after deprecation is removed
    function createAdder(direction, name) {
      return function (val, period) {
        var dur, tmp;
        //invert the arguments, but complain about it
        if (period !== null && !isNaN(+period)) {
          deprecateSimple(name, 'moment().' + name  + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
            'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
          tmp = val; val = period; period = tmp;
        }
        
        val = typeof val === 'string' ? +val : val;
        dur = createDuration(val, period);
        addSubtract(this, dur, direction);
        return this;
      };
    }
    
    function addSubtract (mom, duration, isAdding, updateOffset) {
      var milliseconds = duration._milliseconds,
        days = absRound(duration._days),
        months = absRound(duration._months);
      
      if (!mom.isValid()) {
        // No op
        return;
      }
      
      updateOffset = updateOffset == null ? true : updateOffset;
      
      if (milliseconds) {
        mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
      }
      if (days) {
        set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
      }
      if (months) {
        setMonth(mom, get(mom, 'Month') + months * isAdding);
      }
      if (updateOffset) {
        hooks.updateOffset(mom, days || months);
      }
    }
    
    var add      = createAdder(1, 'add');
    var subtract = createAdder(-1, 'subtract');
    
    function getCalendarFormat(myMoment, now) {
      var diff = myMoment.diff(now, 'days', true);
      return diff < -6 ? 'sameElse' :
        diff < -1 ? 'lastWeek' :
          diff < 0 ? 'lastDay' :
            diff < 1 ? 'sameDay' :
              diff < 2 ? 'nextDay' :
                diff < 7 ? 'nextWeek' : 'sameElse';
    }
    
    function calendar$1 (time, formats) {
      // We want to compare the start of today, vs this.
      // Getting start-of-today depends on whether we're local/utc/offset or not.
      var now = time || createLocal(),
        sod = cloneWithOffset(now, this).startOf('day'),
        format = hooks.calendarFormat(this, sod) || 'sameElse';
      
      var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);
      
      return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
    }
    
    function clone () {
      return new Moment(this);
    }
    
    function isAfter (input, units) {
      var localInput = isMoment(input) ? input : createLocal(input);
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
      if (units === 'millisecond') {
        return this.valueOf() > localInput.valueOf();
      } else {
        return localInput.valueOf() < this.clone().startOf(units).valueOf();
      }
    }
    
    function isBefore (input, units) {
      var localInput = isMoment(input) ? input : createLocal(input);
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
      if (units === 'millisecond') {
        return this.valueOf() < localInput.valueOf();
      } else {
        return this.clone().endOf(units).valueOf() < localInput.valueOf();
      }
    }
    
    function isBetween (from, to, units, inclusivity) {
      inclusivity = inclusivity || '()';
      return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
        (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
    }
    
    function isSame (input, units) {
      var localInput = isMoment(input) ? input : createLocal(input),
        inputMs;
      if (!(this.isValid() && localInput.isValid())) {
        return false;
      }
      units = normalizeUnits(units || 'millisecond');
      if (units === 'millisecond') {
        return this.valueOf() === localInput.valueOf();
      } else {
        inputMs = localInput.valueOf();
        return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
      }
    }
    
    function isSameOrAfter (input, units) {
      return this.isSame(input, units) || this.isAfter(input,units);
    }
    
    function isSameOrBefore (input, units) {
      return this.isSame(input, units) || this.isBefore(input,units);
    }
    
    function diff (input, units, asFloat) {
      var that,
        zoneDelta,
        delta, output;
      
      if (!this.isValid()) {
        return NaN;
      }
      
      that = cloneWithOffset(input, this);
      
      if (!that.isValid()) {
        return NaN;
      }
      
      zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;
      
      units = normalizeUnits(units);
      
      if (units === 'year' || units === 'month' || units === 'quarter') {
        output = monthDiff(this, that);
        if (units === 'quarter') {
          output = output / 3;
        } else if (units === 'year') {
          output = output / 12;
        }
      } else {
        delta = this - that;
        output = units === 'second' ? delta / 1e3 : // 1000
          units === 'minute' ? delta / 6e4 : // 1000 * 60
            units === 'hour' ? delta / 36e5 : // 1000 * 60 * 60
              units === 'day' ? (delta - zoneDelta) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                units === 'week' ? (delta - zoneDelta) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                  delta;
      }
      return asFloat ? output : absFloor(output);
    }
    
    function monthDiff (a, b) {
      // difference in months
      var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
      // b is in (anchor - 1 month, anchor + 1 month)
        anchor = a.clone().add(wholeMonthDiff, 'months'),
        anchor2, adjust;
      
      if (b - anchor < 0) {
        anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
        // linear across the month
        adjust = (b - anchor) / (anchor - anchor2);
      } else {
        anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
        // linear across the month
        adjust = (b - anchor) / (anchor2 - anchor);
      }
      
      //check for negative zero, return zero if negative zero
      return -(wholeMonthDiff + adjust) || 0;
    }
    
    hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
    hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';
    
    function toString () {
      return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
    }
    
    function toISOString() {
      if (!this.isValid()) {
        return null;
      }
      var m = this.clone().utc();
      if (m.year() < 0 || m.year() > 9999) {
        return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
      }
      if (isFunction(Date.prototype.toISOString)) {
        // native implementation is ~50x faster, use it when we can
        return this.toDate().toISOString();
      }
      return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
    }
    
    /**
     * Return a human readable representation of a moment that can
     * also be evaluated to get a new moment which is the same
     *
     * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
     */
    function inspect () {
      if (!this.isValid()) {
        return 'moment.invalid(/* ' + this._i + ' */)';
      }
      var func = 'moment';
      var zone = '';
      if (!this.isLocal()) {
        func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
        zone = 'Z';
      }
      var prefix = '[' + func + '("]';
      var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
      var datetime = '-MM-DD[T]HH:mm:ss.SSS';
      var suffix = zone + '[")]';
      
      return this.format(prefix + year + datetime + suffix);
    }
    
    function format (inputString) {
      if (!inputString) {
        inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
      }
      var output = formatMoment(this, inputString);
      return this.localeData().postformat(output);
    }
    
    function from (time, withoutSuffix) {
      if (this.isValid() &&
        ((isMoment(time) && time.isValid()) ||
        createLocal(time).isValid())) {
        return createDuration({to: this, from: time}).locale(this.locale()).humanize(!withoutSuffix);
      } else {
        return this.localeData().invalidDate();
      }
    }
    
    function fromNow (withoutSuffix) {
      return this.from(createLocal(), withoutSuffix);
    }
    
    function to (time, withoutSuffix) {
      if (this.isValid() &&
        ((isMoment(time) && time.isValid()) ||
        createLocal(time).isValid())) {
        return createDuration({from: this, to: time}).locale(this.locale()).humanize(!withoutSuffix);
      } else {
        return this.localeData().invalidDate();
      }
    }
    
    function toNow (withoutSuffix) {
      return this.to(createLocal(), withoutSuffix);
    }

// If passed a locale key, it will set the locale for this
// instance.  Otherwise, it will return the locale configuration
// variables for this instance.
    function locale (key) {
      var newLocaleData;
      
      if (key === undefined) {
        return this._locale._abbr;
      } else {
        newLocaleData = getLocale(key);
        if (newLocaleData != null) {
          this._locale = newLocaleData;
        }
        return this;
      }
    }
    
    var lang = deprecate(
      'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
      function (key) {
        if (key === undefined) {
          return this.localeData();
        } else {
          return this.locale(key);
        }
      }
    );
    
    function localeData () {
      return this._locale;
    }
    
    function startOf (units) {
      units = normalizeUnits(units);
      // the following switch intentionally omits break keywords
      // to utilize falling through the cases.
      switch (units) {
        case 'year':
          this.month(0);
        /* falls through */
        case 'quarter':
        case 'month':
          this.date(1);
        /* falls through */
        case 'week':
        case 'isoWeek':
        case 'day':
        case 'date':
          this.hours(0);
        /* falls through */
        case 'hour':
          this.minutes(0);
        /* falls through */
        case 'minute':
          this.seconds(0);
        /* falls through */
        case 'second':
          this.milliseconds(0);
      }
      
      // weeks are a special case
      if (units === 'week') {
        this.weekday(0);
      }
      if (units === 'isoWeek') {
        this.isoWeekday(1);
      }
      
      // quarters are also special
      if (units === 'quarter') {
        this.month(Math.floor(this.month() / 3) * 3);
      }
      
      return this;
    }
    
    function endOf (units) {
      units = normalizeUnits(units);
      if (units === undefined || units === 'millisecond') {
        return this;
      }
      
      // 'date' is an alias for 'day', so it should be considered as such.
      if (units === 'date') {
        units = 'day';
      }
      
      return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
    }
    
    function valueOf () {
      return this._d.valueOf() - ((this._offset || 0) * 60000);
    }
    
    function unix () {
      return Math.floor(this.valueOf() / 1000);
    }
    
    function toDate () {
      return new Date(this.valueOf());
    }
    
    function toArray () {
      var m = this;
      return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
    }
    
    function toObject () {
      var m = this;
      return {
        years: m.year(),
        months: m.month(),
        date: m.date(),
        hours: m.hours(),
        minutes: m.minutes(),
        seconds: m.seconds(),
        milliseconds: m.milliseconds()
      };
    }
    
    function toJSON () {
      // new Date(NaN).toJSON() === null
      return this.isValid() ? this.toISOString() : null;
    }
    
    function isValid$2 () {
      return isValid(this);
    }
    
    function parsingFlags () {
      return extend({}, getParsingFlags(this));
    }
    
    function invalidAt () {
      return getParsingFlags(this).overflow;
    }
    
    function creationData() {
      return {
        input: this._i,
        format: this._f,
        locale: this._locale,
        isUTC: this._isUTC,
        strict: this._strict
      };
    }

// FORMATTING
    
    addFormatToken(0, ['gg', 2], 0, function () {
      return this.weekYear() % 100;
    });
    
    addFormatToken(0, ['GG', 2], 0, function () {
      return this.isoWeekYear() % 100;
    });
    
    function addWeekYearFormatToken (token, getter) {
      addFormatToken(0, [token, token.length], 0, getter);
    }
    
    addWeekYearFormatToken('gggg',     'weekYear');
    addWeekYearFormatToken('ggggg',    'weekYear');
    addWeekYearFormatToken('GGGG',  'isoWeekYear');
    addWeekYearFormatToken('GGGGG', 'isoWeekYear');

// ALIASES
    
    addUnitAlias('weekYear', 'gg');
    addUnitAlias('isoWeekYear', 'GG');

// PRIORITY
    
    addUnitPriority('weekYear', 1);
    addUnitPriority('isoWeekYear', 1);


// PARSING
    
    addRegexToken('G',      matchSigned);
    addRegexToken('g',      matchSigned);
    addRegexToken('GG',     match1to2, match2);
    addRegexToken('gg',     match1to2, match2);
    addRegexToken('GGGG',   match1to4, match4);
    addRegexToken('gggg',   match1to4, match4);
    addRegexToken('GGGGG',  match1to6, match6);
    addRegexToken('ggggg',  match1to6, match6);
    
    addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
      week[token.substr(0, 2)] = toInt(input);
    });
    
    addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
      week[token] = hooks.parseTwoDigitYear(input);
    });

// MOMENTS
    
    function getSetWeekYear (input) {
      return getSetWeekYearHelper.call(this,
        input,
        this.week(),
        this.weekday(),
        this.localeData()._week.dow,
        this.localeData()._week.doy);
    }
    
    function getSetISOWeekYear (input) {
      return getSetWeekYearHelper.call(this,
        input, this.isoWeek(), this.isoWeekday(), 1, 4);
    }
    
    function getISOWeeksInYear () {
      return weeksInYear(this.year(), 1, 4);
    }
    
    function getWeeksInYear () {
      var weekInfo = this.localeData()._week;
      return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
    }
    
    function getSetWeekYearHelper(input, week, weekday, dow, doy) {
      var weeksTarget;
      if (input == null) {
        return weekOfYear(this, dow, doy).year;
      } else {
        weeksTarget = weeksInYear(input, dow, doy);
        if (week > weeksTarget) {
          week = weeksTarget;
        }
        return setWeekAll.call(this, input, week, weekday, dow, doy);
      }
    }
    
    function setWeekAll(weekYear, week, weekday, dow, doy) {
      var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
        date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);
      
      this.year(date.getUTCFullYear());
      this.month(date.getUTCMonth());
      this.date(date.getUTCDate());
      return this;
    }

// FORMATTING
    
    addFormatToken('Q', 0, 'Qo', 'quarter');

// ALIASES
    
    addUnitAlias('quarter', 'Q');

// PRIORITY
    
    addUnitPriority('quarter', 7);

// PARSING
    
    addRegexToken('Q', match1);
    addParseToken('Q', function (input, array) {
      array[MONTH] = (toInt(input) - 1) * 3;
    });

// MOMENTS
    
    function getSetQuarter (input) {
      return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
    }

// FORMATTING
    
    addFormatToken('D', ['DD', 2], 'Do', 'date');

// ALIASES
    
    addUnitAlias('date', 'D');

// PRIOROITY
    addUnitPriority('date', 9);

// PARSING
    
    addRegexToken('D',  match1to2);
    addRegexToken('DD', match1to2, match2);
    addRegexToken('Do', function (isStrict, locale) {
      // TODO: Remove "ordinalParse" fallback in next major release.
      return isStrict ?
        (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
        locale._dayOfMonthOrdinalParseLenient;
    });
    
    addParseToken(['D', 'DD'], DATE);
    addParseToken('Do', function (input, array) {
      array[DATE] = toInt(input.match(match1to2)[0], 10);
    });

// MOMENTS
    
    var getSetDayOfMonth = makeGetSet('Date', true);

// FORMATTING
    
    addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

// ALIASES
    
    addUnitAlias('dayOfYear', 'DDD');

// PRIORITY
    addUnitPriority('dayOfYear', 4);

// PARSING
    
    addRegexToken('DDD',  match1to3);
    addRegexToken('DDDD', match3);
    addParseToken(['DDD', 'DDDD'], function (input, array, config) {
      config._dayOfYear = toInt(input);
    });

// HELPERS

// MOMENTS
    
    function getSetDayOfYear (input) {
      var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
      return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
    }

// FORMATTING
    
    addFormatToken('m', ['mm', 2], 0, 'minute');

// ALIASES
    
    addUnitAlias('minute', 'm');

// PRIORITY
    
    addUnitPriority('minute', 14);

// PARSING
    
    addRegexToken('m',  match1to2);
    addRegexToken('mm', match1to2, match2);
    addParseToken(['m', 'mm'], MINUTE);

// MOMENTS
    
    var getSetMinute = makeGetSet('Minutes', false);

// FORMATTING
    
    addFormatToken('s', ['ss', 2], 0, 'second');

// ALIASES
    
    addUnitAlias('second', 's');

// PRIORITY
    
    addUnitPriority('second', 15);

// PARSING
    
    addRegexToken('s',  match1to2);
    addRegexToken('ss', match1to2, match2);
    addParseToken(['s', 'ss'], SECOND);

// MOMENTS
    
    var getSetSecond = makeGetSet('Seconds', false);

// FORMATTING
    
    addFormatToken('S', 0, 0, function () {
      return ~~(this.millisecond() / 100);
    });
    
    addFormatToken(0, ['SS', 2], 0, function () {
      return ~~(this.millisecond() / 10);
    });
    
    addFormatToken(0, ['SSS', 3], 0, 'millisecond');
    addFormatToken(0, ['SSSS', 4], 0, function () {
      return this.millisecond() * 10;
    });
    addFormatToken(0, ['SSSSS', 5], 0, function () {
      return this.millisecond() * 100;
    });
    addFormatToken(0, ['SSSSSS', 6], 0, function () {
      return this.millisecond() * 1000;
    });
    addFormatToken(0, ['SSSSSSS', 7], 0, function () {
      return this.millisecond() * 10000;
    });
    addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
      return this.millisecond() * 100000;
    });
    addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
      return this.millisecond() * 1000000;
    });


// ALIASES
    
    addUnitAlias('millisecond', 'ms');

// PRIORITY
    
    addUnitPriority('millisecond', 16);

// PARSING
    
    addRegexToken('S',    match1to3, match1);
    addRegexToken('SS',   match1to3, match2);
    addRegexToken('SSS',  match1to3, match3);
    
    var token;
    for (token = 'SSSS'; token.length <= 9; token += 'S') {
      addRegexToken(token, matchUnsigned);
    }
    
    function parseMs(input, array) {
      array[MILLISECOND] = toInt(('0.' + input) * 1000);
    }
    
    for (token = 'S'; token.length <= 9; token += 'S') {
      addParseToken(token, parseMs);
    }
// MOMENTS
    
    var getSetMillisecond = makeGetSet('Milliseconds', false);

// FORMATTING
    
    addFormatToken('z',  0, 0, 'zoneAbbr');
    addFormatToken('zz', 0, 0, 'zoneName');

// MOMENTS
    
    function getZoneAbbr () {
      return this._isUTC ? 'UTC' : '';
    }
    
    function getZoneName () {
      return this._isUTC ? 'Coordinated Universal Time' : '';
    }
    
    var proto = Moment.prototype;
    
    proto.add               = add;
    proto.calendar          = calendar$1;
    proto.clone             = clone;
    proto.diff              = diff;
    proto.endOf             = endOf;
    proto.format            = format;
    proto.from              = from;
    proto.fromNow           = fromNow;
    proto.to                = to;
    proto.toNow             = toNow;
    proto.get               = stringGet;
    proto.invalidAt         = invalidAt;
    proto.isAfter           = isAfter;
    proto.isBefore          = isBefore;
    proto.isBetween         = isBetween;
    proto.isSame            = isSame;
    proto.isSameOrAfter     = isSameOrAfter;
    proto.isSameOrBefore    = isSameOrBefore;
    proto.isValid           = isValid$2;
    proto.lang              = lang;
    proto.locale            = locale;
    proto.localeData        = localeData;
    proto.max               = prototypeMax;
    proto.min               = prototypeMin;
    proto.parsingFlags      = parsingFlags;
    proto.set               = stringSet;
    proto.startOf           = startOf;
    proto.subtract          = subtract;
    proto.toArray           = toArray;
    proto.toObject          = toObject;
    proto.toDate            = toDate;
    proto.toISOString       = toISOString;
    proto.inspect           = inspect;
    proto.toJSON            = toJSON;
    proto.toString          = toString;
    proto.unix              = unix;
    proto.valueOf           = valueOf;
    proto.creationData      = creationData;

// Year
    proto.year       = getSetYear;
    proto.isLeapYear = getIsLeapYear;

// Week Year
    proto.weekYear    = getSetWeekYear;
    proto.isoWeekYear = getSetISOWeekYear;

// Quarter
    proto.quarter = proto.quarters = getSetQuarter;

// Month
    proto.month       = getSetMonth;
    proto.daysInMonth = getDaysInMonth;

// Week
    proto.week           = proto.weeks        = getSetWeek;
    proto.isoWeek        = proto.isoWeeks     = getSetISOWeek;
    proto.weeksInYear    = getWeeksInYear;
    proto.isoWeeksInYear = getISOWeeksInYear;

// Day
    proto.date       = getSetDayOfMonth;
    proto.day        = proto.days             = getSetDayOfWeek;
    proto.weekday    = getSetLocaleDayOfWeek;
    proto.isoWeekday = getSetISODayOfWeek;
    proto.dayOfYear  = getSetDayOfYear;

// Hour
    proto.hour = proto.hours = getSetHour;

// Minute
    proto.minute = proto.minutes = getSetMinute;

// Second
    proto.second = proto.seconds = getSetSecond;

// Millisecond
    proto.millisecond = proto.milliseconds = getSetMillisecond;

// Offset
    proto.utcOffset            = getSetOffset;
    proto.utc                  = setOffsetToUTC;
    proto.local                = setOffsetToLocal;
    proto.parseZone            = setOffsetToParsedOffset;
    proto.hasAlignedHourOffset = hasAlignedHourOffset;
    proto.isDST                = isDaylightSavingTime;
    proto.isLocal              = isLocal;
    proto.isUtcOffset          = isUtcOffset;
    proto.isUtc                = isUtc;
    proto.isUTC                = isUtc;

// Timezone
    proto.zoneAbbr = getZoneAbbr;
    proto.zoneName = getZoneName;

// Deprecations
    proto.dates  = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
    proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
    proto.years  = deprecate('years accessor is deprecated. Use year instead', getSetYear);
    proto.zone   = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
    proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);
    
    function createUnix (input) {
      return createLocal(input * 1000);
    }
    
    function createInZone () {
      return createLocal.apply(null, arguments).parseZone();
    }
    
    function preParsePostFormat (string) {
      return string;
    }
    
    var proto$1 = Locale.prototype;
    
    proto$1.calendar        = calendar;
    proto$1.longDateFormat  = longDateFormat;
    proto$1.invalidDate     = invalidDate;
    proto$1.ordinal         = ordinal;
    proto$1.preparse        = preParsePostFormat;
    proto$1.postformat      = preParsePostFormat;
    proto$1.relativeTime    = relativeTime;
    proto$1.pastFuture      = pastFuture;
    proto$1.set             = set;

// Month
    proto$1.months            =        localeMonths;
    proto$1.monthsShort       =        localeMonthsShort;
    proto$1.monthsParse       =        localeMonthsParse;
    proto$1.monthsRegex       = monthsRegex;
    proto$1.monthsShortRegex  = monthsShortRegex;

// Week
    proto$1.week = localeWeek;
    proto$1.firstDayOfYear = localeFirstDayOfYear;
    proto$1.firstDayOfWeek = localeFirstDayOfWeek;

// Day of Week
    proto$1.weekdays       =        localeWeekdays;
    proto$1.weekdaysMin    =        localeWeekdaysMin;
    proto$1.weekdaysShort  =        localeWeekdaysShort;
    proto$1.weekdaysParse  =        localeWeekdaysParse;
    
    proto$1.weekdaysRegex       =        weekdaysRegex;
    proto$1.weekdaysShortRegex  =        weekdaysShortRegex;
    proto$1.weekdaysMinRegex    =        weekdaysMinRegex;

// Hours
    proto$1.isPM = localeIsPM;
    proto$1.meridiem = localeMeridiem;
    
    function get$1 (format, index, field, setter) {
      var locale = getLocale();
      var utc = createUTC().set(setter, index);
      return locale[field](utc, format);
    }
    
    function listMonthsImpl (format, index, field) {
      if (isNumber(format)) {
        index = format;
        format = undefined;
      }
      
      format = format || '';
      
      if (index != null) {
        return get$1(format, index, field, 'month');
      }
      
      var i;
      var out = [];
      for (i = 0; i < 12; i++) {
        out[i] = get$1(format, i, field, 'month');
      }
      return out;
    }

// ()
// (5)
// (fmt, 5)
// (fmt)
// (true)
// (true, 5)
// (true, fmt, 5)
// (true, fmt)
    function listWeekdaysImpl (localeSorted, format, index, field) {
      if (typeof localeSorted === 'boolean') {
        if (isNumber(format)) {
          index = format;
          format = undefined;
        }
        
        format = format || '';
      } else {
        format = localeSorted;
        index = format;
        localeSorted = false;
        
        if (isNumber(format)) {
          index = format;
          format = undefined;
        }
        
        format = format || '';
      }
      
      var locale = getLocale(),
        shift = localeSorted ? locale._week.dow : 0;
      
      if (index != null) {
        return get$1(format, (index + shift) % 7, field, 'day');
      }
      
      var i;
      var out = [];
      for (i = 0; i < 7; i++) {
        out[i] = get$1(format, (i + shift) % 7, field, 'day');
      }
      return out;
    }
    
    function listMonths (format, index) {
      return listMonthsImpl(format, index, 'months');
    }
    
    function listMonthsShort (format, index) {
      return listMonthsImpl(format, index, 'monthsShort');
    }
    
    function listWeekdays (localeSorted, format, index) {
      return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
    }
    
    function listWeekdaysShort (localeSorted, format, index) {
      return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
    }
    
    function listWeekdaysMin (localeSorted, format, index) {
      return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
    }
    
    getSetGlobalLocale('en', {
      dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
      ordinal : function (number) {
        var b = number % 10,
          output = (toInt(number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
              (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
        return number + output;
      }
    });

// Side effect imports
    hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
    hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);
    
    var mathAbs = Math.abs;
    
    function abs () {
      var data           = this._data;
      
      this._milliseconds = mathAbs(this._milliseconds);
      this._days         = mathAbs(this._days);
      this._months       = mathAbs(this._months);
      
      data.milliseconds  = mathAbs(data.milliseconds);
      data.seconds       = mathAbs(data.seconds);
      data.minutes       = mathAbs(data.minutes);
      data.hours         = mathAbs(data.hours);
      data.months        = mathAbs(data.months);
      data.years         = mathAbs(data.years);
      
      return this;
    }
    
    function addSubtract$1 (duration, input, value, direction) {
      var other = createDuration(input, value);
      
      duration._milliseconds += direction * other._milliseconds;
      duration._days         += direction * other._days;
      duration._months       += direction * other._months;
      
      return duration._bubble();
    }

// supports only 2.0-style add(1, 's') or add(duration)
    function add$1 (input, value) {
      return addSubtract$1(this, input, value, 1);
    }

// supports only 2.0-style subtract(1, 's') or subtract(duration)
    function subtract$1 (input, value) {
      return addSubtract$1(this, input, value, -1);
    }
    
    function absCeil (number) {
      if (number < 0) {
        return Math.floor(number);
      } else {
        return Math.ceil(number);
      }
    }
    
    function bubble () {
      var milliseconds = this._milliseconds;
      var days         = this._days;
      var months       = this._months;
      var data         = this._data;
      var seconds, minutes, hours, years, monthsFromDays;
      
      // if we have a mix of positive and negative values, bubble down first
      // check: https://github.com/moment/moment/issues/2166
      if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
        (milliseconds <= 0 && days <= 0 && months <= 0))) {
        milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
        days = 0;
        months = 0;
      }
      
      // The following code bubbles up values, see the tests for
      // examples of what that means.
      data.milliseconds = milliseconds % 1000;
      
      seconds           = absFloor(milliseconds / 1000);
      data.seconds      = seconds % 60;
      
      minutes           = absFloor(seconds / 60);
      data.minutes      = minutes % 60;
      
      hours             = absFloor(minutes / 60);
      data.hours        = hours % 24;
      
      days += absFloor(hours / 24);
      
      // convert days to months
      monthsFromDays = absFloor(daysToMonths(days));
      months += monthsFromDays;
      days -= absCeil(monthsToDays(monthsFromDays));
      
      // 12 months -> 1 year
      years = absFloor(months / 12);
      months %= 12;
      
      data.days   = days;
      data.months = months;
      data.years  = years;
      
      return this;
    }
    
    function daysToMonths (days) {
      // 400 years have 146097 days (taking into account leap year rules)
      // 400 years have 12 months === 4800
      return days * 4800 / 146097;
    }
    
    function monthsToDays (months) {
      // the reverse of daysToMonths
      return months * 146097 / 4800;
    }
    
    function as (units) {
      if (!this.isValid()) {
        return NaN;
      }
      var days;
      var months;
      var milliseconds = this._milliseconds;
      
      units = normalizeUnits(units);
      
      if (units === 'month' || units === 'year') {
        days   = this._days   + milliseconds / 864e5;
        months = this._months + daysToMonths(days);
        return units === 'month' ? months : months / 12;
      } else {
        // handle milliseconds separately because of floating point math errors (issue #1867)
        days = this._days + Math.round(monthsToDays(this._months));
        switch (units) {
          case 'week'   : return days / 7     + milliseconds / 6048e5;
          case 'day'    : return days         + milliseconds / 864e5;
          case 'hour'   : return days * 24    + milliseconds / 36e5;
          case 'minute' : return days * 1440  + milliseconds / 6e4;
          case 'second' : return days * 86400 + milliseconds / 1000;
          // Math.floor prevents floating point math errors here
          case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
          default: throw new Error('Unknown unit ' + units);
        }
      }
    }

// TODO: Use this.as('ms')?
    function valueOf$1 () {
      if (!this.isValid()) {
        return NaN;
      }
      return (
        this._milliseconds +
        this._days * 864e5 +
        (this._months % 12) * 2592e6 +
        toInt(this._months / 12) * 31536e6
      );
    }
    
    function makeAs (alias) {
      return function () {
        return this.as(alias);
      };
    }
    
    var asMilliseconds = makeAs('ms');
    var asSeconds      = makeAs('s');
    var asMinutes      = makeAs('m');
    var asHours        = makeAs('h');
    var asDays         = makeAs('d');
    var asWeeks        = makeAs('w');
    var asMonths       = makeAs('M');
    var asYears        = makeAs('y');
    
    function get$2 (units) {
      units = normalizeUnits(units);
      return this.isValid() ? this[units + 's']() : NaN;
    }
    
    function makeGetter(name) {
      return function () {
        return this.isValid() ? this._data[name] : NaN;
      };
    }
    
    var milliseconds = makeGetter('milliseconds');
    var seconds      = makeGetter('seconds');
    var minutes      = makeGetter('minutes');
    var hours        = makeGetter('hours');
    var days         = makeGetter('days');
    var months       = makeGetter('months');
    var years        = makeGetter('years');
    
    function weeks () {
      return absFloor(this.days() / 7);
    }
    
    var round = Math.round;
    var thresholds = {
      ss: 44,         // a few seconds to seconds
      s : 45,         // seconds to minute
      m : 45,         // minutes to hour
      h : 22,         // hours to day
      d : 26,         // days to month
      M : 11          // months to year
    };

// helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
      return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }
    
    function relativeTime$1 (posNegDuration, withoutSuffix, locale) {
      var duration = createDuration(posNegDuration).abs();
      var seconds  = round(duration.as('s'));
      var minutes  = round(duration.as('m'));
      var hours    = round(duration.as('h'));
      var days     = round(duration.as('d'));
      var months   = round(duration.as('M'));
      var years    = round(duration.as('y'));
      
      var a = seconds <= thresholds.ss && ['s', seconds]  ||
        seconds < thresholds.s   && ['ss', seconds] ||
        minutes <= 1             && ['m']           ||
        minutes < thresholds.m   && ['mm', minutes] ||
        hours   <= 1             && ['h']           ||
        hours   < thresholds.h   && ['hh', hours]   ||
        days    <= 1             && ['d']           ||
        days    < thresholds.d   && ['dd', days]    ||
        months  <= 1             && ['M']           ||
        months  < thresholds.M   && ['MM', months]  ||
        years   <= 1             && ['y']           || ['yy', years];
      
      a[2] = withoutSuffix;
      a[3] = +posNegDuration > 0;
      a[4] = locale;
      return substituteTimeAgo.apply(null, a);
    }

// This function allows you to set the rounding function for relative time strings
    function getSetRelativeTimeRounding (roundingFunction) {
      if (roundingFunction === undefined) {
        return round;
      }
      if (typeof(roundingFunction) === 'function') {
        round = roundingFunction;
        return true;
      }
      return false;
    }

// This function allows you to set a threshold for relative time strings
    function getSetRelativeTimeThreshold (threshold, limit) {
      if (thresholds[threshold] === undefined) {
        return false;
      }
      if (limit === undefined) {
        return thresholds[threshold];
      }
      thresholds[threshold] = limit;
      if (threshold === 's') {
        thresholds.ss = limit - 1;
      }
      return true;
    }
    
    function humanize (withSuffix) {
      if (!this.isValid()) {
        return this.localeData().invalidDate();
      }
      
      var locale = this.localeData();
      var output = relativeTime$1(this, !withSuffix, locale);
      
      if (withSuffix) {
        output = locale.pastFuture(+this, output);
      }
      
      return locale.postformat(output);
    }
    
    var abs$1 = Math.abs;
    
    function toISOString$1() {
      // for ISO strings we do not use the normal bubbling rules:
      //  * milliseconds bubble up until they become hours
      //  * days do not bubble at all
      //  * months bubble up until they become years
      // This is because there is no context-free conversion between hours and days
      // (think of clock changes)
      // and also not between days and months (28-31 days per month)
      if (!this.isValid()) {
        return this.localeData().invalidDate();
      }
      
      var seconds = abs$1(this._milliseconds) / 1000;
      var days         = abs$1(this._days);
      var months       = abs$1(this._months);
      var minutes, hours, years;
      
      // 3600 seconds -> 60 minutes -> 1 hour
      minutes           = absFloor(seconds / 60);
      hours             = absFloor(minutes / 60);
      seconds %= 60;
      minutes %= 60;
      
      // 12 months -> 1 year
      years  = absFloor(months / 12);
      months %= 12;
      
      
      // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
      var Y = years;
      var M = months;
      var D = days;
      var h = hours;
      var m = minutes;
      var s = seconds;
      var total = this.asSeconds();
      
      if (!total) {
        // this is the same as C#'s (Noda) and python (isodate)...
        // but not other JS (goog.date)
        return 'P0D';
      }
      
      return (total < 0 ? '-' : '') +
        'P' +
        (Y ? Y + 'Y' : '') +
        (M ? M + 'M' : '') +
        (D ? D + 'D' : '') +
        ((h || m || s) ? 'T' : '') +
        (h ? h + 'H' : '') +
        (m ? m + 'M' : '') +
        (s ? s + 'S' : '');
    }
    
    var proto$2 = Duration.prototype;
    
    proto$2.isValid        = isValid$1;
    proto$2.abs            = abs;
    proto$2.add            = add$1;
    proto$2.subtract       = subtract$1;
    proto$2.as             = as;
    proto$2.asMilliseconds = asMilliseconds;
    proto$2.asSeconds      = asSeconds;
    proto$2.asMinutes      = asMinutes;
    proto$2.asHours        = asHours;
    proto$2.asDays         = asDays;
    proto$2.asWeeks        = asWeeks;
    proto$2.asMonths       = asMonths;
    proto$2.asYears        = asYears;
    proto$2.valueOf        = valueOf$1;
    proto$2._bubble        = bubble;
    proto$2.get            = get$2;
    proto$2.milliseconds   = milliseconds;
    proto$2.seconds        = seconds;
    proto$2.minutes        = minutes;
    proto$2.hours          = hours;
    proto$2.days           = days;
    proto$2.weeks          = weeks;
    proto$2.months         = months;
    proto$2.years          = years;
    proto$2.humanize       = humanize;
    proto$2.toISOString    = toISOString$1;
    proto$2.toString       = toISOString$1;
    proto$2.toJSON         = toISOString$1;
    proto$2.locale         = locale;
    proto$2.localeData     = localeData;

// Deprecations
    proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
    proto$2.lang = lang;

// Side effect imports

// FORMATTING
    
    addFormatToken('X', 0, 0, 'unix');
    addFormatToken('x', 0, 0, 'valueOf');

// PARSING
    
    addRegexToken('x', matchSigned);
    addRegexToken('X', matchTimestamp);
    addParseToken('X', function (input, array, config) {
      config._d = new Date(parseFloat(input, 10) * 1000);
    });
    addParseToken('x', function (input, array, config) {
      config._d = new Date(toInt(input));
    });

// Side effect imports
    
    
    hooks.version = '2.18.1';
    
    setHookCallback(createLocal);
    
    hooks.fn                    = proto;
    hooks.min                   = min;
    hooks.max                   = max;
    hooks.now                   = now;
    hooks.utc                   = createUTC;
    hooks.unix                  = createUnix;
    hooks.months                = listMonths;
    hooks.isDate                = isDate;
    hooks.locale                = getSetGlobalLocale;
    hooks.invalid               = createInvalid;
    hooks.duration              = createDuration;
    hooks.isMoment              = isMoment;
    hooks.weekdays              = listWeekdays;
    hooks.parseZone             = createInZone;
    hooks.localeData            = getLocale;
    hooks.isDuration            = isDuration;
    hooks.monthsShort           = listMonthsShort;
    hooks.weekdaysMin           = listWeekdaysMin;
    hooks.defineLocale          = defineLocale;
    hooks.updateLocale          = updateLocale;
    hooks.locales               = listLocales;
    hooks.weekdaysShort         = listWeekdaysShort;
    hooks.normalizeUnits        = normalizeUnits;
    hooks.relativeTimeRounding = getSetRelativeTimeRounding;
    hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
    hooks.calendarFormat        = getCalendarFormat;
    hooks.prototype             = proto;
    
    return hooks;
    
  })));
  
},{}]},{},[1])