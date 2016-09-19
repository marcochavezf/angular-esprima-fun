/**
 * Created by marcochavezf on 9/12/16.
 */
/**
 * LoginController
 */
(function () {
	'use strict';

	angular.module('arvak.auth')
		.controller('LoginController', LoginController);

	/* @ngInject */
	function LoginController($scope, $state, AuthService, $ionicLoading, TaskService, UpdateFactory, MobileConfig, TokenService, NavigationService, chatSocket, ConnectionService, TaskActions) {

		$scope.isLoading = false;
		$scope.model = {
			username: '',
			password: '',
			remember: false
		};
		$scope.invalid = false;

		$scope.forgotPassword = function () {
			$state.go('forgot-password');
		};
		$scope.login = login;
		$scope.$on('$ionicView.beforeEnter', beforeEnter);

		////////////

		function beforeEnter() {

			if (!TokenService.getToken()) {
				return;
			}

			ionic.Platform.ready(function () {

				//Loading app from Pouch
				if (MobileConfig.isDevice()) {   //Device Mode
					if (ConnectionService.isOnline()) {

						UpdateFactory.performAppJsonUpdate().then(function (appDefs) {    //get latest apps assigned to user.
							NavigationService.setAppList(appDefs);

							NavigationService.loadDeviceAppState(appDefs).then(function (appDef) {
								$state.go('menu.home');

								if (NavigationService.isAppLoaded()) {
									var processIds = NavigationService.getAppState().properties.processIds;

									//TODO:Remove this code when redux implementation is completed.
									//TaskService.loadOpenTasks();  // Load existing Pouch tasks

									TaskService.getProcessFields(processIds, true).then(function () {

										return TaskActions.loadAndPrepareAllTasks();

										//TODO:Remove this code when redux implementation is completed.
										//return TaskService.syncServerTaskData(false)
									});
								}

							});
						});
					}
				} else {   //Builder Mode

					chatSocket.emit("register", {
						sessionId: TokenService.getToken(),
						client: "arvak",
						roomName: MobileConfig.roomName
					});
					$state.go('menu.home');
				}
			});

		}

		function login() {

			$scope.isLoading = true;
			$scope.invalid = false;

			AuthService.login($scope.model.username, $scope.model.password)
				.then(function (result) {

					$scope.isLoading = false;
					$scope.invalid = false;
					$ionicLoading.hide();

					ionic.Platform.ready(function () {

						if (ConnectionService.isOnline()) {
							if (MobileConfig.isDevice()) {   //Device Mode


								UpdateFactory.performAppJsonUpdate().then(function (appDefs) {
									NavigationService.setAppList(appDefs);

									NavigationService.loadDeviceAppState(appDefs).then(function () {
										$state.go('menu.home');
										if (NavigationService.isAppLoaded()) {

											TaskService.flushOpenTasks().then(function () {
												var processIds = NavigationService.getAppState().properties.processIds;
												return TaskService.getProcessFields(processIds, true)
													.then(function () {

														return TaskActions.processUnsentTasks().then(function(){
															//TODO:Remove this code when redux implementation is completed.
															//return TaskService.processUnsentQueue().then(function(){

															TaskActions.loadAndPrepareAllTasks();
															//TODO:Remove this code when redux implementation is completed.
															//TaskService.syncServerTaskData(true)

														})
													});
											});
										}

									});
								});
							}
						}

					});


				}).catch(function (error) {
				$scope.invalid = true;
				$scope.isLoading = false;
				$ionicLoading.hide();
			});
		} //- login()
	}

})(); //- LoginController()
