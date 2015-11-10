'use strict';

// CartsCheckout controller
var cartsApp = angular.module('carts');

cartsApp.controller('CartCheckoutController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {
		//$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.success = false;
		$scope.completeTransaction = function() {
			var params = $location.search();
			$http.post('/api/cart/checkout/complete/transaction', params).then(function(response) {
				$scope.success = true;
				$scope.messageComplete = 'Thank you! You transaction is complete.';
			}, function(err) {
				$scope.success = true;
				$scope.messageComplete = 'Your transaction is already paid.';
			});
			//$location.path('/board/posts');
			//console.log('Success Paid!');
		};

		$scope.cancelTransaction = function() {
			console.log($scope.success);
			$http.post('/api/cart/checkout/cancel/transaction', {status: 'cancelled'}).success(function(response) {
				//$scope.success = true;
				//$scope.messageCancel = 'Thank you! Your transaction has been cancelled.';
			});
			$location.path('/board/posts');
			console.log('Cancel Transaction!');
		};

		$scope.idleTransaction = function() {
			$location.path('/carts');
		};
	}
]);
