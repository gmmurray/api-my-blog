const router = require('express').Router();
const { findUsedImages } = require('./service');

router.get('/', async (req, res) => {
	try {
		const images = await findUsedImages();
		res.status(200).json({ images });
	} catch (error) {
		res.status(400).json(error);
	}
});

module.exports = router;
