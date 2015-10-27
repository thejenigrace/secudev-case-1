'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		//$scope.user = Authentication.user;
        //
		//// If user is signed in then redirect back to /board/posts
		//if (!$scope.user) $location.path('/');
		//else $location.path('/board/posts');
	}
]);
