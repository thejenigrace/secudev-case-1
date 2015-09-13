'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var posts = require('../../app/controllers/posts.server.controller');

	// Posts Routes
	app.route('/posts')
		.get(posts.list)
		.post(users.requiresLogin, posts.create);

	app.route('/posts/:postId')
		.get(posts.read)
		.put(users.requiresLogin, posts.hasAuthorization, posts.update)
		.delete(users.requiresLogin, posts.hasAuthorization, posts.delete);

	app.route('/posts/count')
		.get(posts.getCount);

	app.route('/posts/paginate/')
		.get(posts.paginate);

	app.route('/posts/page/:pageNo')
		.get(posts.limitedList);

	// Finish by binding the Post middleware
	app.param('postId', posts.postByID);
};
