'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	crypto = require('crypto');

//var calculateAge = function calculateAge(birthday) { // birthday is a date
//	try {
//		//var bday;
//		//if (birthday.isString()) {
//		//	bday = Date.parse(birthdate);
//		//	console.log('bday is string');
//		//} else if (birthday.isDate()) {
//		//	bday = birthday;
//		//	console.log('bday is date');
//		//}
//		var ageDifMs = Date.now() - birthdate.getTime();
//		var ageDate = new Date(ageDifMs); // miliseconds from epoch
//		return Math.abs(ageDate.getUTCFullYear() - 1970);
//	} catch (e) {
//		console.log('Something went wrong!');
//		return 0;
//	}
//};

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

var validateLocalStrategyBirthdate = function (birthdate) {
	return (this.provider !== 'local' || (calculateAge(birthdate) >= 18));
};

var validateLocalStrategyGender = function (gender) {
	console.log('Gender = ' + gender);
	return (this.provider !== 'local' || (gender === 'Male' || gender === 'Female'));
};

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

//var validateLocalStrategySalutation = function(salutation) {
//	return (this.provider !== 'local' ||
//	( getGender === 'Male' && (salutation === 'Mr'|| salutation === 'Sir' || salutation === 'Senior' || salutation === 'Count')
//	) || ( getGender === 'Female' && (salutation === 'Miss'|| salutation === 'Ms' || salutation === 'Mrs' || salutation === 'Madame' ||
//	salutation === 'Majesty'|| salutation === 'Seniora')));
//};

var isDateOrEmpty = function(birthdate) {
	if (birthdate === null)
		return true;
	else
		return ('object' === typeof birthdate);
};

var birthdateValidation = [
	{validator: validateLocalStrategyBirthdate, msg: 'Must be 18 years old or above'},
	{validator: isDateOrEmpty, msg: 'Birthdate must be Date type'}
];


/**
 * User Schema
 */
var UserSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your first name'],
		match: [/^([a-zA-Z]+\s)*[a-zA-Z]+$/, 'First Name: No special characters or numbers']
	},
	lastName: {
		type: String,
		trim: true,
		validate: [validateLocalStrategyProperty, 'Please fill in your last name'],
		match: [/^([a-zA-Z]+\s)*[a-zA-Z]+$/, 'Last Name: No special characters or numbers']
	},
	displayName: {
		type: String,
		trim: true
	},
	gender: {
		type: String,
		validate: [validateLocalStrategyGender, 'Gender must only be male or female'],
		required: 'Please indicate your gender'
	},
	salutation: {
		type: String,
		validate: [validateLocalStrategySalutation, 'Invalid salutation'],
		required: 'Please indicate your salutation'
	},
	birthdate: {
		type: Date,
		//validate: [validateLocalStrategyBirthdate, 'Must be 18 years old or above'],
		validate: birthdateValidation,
		required: 'Please indicate your birthdate'
	},
	aboutMe: {
		type: String,
		required: 'Please fill-up about me section'
	},
	username: {
		type: String,
		unique: 'testing error message',
		required: 'Please fill in a username',
		trim: true,
		match: [/^([a-zA-Z0-9\_]+)*[a-zA-Z0-9\_]+$/, 'Username: Alphanumeric and underscore characters only']
	},
	password: {
		type: String,
		validate: [validateLocalStrategyPassword, 'Password should be longer'],
		match: [/^\S+$/, 'Password: No spaces allowed']
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
