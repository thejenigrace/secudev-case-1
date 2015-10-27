'use strict';

// Posts controller
var postsApp = angular.module('posts');

postsApp.controller('CompleteController', ['$scope', '$http', '$location', 'Authentication',
	function($scope, $http, $location, Authentication) {

		//$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.checkoutComplete = function() {
			var paramsss = $location.search();
			$http.post('/checkout/complete/transaction', paramsss).success(function(response){
				$location.path('/board/posts');
			});
		};
	}
]);
