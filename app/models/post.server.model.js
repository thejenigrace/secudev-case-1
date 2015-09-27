'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	searchPlugin = require('mongoose-search-plugin'),
	mongoosePaginate = require('mongoose-paginate'),
	Schema = mongoose.Schema;

/**
 * Post Schema
 */
var PostSchema = new Schema({
	displayName: {
		type: String,
		trim: true
	},
	message: {
		type: String,
		default: '',
		required: 'Message cannot be blank',
		trim: true
	},
	updated: {
		type: Date,
		default: Date.now
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

//PostSchema.plugin(searchPlugin, {
//	fields: ['message', 'created', 'user']
//});

PostSchema.plugin(mongoosePaginate, {});

mongoose.model('Post', PostSchema);
