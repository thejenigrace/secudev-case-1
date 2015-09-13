'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	mongoosePaginate = require('mongoose-paginate'),
	errorHandler = require('./errors.server.controller'),
	Post = mongoose.model('Post'),
	_ = require('lodash');

//mongoose.Promise = require('bluebird');

/**
 * Create a Post
 */
exports.create = function(req, res) {
	var post = new Post(req.body);
	post.user = req.user;

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
	if (req.post.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};


exports.getCount = function(req, res) {
	Post.count({}, function(err, count) {
		console.log('count is' + count);
		if(err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		}
		else {
			res.jsonp({'count': count});
		}
	});
};

//exports.paginate = function(req, res) {
//	Post.plugin(mongoosePaginate);
//
//	var page = 1;
//
//	if(!req.params.pageNo)
//		page = 1;
//	else
//		page = req.params.pageNo;
//
//	var per_page = 10;
//
//	Post.paginate({}, {
//			page: page,
//			limit: per_page,
//			populate: 'user',
//			sortBy: 'created'
//		})
//		.spread(function(questions, pageCount, itemCount) {
//			res.jsonp({count: itemCount});
//		})
//		.catch(function(err) {
//			//return next(err);
//		});
//
//};

exports.limitedList = function(req, res) {
	var page;

	if(!req.params.pageNo)
		page = 1;
	else
		page = req.params.pageNo;

	var per_page = 10;

	Post.find({ $query: {}, $orderBy: {updated: -1} })
		.skip((page - 1) * per_page)
		.limit(per_page)
		.populate('user', 'displayName firstName username created')
		.exec(function (err, posts) {
			if(err)
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			else
				res.json(posts);
		});
};


