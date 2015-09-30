'use strict';

//Setting up route
angular.module('backups').config(['$stateProvider',
	function($stateProvider) {
		// Backups state routing
		$stateProvider.
		state('listBackups', {
			url: '/backups',
			templateUrl: 'modules/backups/views/list-backups.client.view.html'
		}).
		state('createBackup', {
			url: '/backups/create',
			templateUrl: 'modules/backups/views/create-backup.client.view.html'
		}).
		state('viewBackup', {
			url: '/backups/:backupId',
			templateUrl: 'modules/backups/views/view-backup.client.view.html'
		}).
		state('editBackup', {
			url: '/backups/:backupId/edit',
			templateUrl: 'modules/backups/views/edit-backup.client.view.html'
		});
	}
]);