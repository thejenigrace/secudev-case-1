'use strict';

//Admins service used to communicate Admins REST endpoints
var AdminApp = angular.module('admin');

AdminApp.factory('Admin', ['$resource',
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

AdminApp.factory('Authorization', ['$resource',
	function($resource) {
		return $resource('authorization', {}, {
			update: {
				method: 'GET'
			}
		});
	}
]);

