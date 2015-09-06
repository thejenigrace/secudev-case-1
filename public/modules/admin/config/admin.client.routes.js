'use strict';

//Setting up route
angular.module('admin').config(['$stateProvider',
	function($stateProvider) {
		// Admins state routing
		$stateProvider.
		state('admin-users', {
			url: '/admin/users',
			templateUrl: 'modules/admin/views/users/main-users.client.view.html',
			controller: 'AdminUsersController'
		}).
		// state('admin-users.list', {
		// 	url: '/list',
		// 	templateUrl: 'modules/admin/views/users/list-users.client.view.html',
		// 	controller: 'AdminUsersListController'
		// }).
		// state('admin-users.edit', {
		// 	url: '/edit',
		// 	templateUrl: 'modules/admin/views/users/edit-user.client.view.html',
		// 	controller: 'AdminUsersEditController'
		// }).
		// state('admin-users.view', {
		// 	url: '/view',
		// 	templateUrl: 'modules/admin/views/users/view-user.client.view.html',
		// 	controller: 'AdminUsersViewController'
		// }).
		state('admin-users.create', {
			url: '/create',
			templateUrl: 'modules/admin/views/users/create-admin-user.client.view.html'
		});
	}
]);
