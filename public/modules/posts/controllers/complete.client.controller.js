'use strict';

// Posts controller
var postsApp = angular.module('posts');

postsApp.controller('CompleteController', ['$scope', '$http', '$stateParams', '$sce', '$location',
	'$location', '$filter', '$modal', '$log', '$window', 'Authentication', 'Posts', 'Users',
	function($scope, $http, $stateParams, $sce, $location, $filter, $modal, $log, $window,
			 Authentication, Posts, Users) {

		$scope.checkoutComplete = function() {
			var paramsss = $location.search();
			$http.post('/checkout/complete/transaction', paramsss).success(function(response){

			});
		};
	}
]);
