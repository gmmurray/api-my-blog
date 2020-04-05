const router = require('express').Router();

const PageContent = require('../../models/PageContent');
const {
	putUpdatePageContent,
	putNewPageContent,
	patchPageContent,
	handlePageContentImageDeletion,
} = require('./service');
const {
	postValidation,
	putValidation,
	patchValidation,
} = require('./validation');
const { formatMongooseError } = require('../../services/errorResponses');
const multer = require('../../services/multer');
const { uploadImagePromise } = require('../../services/googleCloud');

// GET api/page-content/
// Gets all page content, or page content that matches query
router.get('/', (req, res) => {
	const query = req.query.id ? { _id: req.query.id } : req.query;
	PageContent.find(query)
		.then((content) => res.json({ pageContent: content }))
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// GET api/page-content/id
// Get page content by given page content id
router.get('/:id', (req, res) => {
	PageContent.findById(req.params.id)
		.then((content) => {
			if (content) res.json({ pageContent: content });
			else res.status(404).json('Resource not found.');
		})
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// POST api/page-content
// Create page content
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
				.catch((err) => res.status(400).json(formatMongooseError(err)));
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
				.catch((err) => res.status(400).json(formatMongooseError(err)));
		}
	},
);

// PUT api/page-content/id
// Update multiple fields or create new page content
router.put(
	'/:id',
	multer().single('file'),
	putValidation,
	async (req, res, next) => {
		req.body.content.image = req.body.content.image == 'true'; // Parse JSON boolean
		const uploadingNewImage =
			req.body.content.image && req.file ? true : false;

		PageContent.findById(req.params.id).then(async (pageContent) => {
			if (pageContent) {
				const result = await putUpdatePageContent(
					pageContent,
					req,
					next,
					uploadingNewImage,
				);

				if (result === false) {
					res.status(400).json({ error: 'Error deleting file.' });
					return;
				}

				pageContent
					.save()
					.then(() => {
						res.status(204).send();
					})
					.catch((err) =>
						res.status(400).json(formatMongooseError(err)),
					);
				return;
			} else {
				const newPageContent = await putNewPageContent(req, next);

				newPageContent
					.save()
					.then(() => {
						res.status(201).json({ id: newPageContent._id });
					})
					.catch((err) =>
						res.status(400).json(formatMongooseError(err)),
					);
			}
		});
	},
);

// PATCH api/page-content/id
// Update as few as one field of page content
router.patch(
	'/:id',
	multer().single('file'),
	patchValidation,
	(req, res, next) => {
		req.body.content.image = req.body.content.image == 'true'; // Parse JSON boolean

		PageContent.findById(req.params.id)
			.then(async (pageContent) => {
				if (pageContent) {
					const result = await patchPageContent(
						req,
						next,
						pageContent,
					);

					if (result === false) {
						res.status(400).json({ error: 'Error deleting file.' });
						return;
					}

					pageContent
						.save()
						.then(() => {
							res.status(200).json(pageContent);
							return;
						})
						.catch((err) => {
							res.status(400).json(formatMongooseError(err));
							return;
						});
				} else {
					res.status(404).json({
						error: 'Resource could not be found',
					});
				}
			})
			.catch((err) => res.status(400).json(formatMongooseError(err)));
	},
);

// DELETE api/page-content/id
// Delete page content by given id
router.delete('/:id', (req, res) => {
	PageContent.findById(req.params.id)
		.then(async (pageContent) => {
			const result = await handlePageContentImageDeletion(pageContent);

			if (result === false) {
				res.status(400).json({ error: 'Error deleting file.' });
				return;
			}

			PageContent.findByIdAndDelete(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => res.status(400).json(formatMongooseError(err)));
		})
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

module.exports = router;
