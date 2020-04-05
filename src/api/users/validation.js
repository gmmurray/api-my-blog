const Joi = require('@hapi/joi');
const { formatMiddlewareValidation } = require('../../services/errorResponses');

// Post validation
const postValidation = async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string().max(255).required(),
		email: Joi.string().email().max(255).required(),
		password: Joi.string().max(1024).required(),
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}

	next();
};

// Patch validation
const patchValidation = async (req, res, next) => {
	const schema = Joi.object({
		name: Joi.string().max(255),
		email: Joi.string().email().max(255),
		password: Joi.string().max(1024),
		avatar: Joi.string().allow(''),
		bio: Joi.string().max(160),
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}

	if (req.file && req.fileTypeError) {
		res.status(400).json({ error: req.fileTypeError });
		return;
	}

	next();
};

module.exports = {
	postValidation,
	patchValidation,
};
