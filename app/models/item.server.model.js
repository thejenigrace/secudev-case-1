'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Item Schema
 */
var ItemSchema = new Schema({
	name: {
		type: String,
		default: '',
		required: 'Please fill Item name',
		trim: true
	},
	description: {
		type: String,
		default: 'an item description'
	},
	image: {
		type: String,
		default: ''
	},
	price: {
		type: Number,
		min: 0,
		max: 10000
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

mongoose.model('Item', ItemSchema);
