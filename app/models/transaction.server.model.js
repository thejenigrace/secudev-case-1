'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var validateLocalStrategyStatus = function (status) {
	return ( status === 'paid' || status === 'notpaid' || status === 'cancelled');
};
/**
 * Transaction Schema
 */
var TransactionSchema = new Schema({
	cart: {
		type: Schema.ObjectId,
		ref: 'Cart'
	},
	status: {
		type: String,
		validate: [validateLocalStrategyStatus, 'invalid transaction status']
	},
	total: {
		type: Number,
		min: 0,
		max: 100000
	},
	paymentId: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

mongoose.model('Transaction', TransactionSchema);
