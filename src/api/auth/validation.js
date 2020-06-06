const Joi = require('@hapi/joi');
const { formatMiddlewareValidation } = require('../../services/errorResponses');

// Post validation
const postValidation = async (req, res, next) => {
	const schema = Joi.object({
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

module.exports = {
	postValidation,
};
