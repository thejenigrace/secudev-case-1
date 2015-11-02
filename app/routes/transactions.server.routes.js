'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var transactions = require('../../app/controllers/transactions.server.controller');

	// Transactions Routes
	app.route('/transactions')
		.get(users.requiresLogin, transactions.list)
		.post(users.requiresLogin, transactions.create);

	app.route('/transactions/:transactionId')
		.get(transactions.read)
		.put(users.requiresLogin, transactions.hasAuthorization, transactions.update)
		.delete(users.requiresLogin, transactions.hasAuthorization, transactions.delete);

	app.route('/transactions/complete')
		.post(users.requiresLogin, transactions.completeTransaction);

	app.route('/transactions/filter')
		.post(users.requiresLogin, transactions.filterTransactions);

	// Finish by binding the Transaction middleware
	app.param('transactionId', transactions.transactionByID);
};
