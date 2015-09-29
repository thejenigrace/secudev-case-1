'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Backup = mongoose.model('Backup'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, backup;

/**
 * Backup routes tests
 */
describe('Backup CRUD tests', function() {
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

		// Save a user to the test db and create new Backup
		user.save(function() {
			backup = {
				name: 'Backup Name'
			};

			done();
		});
	});

	it('should be able to save Backup instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Backup
				agent.post('/backups')
					.send(backup)
					.expect(200)
					.end(function(backupSaveErr, backupSaveRes) {
						// Handle Backup save error
						if (backupSaveErr) done(backupSaveErr);

						// Get a list of Backups
						agent.get('/backups')
							.end(function(backupsGetErr, backupsGetRes) {
								// Handle Backup save error
								if (backupsGetErr) done(backupsGetErr);

								// Get Backups list
								var backups = backupsGetRes.body;

								// Set assertions
								(backups[0].user._id).should.equal(userId);
								(backups[0].name).should.match('Backup Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Backup instance if not logged in', function(done) {
		agent.post('/backups')
			.send(backup)
			.expect(401)
			.end(function(backupSaveErr, backupSaveRes) {
				// Call the assertion callback
				done(backupSaveErr);
			});
	});

	it('should not be able to save Backup instance if no name is provided', function(done) {
		// Invalidate name field
		backup.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Backup
				agent.post('/backups')
					.send(backup)
					.expect(400)
					.end(function(backupSaveErr, backupSaveRes) {
						// Set message assertion
						(backupSaveRes.body.message).should.match('Please fill Backup name');
						
						// Handle Backup save error
						done(backupSaveErr);
					});
			});
	});

	it('should be able to update Backup instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Backup
				agent.post('/backups')
					.send(backup)
					.expect(200)
					.end(function(backupSaveErr, backupSaveRes) {
						// Handle Backup save error
						if (backupSaveErr) done(backupSaveErr);

						// Update Backup name
						backup.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Backup
						agent.put('/backups/' + backupSaveRes.body._id)
							.send(backup)
							.expect(200)
							.end(function(backupUpdateErr, backupUpdateRes) {
								// Handle Backup update error
								if (backupUpdateErr) done(backupUpdateErr);

								// Set assertions
								(backupUpdateRes.body._id).should.equal(backupSaveRes.body._id);
								(backupUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Backups if not signed in', function(done) {
		// Create new Backup model instance
		var backupObj = new Backup(backup);

		// Save the Backup
		backupObj.save(function() {
			// Request Backups
			request(app).get('/backups')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Backup if not signed in', function(done) {
		// Create new Backup model instance
		var backupObj = new Backup(backup);

		// Save the Backup
		backupObj.save(function() {
			request(app).get('/backups/' + backupObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', backup.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Backup instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Backup
				agent.post('/backups')
					.send(backup)
					.expect(200)
					.end(function(backupSaveErr, backupSaveRes) {
						// Handle Backup save error
						if (backupSaveErr) done(backupSaveErr);

						// Delete existing Backup
						agent.delete('/backups/' + backupSaveRes.body._id)
							.send(backup)
							.expect(200)
							.end(function(backupDeleteErr, backupDeleteRes) {
								// Handle Backup error error
								if (backupDeleteErr) done(backupDeleteErr);

								// Set assertions
								(backupDeleteRes.body._id).should.equal(backupSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Backup instance if not signed in', function(done) {
		// Set Backup user 
		backup.user = user;

		// Create new Backup model instance
		var backupObj = new Backup(backup);

		// Save the Backup
		backupObj.save(function() {
			// Try deleting Backup
			request(app).delete('/backups/' + backupObj._id)
			.expect(401)
			.end(function(backupDeleteErr, backupDeleteRes) {
				// Set message assertion
				(backupDeleteRes.body.message).should.match('User is not logged in');

				// Handle Backup error error
				done(backupDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Backup.remove().exec();
		done();
	});
});