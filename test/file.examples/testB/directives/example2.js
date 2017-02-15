/**
 * Created by marcochavezf on 2/13/17.
 */
/**
 * searchBar Directive
 * Directive for tableView.html (work order search and task table).
 */
(function () {
  'use strict';

  angular.module('arvak.common')
    .directive('searchBar', searchBar);

  function searchBar() {
    var directive = {
      //templateUrl: 'js/common/templates/searchBar.html',
      require: ['^ionNavBar', '?ngModel'],
      restrict: 'E',
      scope: {
        bulkSubmit: '=',
        searchDropdownOptions: '=',
        showSearchDropdown: '=',
        resultsOnLoad: '=',
        searchTextEntered: '&',
        toggleShowBarFlag: '&'
      },
      template:
      '<div class="searchBar" ng-class="{dropdown: showSearchDropdown}">'+
      '<div class="searchTxt" ng-show="showBar">'+
      '<div class="bgdiv"></div>'+
      '<select ng-change="changeSearchSelect(searchOption)" ng-show="showSearchDropdown" ng-model="searchOption" ng-options="option.name for option in searchDropdownOptions track by option.id"></select>'+
      '<div class="bgtxt">'+
      '<input class="search-bar" type="text" placeholder="{{searchPlaceholder}}" ng-model="search" ng-model-options="{debounce: 250}">'+
      '</div>'+
      '<i class="icon clear-btn ion-close-circled" ng-click="clearSearch()" ng-show="showClearBtn"></i>'+
      '</div>'+
      '</div>'+
      '<button class="button button-icon ion-search" ng-if="!showBar || !showClearBtn" ng-click="toggleSearchBar()"></button>' +
      '<button class="button button-icon ion-ios-settings-strong" ng-if="showSettingsBtn" ng-click="openSettings()"></button>' +
      '<button class="button button-icon" ng-class="bulkSubmit.confirmationMode ? \'ion-checkmark\' : \'ion-arrow-right-c\'" ng-if="bulkSubmit.enabled" ng-disabled="!bulkSubmit.hasSelections" ng-click="bulkSubmit.submit()"></button>',
      controller: SearchBarController
    };
    return directive;

    function compile(element, attrs) {

      var icon = attrs.icon || (ionic.Platform.isAndroid() && 'ion-android-search') || (ionic.Platform.isIOS() && 'ion-ios-search-strong') || 'ion-search';
      angular.element(element[0].querySelector('.placeholder-icon')).addClass(icon);

      return function ($scope, $element, $attrs, ctrls) {
        var navBarCtrl = ctrls[0];
        $scope.navElement = $attrs.side === 'right' ? navBarCtrl.rightButtonsElement : navBarCtrl.leftButtonsElement;
      };
    }

  }

  /* @ngInject */
  function SearchBarController($scope, $timeout, UserService, NavigationService) {

    $scope.search = '';
    $scope.showBar = false;
    $scope.showClearBtn = false;
    $scope.showSettingsBtn = false;
    $scope.searchPlaceholder = 'Search...';

    $scope.clearSearch = clearSearch;
    $scope.toggleSearchBar = toggleSearchBar;
    $scope.changeSearchSelect = changeSearchSelect;

    var userSettings, currentViewId, viewSettings;

    $scope.$on('$ionicView.beforeLeave', beforeLeave);
    $scope.$on('initSearchBar', init);

    $scope.$watch('search', watchSearchModel);

    ////////////

    function watchSearchModel(newValue, oldValue){
      if(_.isEqual(newValue, oldValue)){
        return;
      }
      $scope.showClearBtn = newValue.length > 0;
      $scope.searchTextEntered({ search: newValue, searchOption: $scope.searchOption });
      saveSearchText(newValue);
    }

    /**
     * @name changeSearchSelect
     * @desc change search placeholder according to drop-down selection
     */
    function changeSearchSelect (searchOption) {
      if (_.isNil(searchOption)){
        return;
      }
      $scope.searchOption = searchOption;
      $scope.searchPlaceholder = 'Search by ' + searchOption.name;

      searchBarInputChange();
      var input = document.querySelector('input.search-bar');
      $timeout(function() { input.focus(); }, 0);

      userSettings.views[currentViewId] = userSettings.views[currentViewId] || {};
      userSettings.views[currentViewId].searchOption = searchOption;

      UserService.setUserSettings(userSettings);

      return userSettings.views[currentViewId];


    }

    /**
     * @name clearSearch
     * @desc clears the text in the search bar
     */
    function clearSearch() {
      $timeout(function() {
        $scope.search = '';
        var input = document.querySelector('input.search-bar');
        input.focus();
        searchBarInputChange();
      },0);
    }

    /**
     * @name toggleSearchBar
     * @desc enable/disable search bar
     */
    function toggleSearchBar() {
      /* if we toggle showBar it's not updated in tableView.html, that's why toggleShowBarFlag() is used instead. */
      $scope.showBar = $scope.toggleShowBarFlag();
      var input = document.querySelector('input.search-bar');

      if ($scope.showBar) {
        $timeout(function() { input.focus(); });
      }
      else {
        $timeout(function() { input.blur(); });
      }

      if (_.isNil($scope.searchOption)) {

        if (!_.isNil(userSettings)){
          if (viewSettings && viewSettings.searchOption.id) {
            $scope.searchOption = _.find($scope.searchDropdownOptions, function(option){
              return option.id === viewSettings.searchOption.id;
            });
            if (_.isNil($scope.searchOption)){
              $scope.searchOption = viewSettings.searchOption;
            }
          } else {
            $scope.searchOption = $scope.searchDropdownOptions[0];
          }
        } else {
          $scope.searchOption = $scope.searchDropdownOptions[0];
        }

        if (!_.isNil($scope.searchOption)) {
          $scope.searchPlaceholder = 'Search by ' + $scope.searchOption.name;
        }
      }
    }

    function init(){
      if (_.isNil($scope.searchDropdownOptions)) {
        $scope.searchPlaceholder = 'Search...';
        console.error('$scope.searchDropdownOptions undefined!');
      }
      $scope.loading = true;
      currentViewId = NavigationService.getCurrentView().id;

      return UserService.getUserSettings()
        .then(function(res) {
          userSettings = res;
          viewSettings = userSettings.views[currentViewId];

          if(_.isNil(viewSettings)){
            viewSettings = changeSearchSelect($scope.searchDropdownOptions[0]);
          }
          return updateSearchBar();
        })
        .catch(function(err){
          $scope.loading = false;
          console.error(err);
        });
    }

    function updateSearchBar(){
      var searchText = '';
      if(!_.isUndefined(viewSettings)){
        searchText = viewSettings.searchOption.searchText;
      }

      //when Show Results is set to False, the Search bar is defaulted to open
      if(!$scope.resultsOnLoad && !$scope.showBar){
        $scope.toggleSearchBar();
      }

      //retrieve last search text entered by user
      if(!_.isEmpty(searchText)) {
        $scope.search = searchText;
        $scope.showClearBtn = true;
        $scope.searchOption = viewSettings.searchOption;
        $scope.searchPlaceholder = 'Search by ' + $scope.searchOption.name;
        if (!$scope.showBar) {
          $scope.toggleSearchBar();
        }
      }
      $scope.searchTextEntered({ search: searchText, searchOption: $scope.searchOption });
      $scope.loading = false;
    }

    function saveSearchText(text){
      if (_.isUndefined(userSettings)){
        return;
      }
      var view = userSettings.views[currentViewId];
      if (_.isUndefined(view)){
        return;
      }
      var searchOption = view.searchOption;
      searchOption.searchText = text;
      UserService.setUserSettings(userSettings);
    }

    function searchBarInputChange() {
      $timeout(function() {
        $scope.showClearBtn = $scope.search.length > 0;
        saveSearchText($scope.search);
      },0);
      $scope.searchTextEntered({ search: $scope.search, searchOption: $scope.searchOption });
    }

    function beforeLeave(){
      saveSearchText($scope.search);
      //close searchBar if it's open
      if ($scope.showBar) {
        $scope.toggleSearchBar();
      }
    }

  }

})();
