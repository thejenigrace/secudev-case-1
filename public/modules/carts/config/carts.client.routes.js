'use strict';

//Setting up route
angular.module('carts').config(['$stateProvider',
	function($stateProvider) {
		// Carts state routing
		$stateProvider.
		state('listCarts', {
			url: '/carts',
			templateUrl: 'modules/carts/views/list-carts.client.view.html'
		}).
		state('createCart', {
			url: '/carts/create',
			templateUrl: 'modules/carts/views/create-cart.client.view.html'
		}).
		state('viewCart', {
			url: '/carts/:cartId',
			templateUrl: 'modules/carts/views/view-cart.client.view.html'
		}).
		state('editCart', {
			url: '/carts/:cartId/edit',
			templateUrl: 'modules/carts/views/edit-cart.client.view.html'
		}).
		state('completeTransactionCart', {
			url: '/cart/checkout/complete/transaction/:cartId',
			templateUrl: 'modules/carts/views/checkout-cart.client.view.html'
		}).
		state('cancelTransactionCart', {
			url: '/cart/checkout/cancel/transaction/:cartId',
			templateUrl: 'modules/carts/views/cancel-cart.client.view.html'
		});
	}
]);
