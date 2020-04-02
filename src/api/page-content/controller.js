const router = require('express').Router();

const PageContent = require('../../models/PageContent');
const { postValidation } = require('./validation');
const { formatMongooseError } = require('../../services/errorResponses');
const multer = require('../../services/multer');
const { uploadImagePromise } = require('../../services/googleCloud');

router.get('/', (req, res) => {
	const query = req.query.id ? { _id: req.query.id } : req.query;
	PageContent.find(query)
		.then(content => res.json({ pageContent: content }))
		.catch(err => res.status(400).json(formatMongooseError(err)));
});

router.post(
	'/',
	multer().single('file'),
	postValidation,
	async (req, res, next) => {
		if (!req.body.content.image) {
			const newPageContent = new PageContent({
				...req.body,
			});

			newPageContent
				.save()
				.then(() => res.status(201).json({ id: newPageContent._id }))
				.catch(err => res.status(400).json(formatMongooseError(err)));
		} else {
			const imageUrl = await uploadImagePromise(req.file, next);
			const newPageContent = new PageContent({
				...req.body,
				content: {
					image: true,
					text: imageUrl,
				},
			});

			newPageContent
				.save()
				.then(() => res.status(201).json({ id: newPageContent._id }))
				.catch(err => res.status(400).json(formatMongooseError(err)));
		}
	},
);

router.put('');

module.exports = router;
