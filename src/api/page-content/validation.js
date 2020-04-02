const Joi = require('@hapi/joi');
const { formatMiddlewareValidation } = require('../../services/errorResponses');

// Post validation
const postValidation = async (req, res, next) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		section: Joi.string()
			.max(16)
			.required(),
		content: {
			image: Joi.boolean().required(),
			text: Joi.string()
				.max(10000),
		},
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}

	if (req.file && req.fileTypeError) {
		res.status(400).send({ error: req.fileTypeError });
		return;
    }
    
	next();
};

module.exports = {
    postValidation,
}