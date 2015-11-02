'use strict';

// CartsCheckout controller
var cartsApp = angular.module('carts');

cartsApp.controller('CartCheckoutController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {

		//$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.completeTransaction = function() {
			var params = $location.search();
			$http.post('/cart/checkout/complete/transaction', params).success(function (response) {
				$location.path('/board/posts');
				console.log('Success Paid!');
			});
		};

		$scope.cancelTransaction = function() {
			$http.post('/cart/checkout/cancel/transaction', {status: 'cancelled'}).success(function (response) {
				$location.path('/board/posts');
				console.log('Cancel Transaction!');
			});
		};
	}
]);
