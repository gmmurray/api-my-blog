const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');

const loaders = async ({ expressApp }) => {
	await mongooseLoader();
	await expressLoader({ app: expressApp });
};

module.exports = loaders;
