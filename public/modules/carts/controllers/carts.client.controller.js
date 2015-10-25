'use strict';

// Carts controller
angular.module('carts').controller('CartsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Carts',
	function($scope, $stateParams, $location, Authentication, Carts) {
		$scope.authentication = Authentication;

		// Create new Cart
		$scope.create = function() {
			// Create new Cart object
			var cart = new Carts ({
				name: this.name
			});

			// Redirect after save
			cart.$save(function(response) {
				$location.path('carts/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Cart
		$scope.remove = function(cart) {
			if ( cart ) { 
				cart.$remove();

				for (var i in $scope.carts) {
					if ($scope.carts [i] === cart) {
						$scope.carts.splice(i, 1);
					}
				}
			} else {
				$scope.cart.$remove(function() {
					$location.path('carts');
				});
			}
		};

		// Update existing Cart
		$scope.update = function() {
			var cart = $scope.cart;

			cart.$update(function() {
				$location.path('carts/' + cart._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Carts
		$scope.find = function() {
			$scope.carts = Carts.query();
		};

		// Find existing Cart
		$scope.findOne = function() {
			$scope.cart = Carts.get({ 
				cartId: $stateParams.cartId
			});
		};
	}
]);