'use strict';

var postsApp = angular.module('posts');

postsApp.controller('PostsViewController', ['$scope', '$http', '$stateParams',
	'$location', '$filter', '$modal', '$log', 'Authentication',
	function($scope, $http, $stateParams, $location, $filter, $modal, $log, Authentication) {
		$scope.user = Authentication.user;

		// If user is not signed in then redirect back home
		if (!$scope.user) $location.path('/');

		$scope.findProfile = function() {
			//console.log($stateParams.profileUserId);
			$http.post('/users/find/profile', {id: $stateParams.profileUserId}).success(function(response) {
				$scope.user = response;
			});

			$http.post('/users/profile/badge/compute', {id: $stateParams.profileUserId}).success(function(response) {
				$scope.badges = response.badges;
			});
		};
	}
]);
