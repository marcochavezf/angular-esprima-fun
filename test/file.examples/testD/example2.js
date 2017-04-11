angular.module('odin.report')
  .directive('reportView', ['$timeout', 'ReporterService', 'DataSourceService', 'GridService',
    function ($timeout, ReporterService, DataSourceService, GridService) {
      'use strict';

      return {
        restrict:'E',
        templateUrl: '/templates/reporter/directives/reportViewDirective.htm',
        scope: {
          settings: '=',
          preview: '=',
          onload: '&',
          selectedFacets: '=',
          additionalOptions: '='
        },
        link: function(scope, element, attrs) {
          if(attrs.height) {
            var height,
              resize = function() {
                var grid = angular.element('[ag-grid]', element);
                var sidebar = angular.element('.page-side-bar', element);
                if(grid.length > 0) {
                  if(attrs.height === 'fill') {
                    height = angular.element(window).height() - grid.offset().top - 35;
                  }
                  else if(!isNaN(attrs.height)) {
                    height = attrs.height / 1;
                  }
                  grid.css('height', height);
                  sidebar.css('height', height);
                } else {
                  $timeout(resize, 500);
                }
              };

            angular.element(function() {
              resize();
              angular.element(window).resize(resize);
            });
          }

          if(attrs.showHeader === 'false') {
            scope.showHeader = false;
          }
          else {
            scope.showHeader = true;
          }
        },
        controller: ['$scope', function($scope) {
          var init = function(gridSettings) {
            if($scope.onload && typeof $scope.onload() === 'function') {
              $scope.onload()($scope.grid);
            }
            if(!$scope.grid.activeCollection || _.isEmpty($scope.grid.activeCollection)) {
              var primary = _.find(gridSettings.reports, {type: 'summary'}) || gridSettings.reports[0];
              $scope.grid.setCollectionActive(primary.id, null, $scope.additionalOptions.enableCheckboxes);
            }

            $scope.globalFilterDisplay = _.map(gridSettings.globalFilters, function(filter) {
              var field = $scope.allFields[filter.field];
              return {
                fieldName: field ? field.ddEntry.name : '',
                field: field,
                condition: filter.condition,
                model: filter.model
              };
            });
          };

          $scope.$watch('settings', function(newSettings, oldSettings) {
            if(newSettings && (!oldSettings || !$scope.grid)) {
              $scope.grid = GridService.newGrid($scope.settings, null, $scope.additionalOptions);
              var dataSources = _.map(newSettings.dataSources, function(source){
                return {
                  uniqueId: source.dataSourceId + '_' + source.dsTypeId,
                  id: source.dsTypeId,
                  dataSourceId: source.dataSourceId
                };
              });

              DataSourceService.getFieldOptions(dataSources, newSettings.type).then(function(result) {
                $scope.allFields = result.allFields;
                $scope.grid.setFieldList($scope.allFields);
                if($scope.selectedFacets) {
                  $scope.grid.setFilters(ReporterService.generateActiveFilterSet([$scope.selectedFacets]));
                }
                init(newSettings);
              });
            }

          }, true);

          $scope.$watch('grid.rowsPerPage', function(rowsPerPage) {
            $scope.pageSizeSelected = String(rowsPerPage);
          });

          $scope.doQuickFilter = function(filter) {
            $scope.grid.gridOptions.api.setQuickFilter(filter);
          };

          $scope.$watch('grid.uiFacets', function(uiFacets, prevUiFacets) {
            var newUiFacets = _.clone(uiFacets);
            if($scope.selectedFacets && !_.isEmpty(newUiFacets) && _.isEmpty(prevUiFacets)) {
              _.assign(_.find(newUiFacets, {column: $scope.selectedFacets.column}), $scope.selectedFacets);
            }
            $scope.uiFacets = newUiFacets;
          });

          $scope.setRowsPerPage = function(rowsPerPage) {
            $scope.grid.setPageSize(parseInt(rowsPerPage));
          };

          $scope.resetFacet = function(facet) {
            ReporterService.resetFilter(facet);
            $scope.applyFilter();
          };

          $scope.applyFilter = function() {
            var activeFacetFilters = ReporterService.generateActiveFilterSet($scope.uiFacets);
            $scope.activeFilters = _.intersectionBy($scope.uiFacets, activeFacetFilters, 'column');
            $scope.grid.setFilters(activeFacetFilters);
          };
        }]
      };
    }]);
