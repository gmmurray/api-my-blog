const Multer = require('multer');

const multer = () => {
	return Multer({
		storage: Multer.memoryStorage(),
		limits: {
			fileSize: 5 * 1024 * 1024,
		},
		fileFilter,
	});
};

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/png'
	) {
		cb(null, true);
	} else {
		req.fileTypeError = 'File type is not currently accepted';
		cb(null, false);
	}
};

module.exports = multer;
