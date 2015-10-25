'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Cart = mongoose.model('Cart'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, cart;

/**
 * Cart routes tests
 */
describe('Cart CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Cart
		user.save(function() {
			cart = {
				name: 'Cart Name'
			};

			done();
		});
	});

	it('should be able to save Cart instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Cart
				agent.post('/carts')
					.send(cart)
					.expect(200)
					.end(function(cartSaveErr, cartSaveRes) {
						// Handle Cart save error
						if (cartSaveErr) done(cartSaveErr);

						// Get a list of Carts
						agent.get('/carts')
							.end(function(cartsGetErr, cartsGetRes) {
								// Handle Cart save error
								if (cartsGetErr) done(cartsGetErr);

								// Get Carts list
								var carts = cartsGetRes.body;

								// Set assertions
								(carts[0].user._id).should.equal(userId);
								(carts[0].name).should.match('Cart Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Cart instance if not logged in', function(done) {
		agent.post('/carts')
			.send(cart)
			.expect(401)
			.end(function(cartSaveErr, cartSaveRes) {
				// Call the assertion callback
				done(cartSaveErr);
			});
	});

	it('should not be able to save Cart instance if no name is provided', function(done) {
		// Invalidate name field
		cart.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Cart
				agent.post('/carts')
					.send(cart)
					.expect(400)
					.end(function(cartSaveErr, cartSaveRes) {
						// Set message assertion
						(cartSaveRes.body.message).should.match('Please fill Cart name');
						
						// Handle Cart save error
						done(cartSaveErr);
					});
			});
	});

	it('should be able to update Cart instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Cart
				agent.post('/carts')
					.send(cart)
					.expect(200)
					.end(function(cartSaveErr, cartSaveRes) {
						// Handle Cart save error
						if (cartSaveErr) done(cartSaveErr);

						// Update Cart name
						cart.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Cart
						agent.put('/carts/' + cartSaveRes.body._id)
							.send(cart)
							.expect(200)
							.end(function(cartUpdateErr, cartUpdateRes) {
								// Handle Cart update error
								if (cartUpdateErr) done(cartUpdateErr);

								// Set assertions
								(cartUpdateRes.body._id).should.equal(cartSaveRes.body._id);
								(cartUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Carts if not signed in', function(done) {
		// Create new Cart model instance
		var cartObj = new Cart(cart);

		// Save the Cart
		cartObj.save(function() {
			// Request Carts
			request(app).get('/carts')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Cart if not signed in', function(done) {
		// Create new Cart model instance
		var cartObj = new Cart(cart);

		// Save the Cart
		cartObj.save(function() {
			request(app).get('/carts/' + cartObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', cart.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Cart instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Cart
				agent.post('/carts')
					.send(cart)
					.expect(200)
					.end(function(cartSaveErr, cartSaveRes) {
						// Handle Cart save error
						if (cartSaveErr) done(cartSaveErr);

						// Delete existing Cart
						agent.delete('/carts/' + cartSaveRes.body._id)
							.send(cart)
							.expect(200)
							.end(function(cartDeleteErr, cartDeleteRes) {
								// Handle Cart error error
								if (cartDeleteErr) done(cartDeleteErr);

								// Set assertions
								(cartDeleteRes.body._id).should.equal(cartSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Cart instance if not signed in', function(done) {
		// Set Cart user 
		cart.user = user;

		// Create new Cart model instance
		var cartObj = new Cart(cart);

		// Save the Cart
		cartObj.save(function() {
			// Try deleting Cart
			request(app).delete('/carts/' + cartObj._id)
			.expect(401)
			.end(function(cartDeleteErr, cartDeleteRes) {
				// Set message assertion
				(cartDeleteRes.body.message).should.match('User is not logged in');

				// Handle Cart error error
				done(cartDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Cart.remove().exec();
		done();
	});
});