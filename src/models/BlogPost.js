const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		max: 60,
	},
	intro: {
		type: String,
		required: true,
		max: 155,
	},
	content: {
		type: String,
		required: true,
		max: 10000,
	},
	image: {
		url: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			max: 160,
		},
		alt: {
			type: String,
			required: true,
			max: 160,
		},
		filename: {
			type: String,
			required: true,
		},
	},
	author: {
		id: {
			type: mongoose.ObjectId,
			required: true,
		},
		name: {
			type: String,
			required: true,
			max: 255,
		},
		avatar: {
			type: String,
			default: '',
		},
	},
	category: {
		type: String,
		required: true,
		max: 16,
	},
	published: {
		type: Boolean,
		required: true,
	},
	dateCreated: {
		type: Date,
		default: Date.now,
	},
	datePublished: {
		type: Date,
	},
	lastModified: {
		type: Date,
	},
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
