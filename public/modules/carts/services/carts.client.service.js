'use strict';

//Carts service used to communicate Carts REST endpoints
angular.module('carts').factory('Carts', ['$resource',
	function($resource) {
		return $resource('carts/:cartId', { cartId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);