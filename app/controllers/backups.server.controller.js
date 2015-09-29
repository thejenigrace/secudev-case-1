'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Backup = mongoose.model('Backup'),
	json2csvconverter = require('nestedjson2csv'),
	fs = require('fs'),
	Post = mongoose.model('Post'),
	_ = require('lodash');


/**
 * Download a Backup
 */
exports.download = function(req, res){
	var file = req + '.csv';
	res.download(file); // Set disposition and send it.
};

/**
 * Create a Backup
 */
exports.create = function(req, res) {
	var backup = new Backup(req.body);
	backup.user = req.user;

	backup.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			Post.find().sort('-created').populate('user', 'displayName')
				.exec(function(err, posts) {
					if (err) {
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						var fields = ['user.displayName', 'message', 'created'];
						json2csvconverter({ data: posts, fields: fields }, function(err, csv) {
							if (err) console.log(err);
							var filename = backup.name + '.csv';
							fs.writeFile(filename, csv, function(err) {
								if (err) throw err;
								console.log(filename + ' saved');
							});
						});

					}
				}
			);
		}
		res.jsonp(backup);
	});
};

/**
 * Show the current Backup
 */
exports.read = function(req, res) {
	//var file = req.backup.name + '.csv';
	//var file_url = __dirname + '\\' + file;
	//console.log('FILE URL: ' + file_url);
	//var stream = fs.createReadStream(file);
	//var csv = require('fast-csv');
	//var csvStream = csv()
	//	.on('data', function(data){
	//		console.log(data);
	//	})
	//	.on('end', function(){
	//		console.log('done');
	//	});
    //
	//stream.pipe(csvStream);

	//res.download(file_url); // Set disposition and send it.

	res.jsonp(req.backup);
};

/**
 * Update a Backup
 */
exports.update = function(req, res) {
	var backup = req.backup ;

	backup = _.extend(backup , req.body);

	backup.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(backup);
		}
	});
};

/**
 * Delete an Backup
 */
exports.delete = function(req, res) {
	var backup = req.backup ;

	backup.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(backup);
		}
	});
};

/**
 * List of Backups
 */
exports.list = function(req, res) {
	Backup.find().sort('-created').populate('user', 'displayName').exec(function(err, backups) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(backups);
		}
	});
};

/**
 * Backup middleware
 */
exports.backupByID = function(req, res, next, id) {
	Backup.findById(id).populate('user', 'displayName').exec(function(err, backup) {
		if (err) return next(err);
		if (! backup) return next(new Error('Failed to load Backup ' + id));
		req.backup = backup ;
		next();
	});
};

exports.backupByName = function(req, res, next, id) {
	Backup.findById(id).populate('user', 'displayName').exec(function(err, backup) {
		if (err) return next(err);
		if (! backup) return next(new Error('Failed to load Backup ' + id));
		req.backup = backup ;
		next();
	});
};

/**
 * Backup authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.backup.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
