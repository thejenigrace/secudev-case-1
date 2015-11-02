'use strict';

//Setting up route
angular.module('items').config(['$stateProvider',
	function($stateProvider) {
		// Items state routing
		$stateProvider.
		state('listItems', {
			url: '/store',
			templateUrl: 'modules/items/views/list-items.client.view.html'
		}).
		//state('createItem', {
		//	url: '/items/create',
		//	templateUrl: 'modules/items/views/create-item.client.view.html'
		//}).
		state('viewItem', {
			url: '/store/item/:itemId',
			templateUrl: 'modules/items/views/view-item.client.view.html'
		}).
		state('editItem', {
			url: '/store/item/:itemId/edit',
			templateUrl: 'modules/items/views/edit-item.client.view.html'
		}).
		state('continueDonation', {
			url: '/bonjour/donation/continue',
			templateUrl: 'modules/items/views/update-donate-item.client.view.html'
		}).
		state('cancelDonation', {
			url: '/bonjour/donation/cancel',
			templateUrl: 'modules/items/views/cancel-donate-item.client.view.html'
		});
	}
]);
