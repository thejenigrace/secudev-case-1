'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Cart Schema
 */
var CartSchema = new Schema({
	cartItem: {
		type: Schema.ObjectId,
		ref: 'Item'
	},
	quantity: {
		type: Number,
		min: 0,
		max: 100
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

mongoose.model('Cart', CartSchema);
