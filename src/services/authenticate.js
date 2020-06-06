const jwt = require('jsonwebtoken');
const tokenSecret = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (authHeader) {
		const token = authHeader.split(' ')[1];

		jwt.verify(token, tokenSecret, (err, user) => {
			if (err) return res.status(403).json({ error: err });

			req.user = user;
			next();
		});
	} else {
		res.status(401).json({ error: 'Unauthorized' });
	}
};

module.exports = {
	authenticateToken,
};
