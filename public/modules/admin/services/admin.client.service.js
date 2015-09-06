'use strict';

//Admins service used to communicate Admins REST endpoints
angular.module('admin').factory('Admin', ['$resource',
	function($resource) {
		return $resource('admin/:type/:id', { type: '@type', id: '@id'}, {
			update: {
				method: 'PUT'
			},
			get: {
				method: 'GET'
			},
			delete: {
				method: 'DELETE'
			}
		});
	}
]);
