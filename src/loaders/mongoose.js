const mongoose = require('mongoose');

// Connect to DB
const mongooseLoader = async () => {
	mongoose.connect(
		process.env.ATLAS_URI, // Environment variable connection string
		{ useNewUrlParser: true, useUnifiedTopology: true },
		() => {
			console.log('Connected to mongoDB');
		},
	);
};

module.exports = mongooseLoader;
