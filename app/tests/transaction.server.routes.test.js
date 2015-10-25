'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Transaction = mongoose.model('Transaction'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, transaction;

/**
 * Transaction routes tests
 */
describe('Transaction CRUD tests', function() {
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

		// Save a user to the test db and create new Transaction
		user.save(function() {
			transaction = {
				name: 'Transaction Name'
			};

			done();
		});
	});

	it('should be able to save Transaction instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Transaction
				agent.post('/transactions')
					.send(transaction)
					.expect(200)
					.end(function(transactionSaveErr, transactionSaveRes) {
						// Handle Transaction save error
						if (transactionSaveErr) done(transactionSaveErr);

						// Get a list of Transactions
						agent.get('/transactions')
							.end(function(transactionsGetErr, transactionsGetRes) {
								// Handle Transaction save error
								if (transactionsGetErr) done(transactionsGetErr);

								// Get Transactions list
								var transactions = transactionsGetRes.body;

								// Set assertions
								(transactions[0].user._id).should.equal(userId);
								(transactions[0].name).should.match('Transaction Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Transaction instance if not logged in', function(done) {
		agent.post('/transactions')
			.send(transaction)
			.expect(401)
			.end(function(transactionSaveErr, transactionSaveRes) {
				// Call the assertion callback
				done(transactionSaveErr);
			});
	});

	it('should not be able to save Transaction instance if no name is provided', function(done) {
		// Invalidate name field
		transaction.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Transaction
				agent.post('/transactions')
					.send(transaction)
					.expect(400)
					.end(function(transactionSaveErr, transactionSaveRes) {
						// Set message assertion
						(transactionSaveRes.body.message).should.match('Please fill Transaction name');
						
						// Handle Transaction save error
						done(transactionSaveErr);
					});
			});
	});

	it('should be able to update Transaction instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Transaction
				agent.post('/transactions')
					.send(transaction)
					.expect(200)
					.end(function(transactionSaveErr, transactionSaveRes) {
						// Handle Transaction save error
						if (transactionSaveErr) done(transactionSaveErr);

						// Update Transaction name
						transaction.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Transaction
						agent.put('/transactions/' + transactionSaveRes.body._id)
							.send(transaction)
							.expect(200)
							.end(function(transactionUpdateErr, transactionUpdateRes) {
								// Handle Transaction update error
								if (transactionUpdateErr) done(transactionUpdateErr);

								// Set assertions
								(transactionUpdateRes.body._id).should.equal(transactionSaveRes.body._id);
								(transactionUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Transactions if not signed in', function(done) {
		// Create new Transaction model instance
		var transactionObj = new Transaction(transaction);

		// Save the Transaction
		transactionObj.save(function() {
			// Request Transactions
			request(app).get('/transactions')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Transaction if not signed in', function(done) {
		// Create new Transaction model instance
		var transactionObj = new Transaction(transaction);

		// Save the Transaction
		transactionObj.save(function() {
			request(app).get('/transactions/' + transactionObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', transaction.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Transaction instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Transaction
				agent.post('/transactions')
					.send(transaction)
					.expect(200)
					.end(function(transactionSaveErr, transactionSaveRes) {
						// Handle Transaction save error
						if (transactionSaveErr) done(transactionSaveErr);

						// Delete existing Transaction
						agent.delete('/transactions/' + transactionSaveRes.body._id)
							.send(transaction)
							.expect(200)
							.end(function(transactionDeleteErr, transactionDeleteRes) {
								// Handle Transaction error error
								if (transactionDeleteErr) done(transactionDeleteErr);

								// Set assertions
								(transactionDeleteRes.body._id).should.equal(transactionSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Transaction instance if not signed in', function(done) {
		// Set Transaction user 
		transaction.user = user;

		// Create new Transaction model instance
		var transactionObj = new Transaction(transaction);

		// Save the Transaction
		transactionObj.save(function() {
			// Try deleting Transaction
			request(app).delete('/transactions/' + transactionObj._id)
			.expect(401)
			.end(function(transactionDeleteErr, transactionDeleteRes) {
				// Set message assertion
				(transactionDeleteRes.body.message).should.match('User is not logged in');

				// Handle Transaction error error
				done(transactionDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Transaction.remove().exec();
		done();
	});
});