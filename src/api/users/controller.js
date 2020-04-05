const router = require('express').Router();

const User = require('../../models/User');
const { formatMongooseError } = require('../../services/errorResponses');
const { postValidation, patchValidation } = require('./validation');
const { patchUser, handleUserAvatarDeletion } = require('./service');
const multer = require('../../services/multer');
const { hashPassword } = require('../../services/passwords');

// GET api/users/id
// Gets a specific user by their id
router.get('/:id', (req, res) => {
	User.findById(req.params.id)
		.then((user) => {
			if (user) {
				const { _id, name, email, avatar, lastLogin, bio } = user;
				res.status(200).json({
					user: {
						_id,
						name,
						email,
						avatar,
						lastLogin,
						bio,
					},
				});
			} else res.status(404).json('Resource not found');
		})
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// GET api/users
// Gets all users and returns less sensitive data
router.get('/', (req, res) => {
	User.find({}, 'avatar _id name email bio lastLogin')
		.then((users) => res.status(200).json({ users }))
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// POST api/users
// Creates a new user without bio and avatar image
router.post('/', postValidation, async (req, res) => {
	// Unique email?
	if (await User.findOne({ email: req.body.email })) {
		return res.status(400).json({ error: 'Email already in use' });
	}

	const hashedPassword = await hashPassword(req.body.password, 10);

	const newUser = new User({
		...req.body,
		password: hashedPassword,
	});

	newUser
		.save()
		.then(() => res.status(201).json({ id: newUser._id }))
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

// PATCH api/users/id
// Update properties of a user by given id
router.patch(
	'/:id',
	multer().single('file'),
	patchValidation,
	async (req, res, next) => {
		// Unique email?
		if (req.body.email) {
			const emailError = false;
			User.findOne({ email: req.body.email }, (err, foundUser) => {
				if (foundUser && foundUser._id.toString() !== req.params.id) {
					res.status(400).json({ error: 'Email already in use' });
					emailError = true;
				}
			});
			if (emailError) return;
		}

		User.findById(req.params.id)
			.then(async (user) => {
				if (user) {
					const result = await patchUser(req, next, user);

					if (result === false) {
						res.status(400).json({ error: 'Error deleting file.' });
						return;
					}

					user.save()
						.then(() => {
							res.status(200).json({ user });
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

// DELETE api/users/id
// Deletes a user and their corresponding avatar image
router.delete('/:id', (req, res) => {
	User.findById(req.params.id)
		.then(async (user) => {
			const result = await handleUserAvatarDeletion(user);

			if (result === false) {
				res.status(400).json({ error: 'Error deleting file.' });
				return;
			}

			User.findByIdAndDelete(req.params.id)
				.then(() => res.status(204).send())
				.catch((err) => res.status(400).json(formatMongooseError(err)));
		})
		.catch((err) => res.status(400).json(formatMongooseError(err)));
});

module.exports = router;
