'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Item = mongoose.model('Item'),
	fs = require('fs'),

	_ = require('lodash');

exports.upload = function(req, res) {
	console.log('Upload Image');
	console.log(req.files.file.name);
	console.log(req.files.file.buffer);

	var user = req.user;

	//var upload = multer(config.uploads.profileUpload).single('newItemImage');
	//var profileUploadFileFilter = require(path.resolve('./config/lib/multer')).profileUploadFileFilter;
    //
	//// Filtering to upload only images
	//upload.fileFilter = profileUploadFileFilter;

	//if (user) {
	//	upload(req, res, function (uploadError) {
	//		if(uploadError) {
	//			return res.status(400).send({
	//				message: 'Error occurred while uploading profile picture'
	//			});
	//		} else {
	//			user.profileImageURL = config.uploads.profileUpload.dest + req.file.filename;
    //
	//			user.save(function (saveError) {
	//				if (saveError) {
	//					return res.status(400).send({
	//						message: errorHandler.getErrorMessage(saveError)
	//					});
	//				} else {
	//					req.login(user, function (err) {
	//						if (err) {
	//							res.status(400).send(err);
	//						} else {
	//							res.json(user);
	//						}
	//					});
	//				}
	//			});
	//		}
	//	});
	//} else {
	//	res.status(400).send({
	//		message: 'User is not signed in'
	//	});
	//}

	if(user.roles.indexOf('admin') === 0) {
		console.log('Start Uploading');
		fs.writeFile('public/modules/items/img/image' + req.files.file.name, req.files.file.buffer, function(err) {
			if(err) {
				return res.status(400).send({
					message: 'Error occurred while uploading image'
				});
			} else {
				res.send({
					filename: req.files.file.name
				});
			}
		});
	} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}
};
/**
 * Create a Item
 */
exports.create = function(req, res) {
	var item = new Item(req.body);

	item.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(item);
		}
	});
};

/**
 * Show the current Item
 */
exports.read = function(req, res) {
	res.jsonp(req.item);
};

/**
 * Update a Item
 */
exports.update = function(req, res) {
	var item = req.item ;

	item = _.extend(item , req.body);

	item.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(item);
		}
	});
};

/**
 * Delete an Item
 */
exports.delete = function(req, res) {
	var item = req.item ;

	item.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(item);
		}
	});
};

/**
 * List of Items
 */
exports.list = function(req, res) {
	Item.find().sort('-created').populate('user', 'displayName').exec(function(err, items) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(items);
		}
	});
};

/**
 * Item middleware
 */
exports.itemByID = function(req, res, next, id) {
	Item.findById(id).populate('user', 'displayName').exec(function(err, item) {
		if (err) return next(err);
		if (! item) return next(new Error('Failed to load Item ' + id));
		req.item = item ;
		next();
	});
};

/**
 * Item authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.item.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
