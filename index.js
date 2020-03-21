const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

// Connect to DB
mongoose.connect(
	process.env.ATLAS_URI, // Environment variable connection string
	{ useNewUrlParser: true, useUnifiedTopology: true },
	() => {
		console.log('Connected to mongoDB');
	},
);

// Enable CORS
app.use(cors());

// JSON middleware
app.use(express.json());

// Import routes
//const authRoute = require('./routes/auth');

// Route middleware
//app.use('/api/auth', authRoute);

const port = process.env.PORT || 5000;
app.listen(port || 5000, () => {
	console.log(`Server is listening on port ${port}`);
});
