'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	validators = require('mongoose-validators'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

var calculateAge = function calculateAge(birthdate) {
	try {
		var date = new Date();
		var now = date.getTime();
		//console.log(now);

		var bday = Date.parse(birthdate);
		//console.log(bday);

		var a = (date - bday) / (1000 * 60 * 60 * 24 * 365);
		return Math.round(a * 100) / 100;
	}catch(e) {
		console.log('Birthdate is not Date type format');
		return 0;
	}
};

/**
 * A Validation function for local strategy properties
 */
var validateLocalStrategyProperty = function (property) {
	return ((this.provider !== 'local' && !this.updated) || property.length);
};

/**
 * A Validation function for local strategy password
 */
var validateLocalStrategyPassword = function (password) {
	return (this.provider !== 'local' || (password && password.length > 6));
};

/**
 * A Validation function for local strategy birthdate
 * @param birthdate
 * @returns {boolean}
 */
var validateLocalStrategyBirthdate = function (birthdate) {
	return (this.provider !== 'local' || (calculateAge(birthdate) >= 18));
};

/**
 * A Validation function for local strategy gender
 * @param gender
 * @returns {boolean}
 */
var validateLocalStrategyGender = function (gender) {
	console.log('Gender = ' + gender);
	return (this.provider !== 'local' || (gender === 'Male' || gender === 'Female'));
};

/**
 * A Validation function for local strategy salutation
 * @param salutation
 * @returns {boolean}
 */
var validateLocalStrategySalutation = function(salutation) {
	var sal = [
		['Mr', 'Sir', 'Senior', 'Count'],
		['Miss', 'Ms', 'Mrs', 'Madame', 'Majesty', 'Seniora']
	];

	return (this.provider !== 'local' ||
		(this.gender === 'Male' && (sal[0].indexOf(salutation) !== -1)) ||
		(this.gender === 'Female' && (sal[1].indexOf(salutation) !== -1))
	);
};

var isDateOrEmpty = function(birthdate) {
	if (birthdate === null)
		return true;
	else
		return ('object' === typeof birthdate);
};

var birthdateValidation = [
	{validator: validateLocalStrategyBirthdate, msg: 'Birthdate: must be 18 years old or above'},
	{validator: isDateOrEmpty, msg: 'Birthdate: must be Date type'}
];


/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your first name'],
		match: [/^([a-zA-Z]+\s)*[a-zA-Z]+$/, 'First Name: no special characters or numbers']
	},
	lastName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your last name'],
		match: [/^([a-zA-Z]+\s)*[a-zA-Z]+$/, 'Last Name: no special characters or numbers']
	},
	displayName: {
		type: String,
		trim: true
	},
	gender: {
		type: String,
		validate: [validateLocalStrategyGender, 'Gender: must only be male or female'],
		required: 'Please indicate your gender'
	},
	salutation: {
		type: String,
		validate: [validateLocalStrategySalutation, 'Salutation: invalid'],
		required: 'Please indicate your salutation'
	},
	birthdate: {
		type: Date,
		validate: birthdateValidation,
		required: 'Please indicate your birthdate'
	},
	aboutMe: {
		type: String,
		required: 'Please fill-up about me section',
		match: [/^([a-zA-Z0-9\s]+)*[a-zA-Z0-9\s]+$/, 'About Me: alphanumeric and spaces only']
	},
	username: {
		type: String,
		unique: 'Username already exists',
		required: 'Please fill in a username',
		trim: true,
		match: [/^([a-zA-Z0-9\_]+)*[a-zA-Z0-9\_]+$/, 'Username: alphanumeric and underscore characters only']
	},
	password: {
		type: String,
		validate: [validateLocalStrategyPassword, 'Password should be longer'],
		match: [/^\S+$/, 'Password: no spaces allowed']
	},
	salt: {
		type: String
	},
	provider: {
		type: String,
		required: 'Provider is required'
	},
	providerData: {},
	additionalProvidersData: {},
	roles: {
		type: [{
			type: String,
			enum: ['user', 'admin']
		}],
		default: ['user']
	},
	//badges: [
	//	{
	//		name: {type: String},
	//		category: {type: String},
	//		min: {type: Number},
	//		active: {type: Boolean}
	//	}
	//],
	updated: {
		type: Date
	},
	created: {
		type: Date,
		default: Date.now
	},
	/* For reset password */
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Date
	}
});

/**
 * Hook a pre save method to hash the password
 */
UserSchema.pre('save', function (next) {
	if (this.password && this.password.length > 6) {
		this.salt = crypto.randomBytes(16).toString('base64');
		this.password = this.hashPassword(this.password);
	}

	next();
});

/**
 * Create instance method for hashing a password
 */
UserSchema.methods.hashPassword = function (password) {
	if (this.salt && password) {
		return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64).toString('base64');
	} else {
		return password;
	}
};

/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function (password) {
	return this.password === this.hashPassword(password);
};

/**
 * Find possible not used username
 */
UserSchema.statics.findUniqueUsername = function (username, suffix, callback) {
	var _this = this;
	var possibleUsername = username + (suffix || '');

	_this.findOne({
		username: possibleUsername
	}, function (err, user) {
		if (!err) {
			if (!user) {
				callback(possibleUsername);
			} else {
				return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
			}
		} else {
			callback(null);
		}
	});
};

mongoose.model('User', UserSchema);
