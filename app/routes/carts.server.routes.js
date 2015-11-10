'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var carts = require('../../app/controllers/carts.server.controller');

	// Carts Routes
	app.route('/carts')
		.get(users.requiresLogin, carts.list)
		.post(users.requiresLogin, carts.create);

	app.route('/carts/:cartId')
		.get(users.requiresLogin, carts.read)
		.put(users.requiresLogin, carts.hasAuthorization, carts.update)
		.delete(users.requiresLogin, carts.hasAuthorization, carts.delete);

	app.route('/cart/add/item')
		.post(users.requiresLogin, carts.addItem);

	app.route('/cart/remove/item')
		.post(users.requiresLogin, carts.removeItem);

	app.route('/cart/update/item')
		.post(users.requiresLogin, carts.updateItem);

	app.route('/cart/compute/total')
		.get(users.requiresLogin, carts.computeTotalAmount);

	app.route('/cart/checkout')
		.get(users.requiresLogin, carts.checkout);

	app.route('/api/cart/checkout/complete/transaction')
		.post(users.requiresLogin, carts.completeTransaction);

	app.route('/api/cart/checkout/cancel/transaction')
		.post(users.requiresLogin, carts.cancelTransaction);

	app.route('/api/cart/transaction/webhook')
		.post(carts.paypalWebhook);

	// Finish by binding the Cart middleware
	app.param('cartId', carts.cartByID);
};
