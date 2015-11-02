'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller.js'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	sanitizeMongo = require('mongo-sanitize'),
	User = mongoose.model('User'),
	Post = mongoose.model('Post'),
	Cart = mongoose.model('Cart'),
	Donation = mongoose.model('Donation'),
	Transaction = mongoose.model('Transaction');


exports.findUserProfile = function(req, res) {
	var id = sanitizeMongo(req.body.id);
	User.find({_id: id}).exec(function(err, users) {
		if(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log(users[0]);
			res.jsonp(users[0]);
		}
	});
};

exports.computeBadge = function(req, res) {
	var id = sanitizeMongo(req.body.id);
	Post.count({user: id}, function (err, postCount) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('Post Count: ' + postCount);

			var collection = {
				badges: [],
				level: []
			};

			if(3 <= postCount && 5 > postCount) {
				collection.badges.push('Participant Badge');
				collection.level.push('p1');
			} else if(5 <= postCount && 10 > postCount) {
				collection.badges.push('Chatter Badge');
				collection.level.push('p2');
			} else if(10 <= postCount) {
				collection.badges.push('Socialite Badge');
				collection.level.push('p3');
			}

			Donation.find({user: id, status: 'donated'}).exec(function (err, donations) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					var donationAmount = 0;
					for(var i = 0; i < donations.length; i++) {
						donationAmount += donations[i].amount;
					}
					console.log('Donation Amount: ' + donationAmount);

					if(5 <= donationAmount && 20 > donationAmount) {
						collection.badges.push('Supporter Badge');
						collection.level.push('d1');
					} else if(20 <= donationAmount && 100 > donationAmount) {
						collection.badges.push('Contributor Badge');
						collection.level.push('d2');
					} else if(100 <= donationAmount) {
						collection.badges.push('Pilar Badge');
						collection.level.push('d3');
					}

					Transaction.find({user: id, status: 'paid'}).exec(function (err, transactions) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							var storePurchase = 0;
							for(var i = 0; i < transactions.length; i++) {
								storePurchase += transactions[i].total;
							}
							console.log('Store Purchase = ' + storePurchase);

							if(5 <= storePurchase && 20 > storePurchase) {
								collection.badges.push('Shopper Badge');
								collection.level.push('s1');
							} else if(20 <= storePurchase && 100 > storePurchase) {
								collection.badges.push('Promoter Badge');
								collection.level.push('s2');
							} else if(100 <= storePurchase) {
								collection.badges.push('Elite Badge');
								collection.level.push('s3');
							}
						}

						if (collection.level.indexOf('p3') >= 0 && collection.level.indexOf('d3') >= 0 && collection.level.indexOf('s3') >= 0) {
							collection.badges.push('Evangelist Badge');
							//collection.badges.push('Backer Badge');
							//collection.badges.push('Explorer Badge');
							collection.level.push('b3');
							//collection.level.push('b2');
							//collection.level.push('b1');
						} else if(collection.level.indexOf('d2') >= 0 && collection.level.indexOf('s2') >= 0) {
							collection.badges.push('Backer Badge');
							//collection.badges.push('Explorer Badge');
							collection.level.push('b2');
							//collection.level.push('b1');
						} else if(collection.level.indexOf('p1') >= 0 && collection.level.indexOf('d1') >= 0 && collection.level.indexOf('s1') >= 0) {
							collection.badges.push('Explorer Badge');
							collection.level.push('b1');
						}

						console.log(collection.badges);
						res.jsonp({badges: collection.badges});
					});
				}
			});
		}
	});
};


/**
 * Update user details
 */
exports.update = function(req, res) {
	var displayName = req.body.displayName;
	console.log(displayName);
	delete req.body.displayName;

	//var tempId = JSON.stringify(displayName._id).replace(/\"/g,"");
	//var authId = JSON.stringify(req.user._id).replace(/\"/g, "");

	var currentUser = req.user.firstName + ' ' + req.user.lastName;

	if (displayName !== currentUser) {
		return res.status(400).send({
			message: 'Logged in as another user. Please refresh the page.'
		});
	}

	// Init Variables
	var user = req.user;
	var message = null;

	// For security measurement we remove the roles from the req.body object
	delete req.body.roles;

	if (user) {
		// Merge existing user
		user = _.extend(user, req.body);
		user.updated = Date.now();
		user.displayName = user.firstName + ' ' + user.lastName;

		user.save(function(err) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				req.login(user, function(err) {
					if (err) {
						res.status(400).send(err);
					} else {
						res.json(user);
					}
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

/**
 * Send User
 */
exports.me = function(req, res) {
	res.json(req.user || null);
};
