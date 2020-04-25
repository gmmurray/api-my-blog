const router = require('express').Router();
const {
	findUsedImages,
	findAllImages,
	findImageByProperty,
	handleDeleteImage,
} = require('./service');

// GET api/images/all
// Gets all uploaded images, or searches by key/value if provided in query string
router.get('/all', async (req, res) => {
	if (req.query) {
		try {
			const key = Object.keys(req.query)[0];
			const image = await findImageByProperty(key, req.query[key]);
			image.length === 0
				? res.status(404).json({ error: 'Image could not be found' })
				: res.status(200).json({ image });
		} catch (error) {
			res.status(400).json(error);
		}
	} else {
		try {
			const images = await findAllImages();
			res.status(200).json({ images });
		} catch (error) {
			res.status(400).json(error);
		}
	}
});

// GET api/images/used
// Gets all uploaded images that are in use, or searches by key/value if provided in query string
router.get('/used', async (req, res) => {
	if (req.query) {
		try {
			const key = Object.keys(req.query)[0];
			const image = await findImageByProperty(key, req.query[key], true);
			image.length === 0
				? res.status(404).json({ error: 'Image could not be found' })
				: res.status(200).json({ image });
		} catch (error) {
			res.status(400).json(error);
		}
	} else {
		try {
			const images = await findUsedImages();
			res.status(200).json({ images });
		} catch (error) {
			res.status(400).json(error);
		}
	}
});

router.delete('/safe', async (req, res) => {
	if (req.query) {
		try {
			const key = Object.keys(req.query)[0];
			const deletionResult = await handleDeleteImage(key, req.query[key]);

			if (deletionResult && deletionResult.status === false) {
				res.status(404).json({ error: deletionResult.error });
				return;
			}

			res.status(204).json();
		} catch (error) {
			res.status(400).json('error');
		}
	} else {
		res.status(404).json({ error: 'No query string provided' });
	}
});

router.delete('/any', async (req, res) => {
	if (req.query) {
		try {
			const key = Object.keys(req.query)[0];
			const deletionResult = await handleDeleteImage(key, req.query[key], false);

			if (deletionResult && deletionResult.status === false) {
				res.status(404).json({ error: deletionResult.error });
				return;
			}

			res.status(204).json();
		} catch (error) {
			res.status(400).json('error');
		}
	} else {
		res.status(404).json({ error: 'No query string provided' });
	}
});

module.exports = router;
