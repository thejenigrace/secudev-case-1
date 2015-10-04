'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	sanitizeHTML = require('sanitize-html'),
	Post = mongoose.model('Post'),
	_ = require('lodash');

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



