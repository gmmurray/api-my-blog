const router = require('express').Router();
const ObjectId = require('mongoose').Types.ObjectId;

const {
	uploadImagePromise,
	deleteImage,
} = require('../../services/googleCloud');
const multer = require('../../services/multer');

// tester to delete pictures from google
router.get('/deletepic', async (req, res) => {
	const error = await deleteImage('stick-walking.png');
	error ? res.status(400).json(error) : res.status(204);
});

const BlogPost = require('../../models/BlogPost');
const {
	postValidation,
	putValidation,
	patchValidation,
} = require('./validation');

// GET api/blog-post/
// Gets all blog posts
router.get('/', (req, res) => {
	BlogPost.find(req.query)
		.then(blogPosts => res.json({ blogPosts: blogPosts }))
		.catch(err => res.status(400).json({ error: err }));
});

// GET api/blog-post/author/id
// Gets all blog posts by given author id
router.get('/author/:id', (req, res) => {
	BlogPost.find({ 'author.id': ObjectId(req.params.id) })
		.then(blogPosts => res.json({ blogPosts: blogPosts }))
		.catch(err => res.status(400).json({ error: err }));
});

// GET api/blog-posts/id
// Get blog post by given blog post id
router.get('/:id', (req, res) => {
	BlogPost.findById(req.params.id)
		.then(blogPost => {
			if (blogPost) res.json(blogPost);
			else res.status(404).json('Resource not found.');
		})
		.catch(err => res.status(400).json({ error: err }));
});

// POST api/blog-posts/id
// Create blog post
router.post(
	'/',
	multer().single('file'),
	postValidation,
	async (req, res, next) => {
		const imageUrl = await uploadImagePromise(req.file, next);

		const newBlogPost = new BlogPost({
			title: req.body.title,
			intro: req.body.intro,
			content: req.body.content,
			image: {
				url: imageUrl,
				description: req.body.image.description,
				alt: req.body.image.alt,
				filename: req.file.originalname,
			},
			author: {
				// TODO: change to get from JWT
				id: '5e77a5b67e90e82bdc1f2ff5',
				name: 'John Johnson',
				avatar:
					'https://www.elegantthemes.com/blog/wp-content/uploads/2017/01/shutterstock_534491617-600.jpg',
			},
			category: req.body.category,
			published: req.body.published,
		});

		newBlogPost
			.save()
			.then(() => res.status(201).json({ id: newBlogPost._id }))
			.catch(err => res.status(400).json(err));
	},
);

// DELETE api/blog-posts/id
// Delete blog post by given id
router.delete('/:id', (req, res) => {
	BlogPost.findByIdAndDelete(req.params.id)
		.then(() => res.status(204).json('Resource deleted.'))
		.catch(err => res.status(400).json(err));
});

// PUT api/blog-posts/id
// Update multiple fields on blog post by given id
router.put('/:id', multer().single('file'), putValidation, (req, res, next) => {
	BlogPost.findById(req.params.id)
		.then(async blogPost => {
			if (blogPost) {
				blogPost.title = req.body.title;
				blogPost.intro = req.body.intro;
				blogPost.content = req.body.content;
				blogPost.image.description = req.body.image.description;
				blogPost.image.alt = req.body.image.alt;
				blogPost.category = req.body.category;
				blogPost.published = req.body.published;
				blogPost.dateCreated = Date.parse(req.body.dateCreated);
				blogPost.datePublished = Date.parse(req.body.datePublished);
				blogPost.lastModified = Date.now();

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
					.catch(err => res.status(400).json(err));
				return;
			} else {
				const newBlogPost = new BlogPost({
					title: req.body.title,
					intro: req.body.intro,
					content: req.body.content,
					image: {
						url: await uploadImagePromise(req.file, next),
						description: req.body.image.description,
						alt: req.body.image.alt,
						filename: req.file.originalname,
					},
					author: {
						// TODO: change to get from JWT
						id: '5e77a5b67e90e82bdc1f2ff5',
						name: 'John Johnson',
						avatar:
							'https://www.elegantthemes.com/blog/wp-content/uploads/2017/01/shutterstock_534491617-600.jpg',
					},
					category: req.body.category,
					published: req.body.published,
					dateCreated: Date.parse(req.body.dateCreated),
					datePublished: Date.parse(req.body.datePublished),
					lastModified: Date.now(),
				});
				newBlogPost
					.save()
					.then(() => {
						res.status(201).json({ id: newBlogPost._id });
					})
					.catch(err => res.status(400).json(err));
			}
		})
		.catch(err => res.status(400).json(err));
});

router.patch(
	'/:id',
	multer().single('file'),
	patchValidation,
	(req, res, next) => {
		BlogPost.findById(req.params.id)
			.then(async blogPost => {
				if (blogPost) {
					for (let key in req.body) {
						if (key in blogPost) {
							switch (key) {
								case 'author':
								case '_id':
									break;
								case 'image': {
									for (let nested in req.body[key]) {
										if (
											nested === 'url' ||
											nested === 'filename'
										) {
											break;
										} else {
											blogPost[key][nested] =
												req.body[key][nested];
										}
									}
									break;
								}
								default:
									blogPost[key] = req.body[key];
									break;
							}
						}
					}

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
							res.status(200).send(blogPost);
						})
						.catch(err => res.status(400).json(err));
				} else {
					res.status(404).json({
						error: 'Resource could not found.',
					});
				}
			})
			.catch(err => res.status(400).json(err));
	},
);

module.exports = router;
