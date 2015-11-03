'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Item = mongoose.model('Item'),
	Cart = mongoose.model('Cart'),
	Donation = mongoose.model('Donation'),
	User = mongoose.model('User'),
	fs = require('fs'),
	_ = require('lodash');

exports.paypalIpnHandler = function(req, res) {
	console.log(req.body);
	if(req.body.item_number === 'bonjour_donation_05' || req.body.item_number === 'bonjour_donation_10' || req.body.item_number === 'bonjour_donation_20') {
		if(req.body.payment_status === 'Completed') {
			console.log('Donation $' + req.body.payment_gross);

			User.find({_id: req.body.custom}).exec(function(err, users) {
				if(err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					var donation = new Donation();
					var donationAmount = req.body.payment_gross;
					donation.amount = donationAmount;
					donation.user = users[0];

					donation.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							console.log('---Donation Transaction Completed---');
						}
					});
				}
			});
		}
	} else {
		console.log(req.body);
		res.status(200).send({
			message: 'invalid checkout Paypal IPN'
		});
	}
};

exports.upload = function(req, res) {
	console.log('Upload Image');
	console.log(req.files.file.name);
	console.log(req.files.file.buffer);

	var user = req.user;

	if(user.roles.indexOf('admin') === 0) {
		console.log('Start Uploading');
		fs.writeFile('public/modules/items/img/image' + req.files.file.name, req.files.file.buffer, function(err) {
			if(err) {
				return res.status(400).send({
					message: 'Error occurred while uploading image'
				});
			} else {
				res.send({
					filename: req.files.file.name
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};

exports.donateCreate = function(req, res) {
	var donation = new Donation();
	donation.amount = req.body.amount;
	donation.user = req.user;

	donation.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//res.jsonp(item);
			console.log('---Donation Transaction Created---');
		}
	});
};

exports.donateUpdate = function(req, res) {
	Donation.find({user: req.user._id, status: 'ongoing'}).exec(function(err, donations){
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var donation = donations[0];
			donation.status = req.body.status;

			donation.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					//res.jsonp(item);
					console.log('---Donation Transaction Updated---');
				}
			});
		}
	});
};

/**
 * Create a Item
 */
exports.create = function(req, res) {
	var item = new Item(req.body);

	item.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(item);
		}
	});
};

/**
 * Show the current Item
 */
exports.read = function(req, res) {
	res.jsonp(req.item);
};

/**
 * Update a Item
 */
exports.update = function(req, res) {
	var item = req.item ;

	item = _.extend(item , req.body);

	item.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('---Updated Item---');

			var origId = JSON.stringify(item._id).replace(/\"/g, '');
			console.log('OrigId = '  + origId);
			Cart.find({active: true}).exec(function(err, carts) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					console.log(carts);

					for(var i = 0; i < carts.length; i++) {
						var cart = carts[i];
						for(var j = 0; j < cart.items.length; j++) {
							var dupId = JSON.stringify(cart.items[j]._id).replace(/\"/g, '');
							console.log('DupId = ' + dupId);
							if(origId === dupId) {
								console.log('Gonna Update Item in this Cart!');

								cart.items[j].name = item.name;
								cart.items[j].price = item.price;

								cart.save(function(err) {
									if (err) {
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										console.log('---UPDATED CART ITEM---');
									}
								});
							}
						}
					}
				}
			});

			res.jsonp(item);
		}
	});
};

/**
 * Delete an Item
 */
exports.delete = function(req, res) {
	var item = req.item ;

	item.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('---Delete Item---');

			var origId = JSON.stringify(item._id).replace(/\"/g, '');
			console.log('OrigId = '  + origId);
			Cart.find({active: true}).exec(function(err, carts) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					console.log(carts);

					for (var i = 0; i < carts.length; i++) {
						var cart = carts[i];
						for (var j = 0; j < cart.items.length; j++) {
							var dupId = JSON.stringify(cart.items[j]._id).replace(/\"/g, '');
							console.log('DupId = ' + dupId);
							if (origId === dupId) {
								console.log('Gonna Delete Item in this Cart!');

								cart.items.splice(j, 1);

								cart.save(function (err) {
									if (err) {
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										console.log('---UPDATED CART ITEM---');
									}
								});
							}
						}
					}
				}
			});
			res.jsonp(item);
		}
	});
};

/**
 * List of Items
 */
exports.list = function(req, res) {
	Item.find().sort('-created').populate('user', 'displayName').exec(function(err, items) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(items);
		}
	});
};

/**
 * Item middleware
 */
exports.itemByID = function(req, res, next, id) {
	Item.findById(id).populate('user', 'displayName').exec(function(err, item) {
		if (err) return next(err);
		if (! item) return next(new Error('Failed to load Item ' + id));
		req.item = item ;
		next();
	});
};

/**
 * Item authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.item.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
