const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		max: 255,
	},
	email: {
		type: String,
		required: true,
		max: 255,
	},
	username: {
		type: String,
		required: true,
		max: 255,
	},
	password: {
		type: String,
		required: true,
		max: 1024,
	},
	avatar: {
		type: String,
		default: '',
	},
	lastLogin: {
		type: Date,
		default: Date.now,
    },
    bio: {
        type: String,
        max: 160,
    },
});

module.exports = mongoose.model('User', userSchema);
