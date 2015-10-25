'use strict';

//Setting up route
angular.module('transactions').config(['$stateProvider',
	function($stateProvider) {
		// Transactions state routing
		$stateProvider.
		state('listTransactions', {
			url: '/transactions',
			templateUrl: 'modules/transactions/views/list-transactions.client.view.html'
		}).
		state('createTransaction', {
			url: '/transactions/create',
			templateUrl: 'modules/transactions/views/create-transaction.client.view.html'
		}).
		state('viewTransaction', {
			url: '/transactions/:transactionId',
			templateUrl: 'modules/transactions/views/view-transaction.client.view.html'
		}).
		state('editTransaction', {
			url: '/transactions/:transactionId/edit',
			templateUrl: 'modules/transactions/views/edit-transaction.client.view.html'
		});
	}
]);