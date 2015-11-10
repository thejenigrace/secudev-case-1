'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	paypal = require('paypal-rest-sdk'),
	Cart = mongoose.model('Cart'),
	Donation = mongoose.model('Donation'),
	Item = mongoose.model('Item'),
	Transaction = mongoose.model('Transaction'),
	_ = require('lodash');

exports.paypalWebhook = function (req, res) {
	var params = req.body;
	console.log(params);
};

exports.checkout = function (req, res) {
	paypal.configure({
		'host': 'api.sandbox.paypal.com',
		'port': '',
		'client_id': 'AbLENHhZiLd8PtcQezz7rdBZYxGmmISrkzZ_5t6aYu-5nJZVvre_fo9D588n2XPeQnTHu7_6uqEBl1ze',
		'client_secret': 'EBgpl2OLekLkBlqWZwc2VSaT4NNvFoZ8EjAhU8GLV7tXFmpEGH_oUzN4i00rV-zQ7nqQqrw8y5q9o5Tl'
	});

	Cart.findOne({user: req.user._id, active: true}, function(err, cart) {
		if(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('---CHECKOUT---');
			Transaction.find({user: req.user._id, status: 'notpaid'}).exec(function(err, transactions){
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					if(transactions.length > 0) {
						console.log('---TRANSACTION ALREADY EXIST---');
						var original = transactions[0];
						if(original.total !== cart.total) {
							original.total = cart.total;
							original.save(function(err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									console.log('---TRANSACTION ALREADY EXIST:UPDATE TOTAL---');
								}
							});
						}
					} else {
						var transaction = new Transaction();
						transaction.cart = cart;
						transaction.status = 'notpaid';
						transaction.total = cart.total;
						transaction.user = req.user;

						transaction.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								//res.jsonp(transaction);
								console.log('---NEW TRANSACTION CREATED---');
							}
						});
					}
				}
			});

			var itemsDescription = '';
			for(var i = 0; i < cart.items.length; i++) {
				itemsDescription = itemsDescription.concat('[USD ' + cart.items[i].price + ' - ' + cart.items[i].name +  ' - ' + cart.items[i].quantity  + '] ');
			}

			//console.log(itemsDescription);

			var paypalPayment = {
				'intent': 'sale',
				'payer': {
					'payment_method': 'paypal'
				},
				'redirect_urls': {},
				'transactions': [{
					'amount': {
						'currency': 'USD'
					}
				}]
			};

			//console.log(config);
			paypalPayment.transactions[0].amount.total = cart.total;
			paypalPayment.redirect_urls.return_url = 'https://104.131.37.55/#!/cart/checkout/complete/transaction/' + cart._id;
			paypalPayment.redirect_urls.cancel_url = 'https://104.131.37.55/#!/cart/checkout/cancel/transaction/' + cart._id;
			//paypalPayment.redirect_urls.return_url = 'http://localhost:3000/#!/cart/checkout/complete/transaction/' + cart._id;
			//paypalPayment.redirect_urls.cancel_url = 'http://localhost:3000/#!/cart/checkout/cancel/transaction/' + cart._id;
			paypalPayment.transactions[0].description = itemsDescription;
			paypal.payment.create(paypalPayment, {}, function (err, resp) {
				//if (err) {
				//	res.render('order_detail', { message: [{desc: 'Payment API call failed', type: 'error'}]});
				//}

				if (resp) {
					var link = resp.links;
					for (var i = 0; i < link.length; i++) {
						if (link[i].rel === 'approval_url') {
							res.send(link[i].href);
						}
					}

					Transaction.findOne({user: req.user._id, cart: cart._id, status: 'notpaid'}, function (err, transaction) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							console.log(transaction);

							transaction.paymentId = resp.id;
							transaction.save(function(err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									console.log('---PAYMENTID SAVED IN TRANSACTION---');
								}
							});
						}
					});
				}
			});
		}
	});
};

exports.completeTransaction = function(req, res) {
	var payer = {
		payer_id: req.body.PayerID
	};

	// Closing of paypal.payment.execute()
	Transaction.findOne({paymentId: req.body.paymentId}, function (err, transaction) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log(transaction);

			paypal.payment.execute(req.body.paymentId, payer, {}, function (err, response) {
				if (err) return res.status(400).send({ message: 'An error occured while executing your transaction' });

				res.send({ message: 'Successfully performed payment' });


				transaction.status = 'paid';
				transaction.save(function(err) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						console.log('---PAID TRANSACTION---');
					}
				});


				Cart.findOne({user: req.user._id, active: true}, function(err, cart) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						console.log(cart);

						for(var i = 0; i < cart.items.length; i++) {
							console.log('cart.items[i].donation: ' + cart.items[i].donation);
							if(cart.items[i].donation === true) {
								var donation = new Donation();
								donation.amount = cart.items[i].price * cart.items[i].quantity;
								donation.user = req.user;
								donation.save(function(err) {
									if (err) {
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										console.log('---PAID DONATION TRANSACTION---');
									}
								});
							}
						}

						cart.active = false;
						cart.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								console.log('---CHANGING ACTIVE USER CART---');
								var newCart = new Cart();
								newCart.user = req.user;

								newCart.save(function(err) {
									if (err) {
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										console.log('---NEW USER CART---');
									}
								});
							}
						});
					}
				});
			});
		}
	});
};

exports.cancelTransaction = function(req, res) {
	Cart.findOne({user: req.user._id, active: true}, function(err, cart) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			Transaction.findOne({user: req.user._id, cart: cart._id, status: 'notpaid'}, function (err, transaction) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					console.log(transaction);

					if(transaction !== null) {
						transaction.status = 'cancelled';
						transaction.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								//res.jsonp(transaction);
								console.log('---CANCELLED TRANSACTION---');
							}
						});

						cart.active = false;
						cart.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								//res.jsonp(transaction);
								console.log('---CHANGING ACTIVE USER CART---');
								var newCart = new Cart();
								newCart.user = req.user;

								newCart.save(function(err) {
									if (err) {
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										//res.jsonp(transaction);
										console.log('---NEW USER CART---');
									}
								});
							}
						});
					} else {
						return res.status(400).send({
							message: 'NO TRANSACTION'
						});
					}
				}
			});
		}
	});
};

/**
 * Create a Cart
 */
exports.create = function(req, res) {
	var cart = new Cart(req.body);
	cart.user = req.user;

	cart.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			//Transaction.find({user: req.user._id, status: 'notpaid'}).exec(function(err, transaction){
			//	if (err) {
			//		return res.status(400).send({
			//			message: errorHandler.getErrorMessage(err)
			//		});
			//	} else {
			//		var updateTransaction = transaction[0];
			//		updateTransaction.basket.push(cart);
            //
			//		updateTransaction.save(function(err) {
			//			if (err) {
			//				return res.status(400).send({
			//					message: errorHandler.getErrorMessage(err)
			//				});
			//			} else {
            //
			//			}
			//		});
			//	}
			//});

			res.jsonp(cart);
		}
	});
};


/**
 * Show the current Cart
 */
exports.read = function(req, res) {
	res.jsonp(req.cart);
};

exports.addItem = function(req, res) {
	Cart.find({user: req.user._id, active: true}).exec(function(err, carts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('---ADD ITEM TO CART---');
			console.log(carts[0]);
			console.log(req.body.item);
			var cart = carts[0];
			var item = {
				_id: req.body.item._id,
				name: req.body.item.name,
				price: req.body.item.price,
				image: req.body.item.image,
				donation: req.body.item.donation,
				quantity: 1
			};
			cart.items.push(item);
			//cart.quantity.push(1);

			cart.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					//res.jsonp(cart);
					 console.log('---UPDATED CART ITEMS---');
				}
			});
		}
	});
};

exports.removeItem = function(req, res) {
	Cart.find({user: req.user._id, active: true}).exec(function (err, carts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var cart = carts[0];
			var item = req.body.item;
			var itemId = JSON.stringify(item._id).replace(/\"/g, '');
			var itemIndex = 0;
			for(var i = 0; i < cart.items.length; i++) {
				var cItemId = JSON.stringify(cart.items[i]._id).replace(/\"/g, '');
				if(cItemId === itemId) {
					console.log('Found Item To Remove!');
					itemIndex = i;
				}
			}
			console.log('Index to Remove = ' + itemIndex);

			cart.items.splice(itemIndex, 1);

			cart.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					//res.jsonp(cart);
					console.log('---REMOVE CART ITEM---');
				}
			});
		}
	});
};

exports.updateItem = function(req, res) {
	Cart.find({user: req.user._id, active: true}).exec(function (err, carts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var cart = carts[0];
			var item = req.body.item;
			var itemId = JSON.stringify(item._id).replace(/\"/g, '');
			for(var i = 0; i < cart.items.length; i++) {
				var cItemId = JSON.stringify(cart.items[i]._id).replace(/\"/g, '');
				if(cItemId === itemId) {
					console.log('Found Item To Update!');
					cart.items[i].quantity = req.body.quantity;
				}
			}

			cart.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					//res.jsonp(cart);
					console.log('---UPDATE CART ITEM QUANTITY---');
				}
			});
		}
	});
};

exports.computeTotalAmount = function(req, res) {
	Cart.find({user: req.user._id, active: true}).exec(function(err, carts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var cart = carts[0];
			var totalAmount = 0;
			for(var i = 0; i < cart.items.length; i++) {
				totalAmount += cart.items[i].price * cart.items[i].quantity;
			}
			cart.total = totalAmount;

			cart.save(function(err) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					//res.jsonp(cart);
					console.log('---UPDATED CART\'S TOTAL AMOUNT---');
					res.jsonp(totalAmount);
				}
			});
		}
	});
};

/**
 * Update a Cart
 */
exports.update = function(req, res) {
	var cart = req.cart ;

	cart = _.extend(cart , req.body);

	cart.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(cart);
		}
	});
};

/**
 * Delete an Cart
 */
exports.delete = function(req, res) {
	var cart = req.cart ;

	cart.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(cart);
		}
	});
};

/**
 * List of Carts
 */
exports.list = function(req, res) {
	Cart.find({user: req.user._id, active: true}).sort('-items.name').populate('items', 'name price image').exec(function(err, carts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log(carts[0]);

			if(carts[0].items.length === 0)
				console.log('EMPTY CART');

			res.jsonp(carts[0]);
		}
	});
};

/**
 * Cart middleware
 */
exports.cartByID = function(req, res, next, id) {
	Cart.findById(id).populate('user', 'displayName').exec(function(err, cart) {
		if (err) return next(err);
		if (! cart) return next(new Error('Failed to load Cart ' + id));
		req.cart = cart ;
		next();
	});
};

/**
 * Cart authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.cart.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
