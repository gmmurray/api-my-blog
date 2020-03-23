const Multer = require('multer');

const multer = () => {
	return Multer({
		storage: Multer.memoryStorage(),
		limits: {
			fileSize: 5 * 1024 * 1024,
		},
    });
};

module.exports = multer;