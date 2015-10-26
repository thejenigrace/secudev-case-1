'use strict';

// Items controller
angular.module('items').controller('ItemsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Items', '$http',
	function($scope, $stateParams, $location, Authentication, Items, $http) {
		$scope.authentication = Authentication;

		$scope.user = Authentication.user;

		// Create new Item
		$scope.create = function() {
			// Create new Item object

			$http.post('/items/upload-image', $scope.image).success( function(response) {

			});

			var item = new Items ({
				name: this.name,
				description: this.description,
				image: this.image,
				price: this.price
			});

			// Redirect after save
			item.$save(function(response) {
				$location.path('items/' + response._id);

				// Clear form fields
				$scope.name = '';
				$scope.description = '';
				$scope.image = '';
				$scope.price = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Item
		$scope.remove = function(item) {
			if ( item ) {
				item.$remove();

				for (var i in $scope.items) {
					if ($scope.items [i] === item) {
						$scope.items.splice(i, 1);
					}
				}
			} else {
				$scope.item.$remove(function() {
					$location.path('items');
				});
			}
		};

		// Update existing Item
		$scope.update = function() {
			var item = $scope.item;

			item.$update(function() {
				$location.path('items/' + item._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Items
		$scope.find = function() {
			$scope.items = Items.query();
		};

		// Find existing Item
		$scope.findOne = function() {
			$scope.item = Items.get({
				itemId: $stateParams.itemId
			});
		};

		$scope.isAdmin = function() {
			if($scope.user.roles.indexOf('admin') === 0)
				return true;
			else
				return false;
		};

		$scope.isUser = function() {
			if($scope.user.roles.indexOf('user') === 0)
				return true;
			else
				return false;
		};

		//this.remove = function(item) {
		//	if (item) {
		//		//post.$remove(function(response) {
		//		//	//Notify.sendMessage('Remove Post', {'id': response._id});
		//		//	$scope.retrievePosts();
		//		//});
        //
		//		$http.delete('/posts/' + post._id).success(function(response) {
		//			$scope.retrievePosts();
		//		});
        //
		//		//for (var i in $scope.posts) {
		//		//	if ($scope.posts [i] === post) {
		//		//		$scope.posts.splice(i, 1);
		//		//	}
		//		//}
		//	} else {
		//		$scope.post.$remove(function() {
        //
		//		});
		//	}
		//};
	}
]);
