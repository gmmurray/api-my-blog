const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const { postValidation } = require('./validation');
const { formatMongooseError } = require('../../services/errorResponses');
const {
	authenticateRefreshToken,
	getNewToken,
} = require('../../services/authenticate');
const tokenTypes = require('../../constants/tokenTypes');

// POST api/auth/login
// Log a user in, returning a 30m access token and a 1d refresh token.
router.post('/login', postValidation, (req, res) => {
	const { email, password } = req.body;
	User.findOne({ email })
		.then(async user => {
			if (user && (await bcrypt.compare(password, user.password))) {
				let accessToken, refreshToken;
				try {
					accessToken = getNewToken(
						tokenTypes.ACCESS,
						{ email: user.email, name: user.name },
						'30m',
					);
					refreshToken = getNewToken(
						tokenTypes.REFRESH,
						{ email: user.email, name: user.name },
						'1d',
					);
				} catch (error) {
					return res.status(400).json({ error });
				}

				res.status(201).json({
					accessToken,
					refreshToken,
				});
			} else
				res.status(400).json({ error: 'Could not authenticate user' });
		})
		.catch(err => res.status(400).json(formatMongooseError(err)));
});

// POST api/auth/token
// Use a refresh token from header to get a new 30m access token
router.post('/token', authenticateRefreshToken, (req, res) => {
	let accessToken;
	try {
		accessToken = getNewToken(
			tokenTypes.ACCESS,
			{ email: req.user.email, name: req.user.name },
			'30m',
		);
	} catch (error) {
		return res.status(400).json({ error });
	}

	res.status(201).json({
		accessToken,
	});
});

module.exports = router;
