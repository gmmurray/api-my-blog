const jwt = require('jsonwebtoken');
const tokenTypes = require('../constants/tokenTypes');
const accessTokenSecret = process.env.ACCESS_JWT_SECRET;
const refreshTokenSecret = process.env.REFRESH_JWT_SECRET;

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, accessTokenSecret, err => {
			if (err) return res.status(403).json({ error: err });

			next();
		});
	} else {
		res.status(401).json({ error: 'Unauthorized access' });
	}
};

const authenticateRefreshToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, refreshTokenSecret, (err, user) => {
			if (err) return res.status(403).json({ error: err });

			req.user = user;
			next();
		});
	} else {
		res.status(401).json({ error: 'Unauthorized access' });
	}
};

const getNewToken = (type, fields, expiresIn) => {
	if (type === tokenTypes.ACCESS) {
		return jwt.sign(fields, accessTokenSecret, { expiresIn });
	} else if (type === tokenTypes.REFRESH) {
		return jwt.sign(fields, refreshTokenSecret, { expiresIn });
	} else {
		throw 'Error creating new token';
	}
};

module.exports = {
	authenticateToken,
	authenticateRefreshToken,
	getNewToken,
};
