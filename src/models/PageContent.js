const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		max: 60,
	},
	section: {
		type: String,
		required: true,
		max: 16,
	},
	content: {
		image: {
			type: Boolean,
			required: true,
		},
		text: {
			type: String,
			required: true,
			max: 10000,
		},
	},
});

module.exports = mongoose.model('PageContent', pageContentSchema);
