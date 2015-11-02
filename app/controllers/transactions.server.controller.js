'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	paypal = require('paypal-rest-sdk'),
	sanitizeMongo = require('mongo-sanitize'),
	Transaction = mongoose.model('Transaction'),
	Cart = mongoose.model('Cart'),
	Item = mongoose.model('Item'),
	_ = require('lodash');

exports.completeTransaction = function(req, res) {
	var payer = {
		payer_id: req.body.PayerID
	};

	paypal.payment.execute(req.body.paymentId, payer, {}, function (err, response) {
		if (err) return res.status(400).send({ message: 'An error occured while executing your transaction' });

		res.send({ message: 'Successfully performed payment' });
	}); // Closing of paypal.payment.execute()
};

exports.filterTransactions = function(req, res) {
	var startDate = sanitizeMongo(req.body.startDate);
		startDate = new Date(startDate);
	var date_start = new Date(startDate.getFullYear(),
		startDate.getMonth(), startDate.getDate());
	var endDate = sanitizeMongo(req.body.endDate);
	endDate = new Date(endDate);
	var date_end = new Date(endDate.getFullYear(),
		endDate.getMonth(), endDate.getDate());
	date_end.setHours(date_end.getHours() + 24);

	console.log('Filter: ' + date_start + ' to ' + date_end);

	if(date_start > date_end) {
		return res.status(400).send({
			message: 'start date should not be greater than the specified end date'
		});
	} else {
		Transaction.find({created: {$gte : date_start, $lt: date_end}})
			.sort('-created').populate('user cart', 'username firstName lastName items')
			.exec(function(err, transactions) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					console.log(transactions);
					res.jsonp(transactions);
				}
		});
	}
};

/**
 * Create a Transaction
 */
exports.create = function(req, res) {
	var transaction = new Transaction(req.body);
	transaction.user = req.user;

	transaction.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transaction);
		}
	});
};

/**
 * Show the current Transaction
 */
exports.read = function(req, res) {
	//res.jsonp(req.transaction);

	Transaction.find({_id: req.transaction._id}).sort('-created').populate('user cart', 'username firstName lastName items').exec(function(err, transactions) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transactions[0]);
		}
	});
};

/**
 * Update a Transaction
 */
exports.update = function(req, res) {
	var transaction = req.transaction ;

	transaction = _.extend(transaction , req.body);

	transaction.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transaction);
		}
	});
};

/**
 * Delete an Transaction
 */
exports.delete = function(req, res) {
	var transaction = req.transaction ;

	transaction.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(transaction);
		}
	});
};

/**
 * List of Transactions
 */
exports.list = function(req, res) {
	Transaction.find({}).sort('-created').populate('user cart', 'username firstName lastName items').exec(function(err, transactions) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//console.log(transactions[0].basket);
			//Cart.find({ _id: transactions[0].basket}).exec(function(err, carts){
			//	if(err) {
			//		return res.status(400).send({
			//			message: errorHandler.getErrorMessage(err)
			//		});
			//	} else {
			//		console.log(carts);
			//	}
			//});
			res.jsonp(transactions);
		}
	});
};

/**
 * Transaction middleware
 */
exports.transactionByID = function(req, res, next, id) {
	Transaction.findById(id).populate('user', 'displayName').exec(function(err, transaction) {
		if (err) return next(err);
		if (! transaction) return next(new Error('Failed to load Transaction ' + id));
		req.transaction = transaction ;
		next();
	});
};

/**
 * Transaction authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.transaction.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
