'use strict';

//Transactions service used to communicate Transactions REST endpoints
angular.module('transactions').factory('Transactions', ['$resource',
	function($resource) {
		return $resource('transactions/:transactionId', { transactionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);