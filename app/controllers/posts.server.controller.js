'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	sanitizeHTML = require('sanitize-html'),
	Post = mongoose.model('Post'),
	User = mongoose.model('User'),
	_ = require('lodash');

//mongoose.Promise = require('bluebird');

/**
 * Paginate All Posts
 */
exports.pagedList = function(req, res) {
	var currentPage;
	var itemsPerPage = 10;

	if(!req.body.currentPage)
		currentPage = 1;
	else
		currentPage = req.body.currentPage;

	if(!req.body.keyword && !req.body.userId) {
		Post.paginate({}, {
			page: currentPage,
			limit: itemsPerPage,
			populate: [
				{
					path: 'user',
					select: 'username displayName firstName created'
				}
			],
			sortBy: {
				created: -1
			}
		})
			.spread(function (posts, pageCount, itemCount) {
				//console.log(posts);

				res.jsonp({'posts': posts});
			})
			.catch(function (err) {

			});
	} else if(req.body.keyword || !req.body.userId) {
		var keyword = req.body.keyword;
		Post.paginate({message: new RegExp(keyword, 'i')}, {
			page: currentPage,
			limit: itemsPerPage,
			populate: [
				{
					path: 'user',
					select: 'username displayName firstName created'
				}
			],
			sortBy: {
				created: -1
			}
		})
			.spread(function(posts, pageCount, itemCount) {
				//console.log(posts);

				res.jsonp({'posts': posts});
			})
			.catch(function(err) {

			});
	} else if(req.body.userId) {

		Post.paginate({user: req.body.userId}, {
			page: currentPage,
			limit: itemsPerPage,
			populate: [
				{
					path: 'user',
					select: 'username displayName firstName created'
				}
			],
			sortBy: {
				created: -1
			}
		})
			.spread(function(posts, pageCount, itemCount) {
				//console.log(results);

				res.jsonp({'posts': posts});
			})
			.catch(function(err) {

			});
	}

	//Post.find({ $query: {}, $orderby: {created: -1} })
	//	.skip((currentPage - 1) * itemsPerPage)
	//	.limit(itemsPerPage)
	//	.exec(function (err, posts) {
	//		if(err)
	//			return res.status(400).send({
	//				message: errorHandler.getErrorMessage(err)
	//			});
	//		else
	//			console.log(posts);
	//	});
};

/**
 * Search a Post
 */
exports.search = function(req, res) {
	//var keyword = req.body.keyword;
	//console.log('keyword: ' + keyword);

	//Post.search(keyword, {message: 1}, {
	//	limit: 10
	//}, function(err, data) {
	//	// array of finded results
	//	console.log(data.results);
	//	// array of all matching objects
	//	console.log(data.totalCount);
	//});

	//Post.count({}, function(err, count) {
	//	if(err) {
	//		console.log(err);
	//	} else {
	//		console.log('Posts Count: ' + count);
	//		//res.jsonp(count);
	//	}
	//});

	//User.find({username: 'jason'})
	//	.select({_id: 1})
	//	.exec(function(err, users){
	//		if(err)
	//			return res.status(400).send({
	//				message: errorHandler.getErrorMessage(err)
	//			});
	//		else {
	//			console.log(users);
    //
	//			id = users;
	//		}
	//	});

	var keyword = JSON.stringify(req.body.keyword).replace(/\"/g, '');

	console.log('keyword: ' + keyword);

	Post.paginate({user: keyword}, {
		limit: 10,
		populate: [
			{
				path: 'user',
				select: 'username displayName firstName created'
			}
		],
		sortBy: {
			created: -1
		}
	})
		.spread(function(results, pageCount, itemCount) {
			console.log(results);
		})
		.catch(function(err) {

		});
};

/**
 * Count number of All Post
 */
exports.count = function(req, res) {
	Post.count({}, function(err, count) {
		if(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('Posts Count: ' + count);

			res.jsonp({'count': count});
		}
	});
};

/**
 * Create a Post
 */
exports.create = function(req, res) {
	var displayName = req.body.displayName;
	console.log(displayName);
	delete req.body.displayName;

	//var tempId = JSON.stringify(displayName._id).replace(/\"/g,"");
	//var authId = JSON.stringify(req.user._id).replace(/\"/g, "");

	var currentUser = req.user.firstName + ' ' + req.user.lastName;

	if(displayName !== currentUser) {
		return res.status(400).send({
			message: 'Logged in as another user. Please refresh the page.'
		});
	}

	var post = new Post(req.body);
	post.user = req.user;

	//var message = post.message;
	post.message = sanitizeHTML(post.message, {
		allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
			'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
			'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img'],
		allowedAttributes: {
			a: ['href', 'name', 'target'],
			// We don't currently allow img itself by default, but this
			// would make sense if we did
			img: ['src']
		},
		// Lots of these won't come up by default because we don't allow them
		selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
		// URL schemes we permit
		allowedSchemes: [],
		allowedSchemesByTag: {
			a: ['http', 'https'],
			img: ['data']
		}
	});

	var banned = ['/auth/signout', 'auth/signout'];

	for(var i = 0; i < banned.length; i++) {
		if(post.message.toLowerCase().indexOf(banned[i]) >= 0){
			return res.status(400).send({
				message: 'Banned URL'
			});
		}
	}

	post.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(post);
		}
	});
};

/**
 * Show the current Post
 */
exports.read = function(req, res) {
	res.jsonp(req.post);
};

/**
 * Update a Post
 */
exports.update = function(req, res) {
	var post = req.post ;

	post = _.extend(post , req.body);
	post.updated = Date.now();


	post.message = sanitizeHTML(post.message, {
		allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
			'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
			'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img'],
		allowedAttributes: {
			a: ['href', 'name', 'target'],
			// We don't currently allow img itself by default, but this
			// would make sense if we did
			img: ['src']
		},
		// Lots of these won't come up by default because we don't allow them
		selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
		// URL schemes we permit
		allowedSchemes: [],
		allowedSchemesByTag: {
			a: ['http', 'https'],
			img: ['data']
		}
	});

	var banned = ['/auth/signout', 'auth/signout'];

	for(var i = 0; i < banned.length; i++) {
		if(post.message.toLowerCase().indexOf(banned[i]) >= 0){
			return res.status(400).send({
				message: 'Banned URL'
			});
		}
	}

	post.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(post);
		}
	});
};

/**
 * Delete an Post
 */
exports.delete = function(req, res) {
	var post = req.post ;

	post.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(post);
		}
	});
};

/**
 * List of Posts
 */
exports.list = function(req, res) {
	Post.find().sort('-created').populate('user', 'displayName firstName username created')
		.exec(function(err, posts) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				res.jsonp(posts);
			}
		}
	);
};

/**
 * Post middleware
 */
exports.postByID = function(req, res, next, id) {
	Post.findById(id).populate('user', 'displayName firstName username created')
		.exec(function(err, post) {
			if (err)
				return next(err);
			if (! post)
				return next(new Error('Failed to load Post ' + id));
			req.post = post ;
			next();
		}
	);
};

/**
 * Post authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.post.user.id !== req.user.id && req.user.roles.indexOf('user') === 0) {
		return res.status(403).send('User is not authorized');
	}
	next();
};



