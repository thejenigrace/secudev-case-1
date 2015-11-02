'use strict';

var itemsApp = angular.module('items');

itemsApp.controller('ItemsDonateController', ['$scope', '$stateParams', '$location', '$http', '$window', '$timeout',
	'Authentication', 'Items',
	function($scope, $stateParams, $location, $http, $window, $timeout,
			 Authentication, Items) {
		$scope.authentication = Authentication;
		$scope.user = Authentication.user;

		// If user is signed in then redirect back home
		if (!$scope.authentication.user) $location.path('/');

		$scope.completeDonation = function() {
			$http.post('/items/update/donation', {status: 'donated'});
			$location.path('/board/posts');
			console.log('Success Donation!');
		};

		$scope.cancelDonation = function() {
			$http.post('/items/update/donation', {status: 'cancelled'});
			$location.path('/board/posts');
			console.log('Cancelled Donation!');
		};
}]);
