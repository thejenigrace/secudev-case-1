'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var admin_users = require('../../app/controllers/admin/admin.users.server.controller');

	// Admins Users Routes
	app.route('/admin/users')
		.get(users.requiresLogin, admin_users.isAdmin, admin_users.list);
	app.route('/admin/users/:uid')
		.get(users.requiresLogin, admin_users.isAdmin, admin_users.userByID, admin_users.read)
		.put(users.requiresLogin, admin_users.isAdmin, admin_users.update)
		.delete(users.requiresLogin, admin_users.isAdmin, admin_users.delete);

	app.route('authorization').get(users.hasAuthorization);

	app.route('/register').post(admin_users.register);
	/*
	app.route('/admins/:adminId')
		.get(admin.read)
		.put(users.requiresLogin, admin.hasAuthorization, admin.update)
		.delete(users.requiresLogin, admin.hasAuthorization, admin.delete);
	*/
	// Finish by binding the Admin middleware
	app.param('uid', admin_users.userByID);


};
