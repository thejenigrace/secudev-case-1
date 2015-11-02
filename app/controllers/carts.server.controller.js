'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	paypal = require('paypal-rest-sdk'),
	Cart = mongoose.model('Cart'),
	Item = mongoose.model('Item'),
	Transaction = mongoose.model('Transaction'),
	_ = require('lodash');

exports.checkout = function (req, res) {
	paypal.configure({
		'host': 'api.sandbox.paypal.com',
		'port': '',
		'client_id': 'AbLENHhZiLd8PtcQezz7rdBZYxGmmISrkzZ_5t6aYu-5nJZVvre_fo9D588n2XPeQnTHu7_6uqEBl1ze',
		'client_secret': 'EBgpl2OLekLkBlqWZwc2VSaT4NNvFoZ8EjAhU8GLV7tXFmpEGH_oUzN4i00rV-zQ7nqQqrw8y5q9o5Tl'
	});

	Cart.find({user: req.user._id, active: true}).exec(function(err, carts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var cart = carts[0];
			console.log('---CHECKOUT---');
			console.log(cart.total);

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
					console.log('---TRANSACTION CREATED---');
				}
			});

			var itemsDescription = '';
			for(var i = 0; i < cart.items.length; i++) {
				itemsDescription = itemsDescription.concat('[PHP ' + cart.items[i].price + ' - ' + cart.items[i].name +  ' - ' + cart.items[i].quantity  + '] ');
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
			paypalPayment.redirect_urls.return_url = 'https://104.131.37.55/#!/cart/checkout/complete/transaction';
			paypalPayment.redirect_urls.cancel_url = 'https://104.131.37.55/#!';
			//paypalPayment.redirect_urls.return_url = 'http://192.168.1.105:3000/#!/cart/checkout/complete/transaction';
			//paypalPayment.redirect_urls.cancel_url = 'http://192.168.1.105:3000/#!';
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
				}
			});
		}
	});

	//var totalAmount = 1;
	//var description = 'apple';
};

exports.completeTransaction = function(req, res) {
	var payer = {
		payer_id: req.body.PayerID
	};

	// Closing of paypal.payment.execute()
	paypal.payment.execute(req.body.paymentId, payer, {}, function (err, response) {
		if (err) return res.status(400).send({ message: 'An error occured while executing your transaction' });

		res.send({ message: 'Successfully performed payment' });

		Cart.find({user: req.user._id, active: true}).exec(function(err, carts) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				var cart = carts[0];

				Transaction.find({user: req.user._id, cart: cart._id, status: 'notpaid'}).exec(function (err, transactions) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						var transaction = transactions[0];
						transaction.paymentId = req.body.paymentId;
						transaction.status = 'paid';

						transaction.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								//res.jsonp(transaction);
								console.log('---TRANSACTION UPDATED---');
							}
						});
					}
				});

				Cart.find({user: req.user._id, active: true}).exec(function(err, carts) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						var cart = carts[0];
						cart.active = false;
						cart.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								//res.jsonp(transaction);
								console.log('---Change Active User Cart Created---');
								var newCart = new Cart();
								newCart.user = req.user;

								newCart.save(function(err) {
									if (err) {
										return res.status(400).send({
											message: errorHandler.getErrorMessage(err)
										});
									} else {
										//res.jsonp(transaction);
										console.log('---New User Cart Created---');
									}
								});
							}
						});
					}
				});

			}
		});
	});
};

exports.cancelTransaction = function(req, res) {
	Cart.find({user: req.user._id, active: true}).exec(function(err, carts) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			var cart = carts[0];

			Transaction.find({user: req.user._id, cart: cart._id, status: 'notpaid'}).exec(function (err, transactions) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					var transaction = transactions[0];
					transaction.paymentId = req.body.paymentId;
					transaction.status = 'cancelled';

					transaction.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							//res.jsonp(transaction);
							console.log('---TRANSACTION UPDATED---');
						}
					});
				}
			});

			Cart.find({user: req.user._id, active: true}).exec(function(err, carts) {
				if (err) {
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					var cart = carts[0];
					cart.active = false;
					cart.save(function(err) {
						if (err) {
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
						} else {
							//res.jsonp(transaction);
							console.log('---Change Active User Cart Created---');
							var newCart = new Cart();
							newCart.user = req.user;

							newCart.save(function(err) {
								if (err) {
									return res.status(400).send({
										message: errorHandler.getErrorMessage(err)
									});
								} else {
									//res.jsonp(transaction);
									console.log('---New User Cart Created---');
								}
							});
						}
					});
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
					 console.log('---Updated Cart---');
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
					console.log('---Remove Item In Cart ---');
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
					console.log('---Update Quantity Item In Cart ---');
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
					console.log('--- Updated Cart\'s Total Amount ---');
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
				console.log('Empty Cart');

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
