'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var carts = require('../../app/controllers/carts.server.controller');

	// Carts Routes
	app.route('/carts')
		.get(carts.list)
		.post(users.requiresLogin, carts.create);

	app.route('/carts/:cartId')
		.get(carts.read)
		.put(users.requiresLogin, carts.hasAuthorization, carts.update)
		.delete(users.requiresLogin, carts.hasAuthorization, carts.delete);

	// Finish by binding the Cart middleware
	app.param('cartId', carts.cartByID);
};
