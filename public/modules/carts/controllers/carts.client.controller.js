'use strict';

// Carts controller
angular.module('carts').controller('CartsController', ['$scope', '$stateParams', '$location', '$http', '$window',
	'Authentication', 'Carts', 'Transactions',
	function($scope, $stateParams, $location, $http, $window, Authentication, Carts, Transactions) {
		$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.checkoutPaypal = function() {
			$http.get('/cart/checkout').success(function (response) {
				console.log(response);
				$window.location = response;
			});
		};

		$scope.remove = function(item) {
			$http.post('/cart/remove/item', {item: item});
			$window.location.reload();
		};

		$scope.go = false;
		$scope.notify = function () {
			$scope.go = true;
		};

		$scope.updateQuantity = function(item) {
			if(item.quantity > 0) {
				$http.post('/cart/update/item', {item: item, quantity: item.quantity}).success(function(response) {

				});
				$window.location.reload();
			} else {
				$scope.remove(item);
			}
		};

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
		//$scope.remove = function(cart) {
		//	if ( cart ) {
		//		cart.$remove();
        //
		//		for (var i in $scope.carts) {
		//			if ($scope.carts [i] === cart) {
		//				$scope.carts.splice(i, 1);
		//			}
		//		}
		//	} else {
		//		$scope.cart.$remove(function() {
		//			$location.path('carts');
		//		});
		//	}
		//};

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
			//$scope.carts = Carts.query();
			//$scope.transactions = Transactions.query();
			$http.get('/cart/compute/total').success(function (response) {
				$scope.totalAmount = response;
			});
			$http.get('/carts').success(function(response) {
				//console.log(response);
				//console.log(response.items);
				//console.log(response.quantity);
				$scope.cart = response;
				$scope.items = response.items;
				//$scope.quantity = response.quantity;
			});


		};

		// Find existing Cart
		$scope.findOne = function() {
			$scope.cart = Carts.get({
				cartId: $stateParams.cartId
			});
		};
	}
]);
