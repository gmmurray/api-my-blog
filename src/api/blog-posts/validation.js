const Joi = require('@hapi/joi');
const {formatMiddlewareValidation} = require('../../services/errorResponses');

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
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}
	if (!req.file) {
		res.status(400).send({ error: 'No file uploaded' });
		return;
	}

	if (req.fileTypeError) {
		res.status(400).send({ error: req.fileTypeError });
		return;
	}
	next();
};

// Put validation
const putValidation = async (req, res, next) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		intro: Joi.string()
			.max(155)
			.required(),
		content: Joi.string()
			.max(10000)
			.required(),
		image: {
			url: Joi.string(),
			description: Joi.string().max(160),
			alt: Joi.string()
				.max(160)
				.required(),
			filename: Joi.string(),
		},
		category: Joi.string()
			.max(16)
			.required(),
		published: Joi.boolean().required(),
		dateCreated: Joi.date().required(),
		datePublished: Joi.date(),
		lastModified: Joi.date(),
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}

	if (req.fileTypeError) {
		res.status(400).send({ error: req.fileTypeError });
		return;
	}
	next();
};

// Patch validation
const patchValidation = async (req, res, next) => {
	const schema = Joi.object({
		title: Joi.string(),
		intro: Joi.string().max(155),
		content: Joi.string().max(10000),
		image: {
			description: Joi.string().max(160).allow(''),
			alt: Joi.string().max(160),
		},
		category: Joi.string().max(16),
		published: Joi.boolean(),
		dateCreated: Joi.date(),
		datePublished: Joi.date(),
		lastModified: Joi.date(),
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}

	if (req.fileTypeError) {
		res.status(400).send({ error: req.fileTypeError });
		return;
	}
	next();
};

module.exports.postValidation = postValidation;
module.exports.putValidation = putValidation;
module.exports.patchValidation = patchValidation;
