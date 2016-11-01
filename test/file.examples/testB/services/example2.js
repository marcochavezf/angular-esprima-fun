var audioModule = angular.module('arvak.audio', []);

audioModule.factory('AudioService', AudioFactory);

AudioFactory.$inject = ['$cordovaNativeAudio'];
//cordova plugin add cordova-plugin-nativeaudio
// based on https://github.com/SidneyS/cordova-plugin-nativeaudio
function AudioFactory($cordovaNativeAudio) {

	return {
		playSound: playSound
	};

  // options: { path: "path/to/file.mp3", time: 1000 }
	// clipLength (milliseconds) is needed to unload audio file after playing
	function playSound(options) {
		if(window.cordova) {
			// unique identifier (if called milliseconds apart)
			var name = ""+(new Date().valueOf());
		 	preloadSimple(name, options.path)
		  		.then(function(msg) {
		  			console.log(msg);
		  			play(name);
		  			// audio file must be finished playing before unloading
		  			setTimeout(function() {
		  				unload(name);
		  			}, options.time + 500); // add buffer
		  		}, function(error) {
		  			console.log('error: ' + error);
		  		});
		}
	}

	function preloadSimple(name, path) {
		return $cordovaNativeAudio.preloadSimple(name, path);
	}

	function preloadComplex(name, path, volume, voices) {
		return $cordovaNativeAudio.preloadComplex(name, path, volume, voices);
	}
	
	function play(name) {
		$cordovaNativeAudio.play(name);
	}

	function stop(name) {
		$cordovaNativeAudio.stop(name);
	}

	function loop(name) {
		$cordovaNativeAudio.loop(name);
	}

	function unload(name) {
		$cordovaNativeAudio.unload(name);
	}


}
