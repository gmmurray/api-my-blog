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
			text: Joi.string().max(10000),
		},
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}

	if (req.body.content.image && !req.file) {
		res.status(400).json({
			error: 'Image content indicated but no file uploaded',
		});
		return;
	}

	if (req.file && req.fileTypeError) {
		res.status(400).json({ error: req.fileTypeError });
		return;
	}

	next();
};

// Put validation
const putValidation = async (req, res, next) => {
	const schema = Joi.object({
		title: Joi.string().required(),
		section: Joi.string()
			.max(16)
			.required(),
		content: {
			image: Joi.boolean().required(),
			text: Joi.string().max(10000),
		},
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}

	if (req.body.content.image == 'true') {
		if (!req.body.content.text && !req.file) {
			res.status(400).json({
				error:
					'Image content indicated but no file uploaded and no image url provided.',
			});
			return;
		}
	}

	if (req.file && req.fileTypeError) {
		res.status(400).json({ error: req.fileTypeError });
		return;
	}

	next();
};

const patchValidation = async (req, res, next) => {
	const schema = Joi.object({
		title: Joi.string(),
		section: Joi.string()
			.max(16),
		content: {
			image: Joi.boolean(),
			text: Joi.string().max(10000),
		},
	});

	try {
		await schema.validateAsync(req.body);
	} catch (error) {
		res.status(400).json(formatMiddlewareValidation(error));
		return;
	}

	if (req.body.content.image == 'true' && !req.file) {
		res.status(400).json({error: 'Image content change indicated but no file uploaded'});
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
	putValidation,
	patchValidation,
};
