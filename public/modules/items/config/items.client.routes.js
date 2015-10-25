'use strict';

//Setting up route
angular.module('items').config(['$stateProvider',
	function($stateProvider) {
		// Items state routing
		$stateProvider.
		state('listItems', {
			url: '/items',
			templateUrl: 'modules/items/views/list-items.client.view.html'
		}).
		state('createItem', {
			url: '/items/create',
			templateUrl: 'modules/items/views/create-item.client.view.html'
		}).
		state('viewItem', {
			url: '/items/:itemId',
			templateUrl: 'modules/items/views/view-item.client.view.html'
		}).
		state('editItem', {
			url: '/items/:itemId/edit',
			templateUrl: 'modules/items/views/edit-item.client.view.html'
		});
	}
]);