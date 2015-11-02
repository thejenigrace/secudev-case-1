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
	items: [{
		name: {
			type: String,
			default: '',
			required: 'Please fill Item name',
			trim: true
		},
		price: {
			type: Number,
			min: 0,
			max: 10000,
			required: 'Please fill Item price'
		},
		image: {
			type: String
		},
		quantity: {
			type: Number,
			min: 0,
			max: 100,
			default: 1
		}
	}],
	total: {
		type: Number,
		min: 0,
		max: 100000
	},
	active: {
		type: Boolean,
		default: true
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
