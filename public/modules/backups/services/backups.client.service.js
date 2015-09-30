'use strict';

//Backups service used to communicate Backups REST endpoints
angular.module('backups')
	.factory('Backups', ['$resource',
		function($resource) {
			return $resource('backups/:backupId', { backupId: '@_id'
			}, {
				update: {
					method: 'PUT'
				}
			});
		}
	]);
