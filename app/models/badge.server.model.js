/**
 * Created by Jennica on 25/10/15.
 */
'use strict';

/*
* Module dependencies.
*/
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/*
* Badge Schema
*/
var BadgeSchema = new Schema({
	name: {
		type: String
	},
	category: {
		type: [{
			type: String,
			enum: ['post', 'donation', 'storePurchase', 'badgeCollection']
		}],
	},
	postCount: {
		type: Number
	},
	donationCount: {
		type: Number
	},
	purchaseCount: {
		type: Number
	},
	badgeCount: {
		type: String
	},
	active: {
		type: Boolean,
		default: false
	}

});

mongoose.model('Badge', BadgeSchema);
