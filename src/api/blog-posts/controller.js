const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;

const {
	uploadImagePromise,
	deleteImage,
} = require('../../services/googleCloud');

const multer = require('../../services/multer');
const BlogPost = require('../../models/BlogPost');

const {
	postValidation,
	putValidation,
	patchValidation,
} = require('./validation');

const {
	postBlogPost,
	putUpdateBlogPost,
	putNewBlogPost,
	mapBlogPostKeys,
} = require('./service');

const { formatMongooseError } = require('../../services/errorResponses');

// GET api/blog-post/
// Gets all blog posts with query string
router.get('/', (req, res) => {
	BlogPost.find(req.query)
		.then((blogPosts) => res.json({ blogPosts: blogPosts }))
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// GET api/blog-post/author/id
// Gets all blog posts by given author id
router.get('/author/:id', (req, res) => {
	BlogPost.find({ 'author.id': ObjectId(req.params.id) })
		.then((blogPosts) => res.json({ blogPosts: blogPosts }))
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// GET api/blog-posts/id
// Get blog post by given blog post id
router.get('/:id', (req, res) => {
	BlogPost.findById(req.params.id)
		.then((blogPost) => {
			if (blogPost) res.json(blogPost);
			else res.status(404).json('Resource not found.');
		})
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// POST api/blog-posts/id
// Create blog post
router.post(
	'/',
	multer().single('file'),
	postValidation,
	async (req, res, next) => {
		const imageUrl = await uploadImagePromise(req.file, next);

		const newBlogPost = postBlogPost(req.body, req.file, imageUrl);

		newBlogPost
			.save()
			.then(() => res.status(201).json({ id: newBlogPost._id }))
			.catch((err) => res.status(400).json(formatMongooseError(err)));
	},
);

// DELETE api/blog-posts/id
// Delete blog post by given id
router.delete('/:id', (req, res) => {
	BlogPost.findById(req.params.id)
		.then(async (blogPost) => {
			const error = await deleteImage(blogPost.image.filename);

			// If there was an error deleting, don't do anything else
			if (error && error.errors[0].reason !== 'notFound') {
				res.status(400).json(error);
				return;
			}

			BlogPost.findByIdAndDelete(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => res.status(400).json(formatMongooseError(err)));
		})
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// PUT api/blog-posts/id
// Update multiple fields on blog post by given id
router.put('/:id', multer().single('file'), putValidation, (req, res, next) => {
	BlogPost.findById(req.params.id)
		.then(async (blogPost) => {
			if (blogPost) {
				// Assign variables to document
				putUpdateBlogPost(blogPost, req.body);

				// Check if file exists to be uploaded
				if (req.file) {
					const imageUrl = await uploadImagePromise(req.file, next);

					// Delete old image from bucket
					const error = await deleteImage(blogPost.image.filename);

					// If there was an error deleting, don't do anything else
					if (error && error.errors[0].reason !== 'notFound') {
						res.status(400).json(error);
						return;
					}

					// Set new url and file name
					blogPost.image.url = imageUrl;
					blogPost.image.filename = req.file.originalname;
				}

				blogPost
					.save()
					.then(() => {
						res.status(204).send();
					})
					.catch((err) =>
						res.status(400).json(formatMongooseError(err)),
					);
				return;
			} else {
				if (!req.file) {
					res.status(400).json({
						error: 'New blog post resource requires an image',
					});
					return;
				}

				const newBlogPost = await putNewBlogPost(
					req.body,
					req.file,
					next,
				);

				newBlogPost
					.save()
					.then(() => {
						res.status(201).json({ id: newBlogPost._id });
					})
					.catch((err) =>
						res.status(400).json(formatMongooseError(err)),
					);
			}
		})
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// PATCH api/blog-posts/id
// Update single or multiple properties of blog post by id.
router.patch(
	'/:id',
	multer().single('file'),
	patchValidation,
	(req, res, next) => {
		BlogPost.findById(req.params.id)
			.then(async (blogPost) => {
				if (blogPost) {
					mapBlogPostKeys(req.body, blogPost);

					// Handle file upload
					// Check if file exists to be uploaded
					if (req.file) {
						const imageUrl = await uploadImagePromise(
							req.file,
							next,
						);

						// Delete old image from bucket
						const error = await deleteImage(
							blogPost.image.filename,
						);

						// If there was an error deleting, don't do anything else
						if (error && error.errors[0].reason !== 'notFound') {
							res.status(400).json(error);
							return;
						}

						// Set new url and file name
						blogPost.image.url = imageUrl;
						blogPost.image.filename = req.file.originalname;
					}

					blogPost
						.save()
						.then(() => {
							res.status(200).json(blogPost);
						})
						.catch((err) =>
							res.status(400).json(formatMongooseError(err)),
						);
				} else {
					res.status(404).json({
						error: 'Resource could not found.',
					});
				}
			})
			.catch((err) => res.status(400).json(formatMongooseError(err)));
	},
);

module.exports = router;
