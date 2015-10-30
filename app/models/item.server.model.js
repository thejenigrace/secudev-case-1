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
	price: {
		type: Number,
		min: 0,
		max: 10000,
		required: 'Please fill Item price'
	},
	description: {
		type: String,
		default: 'No item description'
	},
	image: {
		type: String
	},
	created: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('Item', ItemSchema);
