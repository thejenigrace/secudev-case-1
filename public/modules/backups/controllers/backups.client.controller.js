'use strict';

// Backups controller
angular.module('backups').controller('BackupsController', ['$scope', '$http', '$stateParams', '$location', 'Authentication', 'Backups',
	function($scope, $http, $stateParams, $location, Authentication, Backups) {
		$scope.authentication = Authentication;

		try {
			//console.log($scope.user.roles.indexOf('admin'))
			if($scope.authentication.user.roles.indexOf('admin') < 0)
				$location.path('/posts');
		} catch(e) {
			console.log('Cannot Access');
		}

		// Download Backup
		$scope.download = function(backupName){
			alert(backupName);

			$http.post('backups/' + backupName, backupName).success(function(response) {
				console.log('YES');
			}).error(function(response) {
				$scope.error = response.message;
			});
		};

		// Create new Backup
		$scope.create = function() {
			// Create new Backup object
			var backup = new Backups ({
				name: this.name
			});

			// Redirect after save
			backup.$save(function(response) {
				$location.path('backups/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Backup
		$scope.remove = function(backup) {
			if ( backup ) {
				backup.$remove();

				for (var i in $scope.backups) {
					if ($scope.backups [i] === backup) {
						$scope.backups.splice(i, 1);
					}
				}
			} else {
				$scope.backup.$remove(function() {
					$location.path('backups');
				});
			}
		};

		// Update existing Backup
		$scope.update = function() {
			var backup = $scope.backup;

			backup.$update(function() {
				$location.path('backups/' + backup._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Backups
		$scope.find = function() {
			$scope.backups = Backups.query();
		};

		// Find existing Backup
		$scope.findOne = function() {
			$scope.backup = Backups.get({
				backupId: $stateParams.backupId
			});
		};
	}
]);
