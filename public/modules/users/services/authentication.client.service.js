'use strict';

// Authentication service for user variables
angular.module('users').factory('Authentication', ['$window',
	function($window) {
		var auth = {
			user: $window.user,
			// isAdmin: function () {
			// 	return (($window.user.roles.indexOf('admin') ?  true : false)
			// }
		};

		return auth;
	}
]);
