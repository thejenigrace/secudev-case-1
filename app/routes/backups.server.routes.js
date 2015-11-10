'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var backups = require('../../app/controllers/backups.server.controller');

	// Backups Routes
	app.route('/backups')
		.get(users.requiresLogin, users.isAdmin, backups.list)
		.post(users.requiresLogin, users.isAdmin, backups.create);

	app.route('/backups/download/:filename')
		.get(users.requiresLogin, users.isAdmin, backups.download);

	app.route('/backups/:backupId')
		.get(users.requiresLogin, users.isAdmin, backups.read)
		.put(users.requiresLogin, users.isAdmin, backups.hasAuthorization, backups.update)
		.delete(users.requiresLogin, users.isAdmin, backups.hasAuthorization, backups.delete);

	app.route('/backups/:backupName')
		.post(users.requiresLogin, users.isAdmin, backups.download);

	// Finish by binding the Backup middleware
	app.param('backupId', backups.backupByID);
	//app.param('backupName', backups.backupByName);
};
