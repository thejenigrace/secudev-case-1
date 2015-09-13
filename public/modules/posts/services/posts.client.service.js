'use strict';

//Posts service used to communicate Posts REST endpoints
var postsApp = angular.module('posts');

postsApp.factory('Posts', ['$resource',
	function($resource) {
		return $resource('posts/:postId', { postId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);

postsApp.factory('Notify', ['$rootScope',
	function ($rootScope) {
		var notify = {};

		// Create Post send message
		notify.sendMessage = function (message, data) {
			data = data || {};
			$rootScope.$emit(message, data);

			console.log('message sent');
		};

		// List Posts to know if there is a new post
		notify.getMessage = function (message, func, scope) {
			var unbind = $rootScope.$on(message, func);

			if (scope) {
				scope.$on('destroy', unbind);
			}
		};

		return notify;
	}
]);
