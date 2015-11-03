'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

//var validateLocalStrategyStatus = function (status) {
//	return ( status === 'donated' || status === 'ongoing' ||status === 'cancelled');
//};

/**
 * Donation Schema
 */
var DonationSchema = new Schema({
	//status: {
	//	type: String,
	//	validate: [validateLocalStrategyStatus, 'invalid transaction status'],
	//	default: 'ongoing'
	//},
	amount: {
		type: Number,
		min: 5
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

mongoose.model('Donation', DonationSchema);
