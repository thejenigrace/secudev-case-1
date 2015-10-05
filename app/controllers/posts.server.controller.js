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

/**
 * Create a Post
 */
exports.create = function (req, res) {
	var displayName = req.body.displayName;
	console.log(displayName);
	delete req.body.displayName;

	//var tempId = JSON.stringify(displayName._id).replace(/\"/g,"");
	//var authId = JSON.stringify(req.user._id).replace(/\"/g, "");

	var currentUser = req.user.firstName + ' ' + req.user.lastName;

	if (displayName !== currentUser) {
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

	//var banned = ['/auth/signout', 'auth/signout'];
    //
	//for (var i = 0; i < banned.length; i++) {
	//	if (post.message.toLowerCase().indexOf(banned[i]) >= 0) {
	//		return res.status(400).send({
	//			message: 'Banned URL'
	//		});
	//	}
	//}

	post.save(function (err) {
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
exports.read = function (req, res) {
	res.jsonp(req.post);
};

/**
 * Update a Post
 */
exports.update = function (req, res) {
	var post = req.post;

	post = _.extend(post, req.body);
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

	for (var i = 0; i < banned.length; i++) {
		if (post.message.toLowerCase().indexOf(banned[i]) >= 0) {
			return res.status(400).send({
				message: 'Banned URL'
			});
		}
	}

	post.save(function (err) {
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
exports.delete = function (req, res) {
	var post = req.post;

	post.remove(function (err) {
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
exports.list = function (req, res) {
	Post.find().sort('-created').populate('user', 'displayName firstName username created')
		.exec(function (err, posts) {
			if (err) {
				return res.status(400).send({
					message: errorHandler.getErrorMessage(err)
				});
			} else {
				console.log(posts);
				res.jsonp(posts);
			}
		}
	);
};

/**
 * Count number of All Post
 */
exports.count = function (req, res) {
	Post.count({}, function (err, count) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			console.log('Posts Count: ' + count);

			res.jsonp(count);
		}
	});
};


exports.limitedList = function (req, res) {
	var currentPage;
	var itemsPerPage = 10;

	if (!req.params.currentPage)
		currentPage = 1;
	else
		currentPage = req.params.currentPage;

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
			console.log(posts);

			res.jsonp(posts);
		})
		.catch(function (err) {

		});
};

/**
 * Post middleware
 */
exports.postByID = function (req, res, next, id) {
	Post.findById(id).populate('user', 'displayName firstName username created')
		.exec(function (err, post) {
			if (err)
				return next(err);
			if (!post)
				return next(new Error('Failed to load Post ' + id));
			req.post = post;
			next();
		}
	);
};

/**
 * Post authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
	if (req.post.user.id !== req.user.id && req.user.roles.indexOf('user') === 0) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

/**
 * Search a Post
 */
exports.search = function (req, res) {
	console.log(req.body);
	var currentPage;
	var itemsPerPage = 10;

	if (!req.body.currentPage)
		currentPage = 1;
	else
		currentPage = req.body.currentPage;

	var keyword = req.body.keyword;
	var type = req.body.type;
	var data = req.body.data;
	var concat = req.body.concat;

	var finaleQuery = {
		$and: [],
		$or: []
	};

	var userExecQuery = function (arrUser, arrUserDataIndex) {
		console.log(arrUser);
		User.find({username: {$in: arrUser}})
			.select({_id: 1})
			.exec(function (err, users) {
				if (err)
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				else {
					console.log(users);


					for (var j = 0; j < arrUserDataIndex.length; j++) {
						if (concat[arrUserDataIndex[j]] === 'and')
							finaleQuery.$and.push({user: users[j]._id});
						else if (concat[arrUserDataIndex[j]] === 'or')
							finaleQuery.$or.push({user: users[j]._id});
					}

					var date;
					var end;

					for (var i = 0; i < type.length; i++) {
						// KEYWORD
						if (i === 0 && concat[i] === 'and')
							finaleQuery.$and.push({message: new RegExp(keyword, 'i')});
						else if (i === 0 && concat[i] === 'or')
							finaleQuery.$or.push({message: new RegExp(keyword, 'i')});

						// ADVANCED SEARCH
						if (concat[i] === 'and') {
							if (type[i] === 'gte') {
								date = new Date(data[i]);
								console.log('DATE: ' + date.toLocaleString());
								finaleQuery.$and.push({created: {$gte: date}});
							} else if (type[i] === 'lte') {
								date = new Date(data[i]);
								date.setHours(date.getHours() + 24);
								console.log('DATE: ' + date.toLocaleString());
								finaleQuery.$and.push({created: {$lt: date}});
							} else if (type[i] === 'eq') {
								date = new Date(data[i]);
								end = new Date(data[i]);
								end.setHours(date.getHours() + 24);
								console.log('DATE: ' + date.toLocaleString());
								console.log('END: ' + end.toLocaleString());
								finaleQuery.$and.push({created: {$gte: date, $lt: end}});
							} else if (type[i] === 'between') {
								date = new Date(data[i].start);
								end = new Date(data[i].end);
								end.setHours(end.getHours() + 24);
								console.log('DATE: ' + date.toLocaleString());
								console.log('END: ' + end.toLocaleString());
								finaleQuery.$and.push({created: {$gte: date, $lt: end}});
							}
						} else if (concat[i] === 'or') {
							if (type[i] === 'gte') {
								date = new Date(data[i]);
								console.log('DATE: ' + date.toLocaleString());
								finaleQuery.$or.push({created: {$gte: date}});
							} else if (type[i] === 'lte') {
								date = new Date(data[i]);
								date.setHours(date.getHours() + 24);
								console.log('DATE: ' + date.toLocaleString());
								finaleQuery.$or.push({created: {$lt: date}});
							} else if (type[i] === 'eq') {
								date = new Date(data[i]);
								end = new Date(data[i]);
								end.setHours(date.getHours() + 24);
								console.log('DATE: ' + date.toLocaleString());
								console.log('END: ' + end.toLocaleString());
								finaleQuery.$or.push({created: {$gte: date, $lt: end}});
							} else if (type[i] === 'between') {
								date = new Date(data[i].start);
								end = new Date(data[i].end);
								end.setHours(date.getHours() + 24);
								console.log('DATE: ' + date.toLocaleString());
								console.log('END: ' + end.toLocaleString());
								finaleQuery.$or.push({created: {$gte: date, $lt: end}});
							}
						}
					}

					if (finaleQuery.$and.length === 0)
						delete  finaleQuery.$and;

					if (finaleQuery.$or.length === 0)
						delete finaleQuery.$or;

					console.log('finaleQuery = ' + JSON.stringify(finaleQuery));

					Post.paginate(finaleQuery, {
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
							console.log(posts);

							res.jsonp(posts);
						})
						.catch(function (err) {

						});
				}
			});
	};

	var normalExecQuery = function () {
		var date;
		var end;

		for (var i = 0; i < type.length; i++) {
			// KEYWORD
			if (i === 0 && concat[i] === 'and')
				finaleQuery.$and.push({message: new RegExp(keyword, 'i')});
			else if (i === 0 && concat[i] === 'or')
				finaleQuery.$or.push({message: new RegExp(keyword, 'i')});

			// ADVANCED SEARCH
			if (concat[i] === 'and') {
				if (type[i] === 'gte') {
					date = new Date(data[i]);
					console.log('DATE: ' + date.toLocaleString());
					finaleQuery.$and.push({created: {$gte: date}});
				} else if (type[i] === 'lte') {
					date = new Date(data[i]);
					date.setHours(date.getHours() + 24);
					console.log('DATE: ' + date.toLocaleString());
					finaleQuery.$and.push({created: {$lt: date}});
				} else if (type[i] === 'eq') {
					date = new Date(data[i]);
					end = new Date(data[i]);
					end.setHours(date.getHours() + 24);
					console.log('DATE: ' + date.toLocaleString());
					console.log('END: ' + end.toLocaleString());
					finaleQuery.$and.push({created: {$gte: date, $lt: end}});
				} else if (type[i] === 'between') {
					date = new Date(data[i].start);
					end = new Date(data[i].end);
					end.setHours(end.getHours() + 24);
					console.log('DATE: ' + date.toLocaleString());
					console.log('END: ' + end.toLocaleString());
					finaleQuery.$and.push({created: {$gte: date, $lt: end}});
				}
			} else if (concat[i] === 'or') {
				if (type[i] === 'gte') {
					date = new Date(data[i]);
					console.log('DATE: ' + date.toLocaleString());
					finaleQuery.$or.push({created: {$gte: date}});
				} else if (type[i] === 'lte') {
					date = new Date(data[i]);
					date.setHours(date.getHours() + 24);
					console.log('DATE: ' + date.toLocaleString());
					finaleQuery.$or.push({created: {$lt: date}});
				} else if (type[i] === 'eq') {
					date = new Date(data[i]);
					end = new Date(data[i]);
					end.setHours(date.getHours() + 24);
					console.log('DATE: ' + date.toLocaleString());
					console.log('END: ' + end.toLocaleString());
					finaleQuery.$or.push({created: {$gte: date, $lt: end}});
				} else if (type[i] === 'between') {
					date = new Date(data[i].start);
					end = new Date(data[i].end);
					end.setHours(date.getHours() + 24);
					console.log('DATE: ' + date.toLocaleString());
					console.log('END: ' + end.toLocaleString());
					finaleQuery.$or.push({created: {$gte: date, $lt: end}});
				}
			}
		}

		if (finaleQuery.$and.length === 0)
			delete  finaleQuery.$and;

		if (finaleQuery.$or.length === 0)
			delete finaleQuery.$or;

		console.log('finaleQuery = ' + JSON.stringify(finaleQuery));

		Post.paginate(finaleQuery, {
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
				console.log(posts);

				res.jsonp(posts);
			})
			.catch(function (err) {

			});

	};

		var basicExecQuery = function () {
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
				.spread(function (posts, pageCount, itemCount) {
					console.log(posts);

					res.jsonp(posts);
				})
				.catch(function (err) {

				});
		};

		var countTypeUser = function () {
			var count = 0;

			for (var i = 0; i < type.length; i++) {
				if (type[i] === 'user')
					count++;
			}

			return count;
		};

		var findTypeUserDataIndex = function () {
			var arrIndex = [];
			for (var i = 0; i < type.length; i++) {
				if (type[i] === 'user')
					arrIndex.push(i);
			}
			return arrIndex;
		};

		var findTypeUserData = function () {
			var arrData = [];
			console.log('length: ' + type.length);
			for (var i = 0; i < type.length; i++) {
				if (type[i] === 'user')
					arrData.push(data[i]);
			}
			return arrData;
		};

		// Execution
		if (countTypeUser() > 0 && type.length > 0) {
			userExecQuery(findTypeUserData(), findTypeUserDataIndex());
		} else if (countTypeUser() === 0 && type.length > 0) {
			normalExecQuery();
		} else if (countTypeUser() === 0 && type.length === 0) {
			basicExecQuery();
		}
	};


