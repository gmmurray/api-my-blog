const express = require('express');
const loaders = require('./loaders');
require('dotenv').config();
const cors = require('cors');

const startServer = async () => {
	const app = express();

	await loaders({expressApp: app});

	app.listen(process.env.PORT, err => {
		if (err) {
			console.log(err);
			return;
		}
		console.log('Server is listening...');
	});
}

startServer();