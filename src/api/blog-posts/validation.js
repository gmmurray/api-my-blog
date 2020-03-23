const Joi = require('@hapi/joi');

// Post validation
const postValidation = async (req, res, next) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		intro: Joi.string()
			.max(155)
			.required(),
		content: Joi.string()
			.max(10000)
			.required(),
		image: {
			description: Joi.string().max(160),
			alt: Joi.string()
				.max(160)
				.required(),
		},
		category: Joi.string()
			.max(16)
			.required(),
		published: Joi.boolean().required(),
		dateCreated: Joi.date(),
		datePublished: Joi.date(),
		lastModified: Joi.date(),
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
        res.status(400).json({ error: error });
        return;
    }
    if (!req.file) {
		res.status(400).send({error: 'No file uploaded'});
		return;
    }
    next();
};

module.exports.postValidation = postValidation;
