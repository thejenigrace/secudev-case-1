'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Backup Schema
 */
var BackupSchema = new Schema({
	name: {
		type: String,
		default: '',
		unique: 'Backup name must be unique',
		required: 'Please fill Backup name',
		match: [/^([a-zA-Z0-9]+)*[a-zA-Z0-9]+$/, 'Backup name must contain only alphanumeric characters.'],
		trim: true
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

mongoose.model('Backup', BackupSchema);
