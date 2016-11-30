var updateModule = angular.module('arvak.update', []);

updateModule.factory('UpdateFactory', UpdateFactory);

  UpdateFactory.$inject = ['$q', '$log', 'BinaryUpdateFactory', 'WebUpdateFactory', 'AppJsonUpdateFactory'];

  function UpdateFactory($q, $log, BinaryUpdateFactory, WebUpdateFactory, AppJsonUpdateFactory) {

    return {
      setEnvironment: setEnvironment,
      check: check,
      performBinaryUpdate: performBinaryUpdate,
      performWebUpdate: performWebUpdate,
      performAppJsonUpdate: performAppJsonUpdate
    };

    function setEnvironment(environment) {
      WebUpdateFactory.setEnvironment(environment);
    }

    function performBinaryUpdate() {
      BinaryUpdateFactory.update();
    }

    function performWebUpdate() {
      WebUpdateFactory.update();
    }

    function performAppJsonUpdate() {
      return AppJsonUpdateFactory.update();
    }

    function check() {
      var deferred = $q.defer();
      var result = {
        binary: false,
        web: false,
        json: false
      };
      // need binary update?
      BinaryUpdateFactory.check().then(function(binaryNeedsUpdate) {
        result.binary = binaryNeedsUpdate;
        if (binaryNeedsUpdate) {
          deferred.resolve(result);
        }
        else {
          // need web update?
          WebUpdateFactory.check().then(function(webNeedsUpdate) {
            result.web = webNeedsUpdate;
            if (webNeedsUpdate) {
              deferred.resolve(result);
            }
            else {
              // need app json update?
              AppJsonUpdateFactory.check().then(function(appJsonNeedsUpdate) {
                result.json = appJsonNeedsUpdate;
                if (appJsonNeedsUpdate) {
                  deferred.resolve(result);
                }
                else {
                  // need task update?
                }
              }); // AppJsonUpdateFactory
            }
          }); // WebUpdateFactory
        }
      }); // BinaryUpdateFactory

      return deferred.promise;
    }

  }


updateModule.factory('AppJsonUpdateFactory', AppJsonUpdateFactory);

  AppJsonUpdateFactory.$inject = ['$q', '$log', 'NavigationService', 'paths', '$ionicLoading', '$http', 'AppDefService', '$rootScope'];

  function AppJsonUpdateFactory($q, $log, NavigationService, paths, $ionicLoading, $http, AppDefService, $rootScope) {

    return {
      check: check,
      update: update
    };

    function check() {
      // making this a promise in case we change implementation
      // and check for update before updating
      var deferred = $q.defer();
      var needsUpdate = true; // always needs update
      deferred.resolve(needsUpdate);
      return deferred.promise;
    }

    function update() {

      $ionicLoading.show({
        template: loadingTemplate("Loading Available Applications.")
      });

      return $http.get(paths.host() + paths.app.definitions())
      .then(function(resp){
        return AppDefService.persistAppDefs(resp.data.response);
      }).then(AppDefService.getAppDefs)
      .then(function(appDefs) {
        $rootScope.$broadcast('updatedAppDefinitions', appDefs);
        $ionicLoading.hide();

        return appDefs;

      }).catch(function(err) {
        $ionicLoading.hide();
        return [];
        $log.debug("Update Error: " + JSON.stringify(err));
      });


    }

    function loadingTemplate(text) {
      return '<ion-spinner class="dark"></ion-spinner>' +
            '<br />' +
            '<span>'+text+'</span>';
    }

  }

updateModule.factory('BinaryUpdateFactory', BinaryUpdateFactory);

  BinaryUpdateFactory.$inject = ['$q', '$log', '$http', 'paths', '$cordovaAppVersion', '$ionicPopup', '$cordovaInAppBrowser'];

  function BinaryUpdateFactory($q, $log, $http, paths, $cordovaAppVersion, $ionicPopup, $cordovaInAppBrowser) {

    return {
      currentVersion: currentVersion,
      latestBinaryVersion: latestBinaryVersion,
      check: check,
      update: update
    };

    function currentVersion() {
      if(window.cordova) {
        return window.cordova.getAppVersion.getVersionNumber();
      }
      else { // local testing outside device
        return $q(function(resolve, reject) {
          resolve('0.0.5');
        });
      }
    }

    function latestBinaryVersion() {
      var deferred = $q.defer();

      $http.get(paths.host() + paths.app.binaryversion())
        .then(function(resp) {
          if (resp.data.status == "ok") {
            var binaryVersion = resp.data.response.version;
            deferred.resolve(binaryVersion);
          }
          else {
            deferred.reject(resp.data);
          }
        }, function(err) {
          console.log("Binary Error: " + JSON.stringify(err));
          deferred.reject(err);
        });

        return deferred.promise;
    }

    // return true if 'installed' (x.x.x) is
    // greater than or equal to 'required' (y.y.y).
    function isUpToDate(installed, required) {

      //console.log("binary installed: " + installed);
      //console.log("binary required: " + required);

        var a = installed.split('.');
        var b = required.split('.');
        var i = 0;

        for (i = 0; i < a.length; ++i) {
            a[i] = Number(a[i]);
        }
        for (i = 0; i < b.length; ++i) {
            b[i] = Number(b[i]);
        }
        if (a.length == 2) {
            a[2] = 0;
        }

        if (a[0] > b[0]) return true;
        if (a[0] < b[0]) return false;

        if (a[1] > b[1]) return true;
        if (a[1] < b[1]) return false;

        if (a[2] > b[2]) return true;
        if (a[2] < b[2]) return false;

        return true;
    }

    function check() {
      var deferred = $q.defer();
      currentVersion().then(function (myVersion) {
        latestBinaryVersion().then(function (latestVersion) {
          deferred.resolve(!isUpToDate(myVersion, latestVersion));
        });
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function update() {
      var appStore = ionic.Platform.isIOS() ? 'the App Store' : 'Google Play';
      var description = 'Please update to the latest app in ' + appStore + '.';
      var alertPopup = $ionicPopup.alert({
        title: 'Update Available',
        template: description,
        okText: 'Update on ' + appStore,
        buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
          text: 'Update on ' + appStore,
          type: 'button-positive',
          onTap: function(e) {
            // e.preventDefault() will stop the popup from closing when tapped.
            e.preventDefault();

            var appStoreUrl = ionic.Platform.isIOS() ? 'https://itunes.apple.com/us/app/primotus/id1043035610?ls=1&mt=8' : 'https://play.google.com/store/apps/details?id=com.primotus.arvak';
            $cordovaInAppBrowser.open(appStoreUrl, '_blank', {})
              .then(function(event) {
                // success
              })
              .catch(function(event) {
                // error
              });
            $cordovaInAppBrowser.close();
          }
        }]
      });
      // alertPopup.then(function(res) {
      //   var appStoreUrl = ionic.Platform.isIOS() ? 'https://itunes.apple.com/us/app/keynote/id361285480?mt=8' : 'market://search?q=pub:Primotus';
      //   $cordovaInAppBrowser.open(appStoreUrl, '_blank', {})
      //     .then(function(event) {
      //       // success
      //     })
      //     .catch(function(event) {
      //       // error
      //     });
      //   $cordovaInAppBrowser.close();
      // });
    }

  }



updateModule.factory('WebUpdateFactory', WebUpdateFactory);

  WebUpdateFactory.$inject = ['$q', '$log', '$ionicDeploy', '$ionicLoading', '$ionicPopup'];

  function WebUpdateFactory($q, $log, $ionicDeploy, $ionicLoading, $ionicPopup) {

    return {
      setEnvironment: setEnvironment,
      check: check,
      watch: watch,
      update: update
    };

    function setEnvironment(environment) {
      return $ionicDeploy.setChannel(environment);
    }
    function watch() {
      return $ionicDeploy.watch();
    }

    function check() {
      if (window.cordova) {
        return $ionicDeploy.check();
      }
      else { // if not on device
        return $q(function(resolve, reject) {
          resolve(false); // no need to update web
        });
      }
    }

    function update() {
      $ionicLoading.show({
        template: loadingTemplate("App Update")
      });
      $ionicDeploy.download().then(function() {
        // Extract the updates
        $ionicDeploy.extract().then(function() {
          // Load the updated version
          $ionicDeploy.load();
        }, function(error) {
          // Error extracting
          $ionicLoading.hide();
          $ionicPopup.alert({
            title: 'Update Failed',
            template: 'Unable to extract update. Please try to update again later.',
            okText: 'Okay'
          });
        }, function(progress) {
          // Do something with the zip extraction progress
          $ionicLoading.show({
            template: loadingTemplate('Extracting... ' + progress + '%')
          });
          //console.log("extract progress: " + progress);
        });
      }, function(error) {
        // Error downloading the updates
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: 'Update Failed',
          template: 'Unable to download update. Please try to update again later.',
          okText: 'Okay'
        });
      }, function(progress) {
        // Do something with the download progress
        $ionicLoading.show({
          template: loadingTemplate('Downloading... ' + progress + '%')
        });
        //console.log("download progress: " + progress);
      });
    }

    function loadingTemplate(text) {
      return '<ion-spinner class="dark"></ion-spinner>' +
            '<br />' +
            '<span>'+text+'</span>';
    }

  }
