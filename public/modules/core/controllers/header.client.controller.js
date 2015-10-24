'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$http', '$window', '$location',
	'Authentication', 'Menus',
	function($scope, $http, $window, $location, Authentication, Menus) {
		$scope.authentication = Authentication;
		$scope.isCollapsed = false;
		$scope.menu = Menus.getMenu('topbar');

		$scope.toggleCollapsibleMenu = function() {
			$scope.isCollapsed = !$scope.isCollapsed;
		};

		// Collapsing the menu after navigation
		$scope.$on('$stateChangeSuccess', function() {
			$scope.isCollapsed = false;
		});

		$scope.logout = function() {
			$http.post('/auth/signout', {signout: true}).success(function(response) {
				$window.location.reload();
			});
		};
	}
]);
