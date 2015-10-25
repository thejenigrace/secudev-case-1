'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Item = mongoose.model('Item'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, item;

/**
 * Item routes tests
 */
describe('Item CRUD tests', function() {
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

		// Save a user to the test db and create new Item
		user.save(function() {
			item = {
				name: 'Item Name'
			};

			done();
		});
	});

	it('should be able to save Item instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Item
				agent.post('/items')
					.send(item)
					.expect(200)
					.end(function(itemSaveErr, itemSaveRes) {
						// Handle Item save error
						if (itemSaveErr) done(itemSaveErr);

						// Get a list of Items
						agent.get('/items')
							.end(function(itemsGetErr, itemsGetRes) {
								// Handle Item save error
								if (itemsGetErr) done(itemsGetErr);

								// Get Items list
								var items = itemsGetRes.body;

								// Set assertions
								(items[0].user._id).should.equal(userId);
								(items[0].name).should.match('Item Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Item instance if not logged in', function(done) {
		agent.post('/items')
			.send(item)
			.expect(401)
			.end(function(itemSaveErr, itemSaveRes) {
				// Call the assertion callback
				done(itemSaveErr);
			});
	});

	it('should not be able to save Item instance if no name is provided', function(done) {
		// Invalidate name field
		item.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Item
				agent.post('/items')
					.send(item)
					.expect(400)
					.end(function(itemSaveErr, itemSaveRes) {
						// Set message assertion
						(itemSaveRes.body.message).should.match('Please fill Item name');
						
						// Handle Item save error
						done(itemSaveErr);
					});
			});
	});

	it('should be able to update Item instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Item
				agent.post('/items')
					.send(item)
					.expect(200)
					.end(function(itemSaveErr, itemSaveRes) {
						// Handle Item save error
						if (itemSaveErr) done(itemSaveErr);

						// Update Item name
						item.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Item
						agent.put('/items/' + itemSaveRes.body._id)
							.send(item)
							.expect(200)
							.end(function(itemUpdateErr, itemUpdateRes) {
								// Handle Item update error
								if (itemUpdateErr) done(itemUpdateErr);

								// Set assertions
								(itemUpdateRes.body._id).should.equal(itemSaveRes.body._id);
								(itemUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Items if not signed in', function(done) {
		// Create new Item model instance
		var itemObj = new Item(item);

		// Save the Item
		itemObj.save(function() {
			// Request Items
			request(app).get('/items')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Item if not signed in', function(done) {
		// Create new Item model instance
		var itemObj = new Item(item);

		// Save the Item
		itemObj.save(function() {
			request(app).get('/items/' + itemObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', item.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Item instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Item
				agent.post('/items')
					.send(item)
					.expect(200)
					.end(function(itemSaveErr, itemSaveRes) {
						// Handle Item save error
						if (itemSaveErr) done(itemSaveErr);

						// Delete existing Item
						agent.delete('/items/' + itemSaveRes.body._id)
							.send(item)
							.expect(200)
							.end(function(itemDeleteErr, itemDeleteRes) {
								// Handle Item error error
								if (itemDeleteErr) done(itemDeleteErr);

								// Set assertions
								(itemDeleteRes.body._id).should.equal(itemSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Item instance if not signed in', function(done) {
		// Set Item user 
		item.user = user;

		// Create new Item model instance
		var itemObj = new Item(item);

		// Save the Item
		itemObj.save(function() {
			// Try deleting Item
			request(app).delete('/items/' + itemObj._id)
			.expect(401)
			.end(function(itemDeleteErr, itemDeleteRes) {
				// Set message assertion
				(itemDeleteRes.body.message).should.match('User is not logged in');

				// Handle Item error error
				done(itemDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Item.remove().exec();
		done();
	});
});