const BlogPost = require('../../models/BlogPost');
const User = require('../../models/User');
const PageContent = require('../../models/PageContent');

const { listImages, deleteImage } = require('../../services/googleCloud');

const getAllImages = async () => {
	return await listImages();
};

const imageIsUsedInMongo = async (model, queryObject) => {
	const query = model.find(queryObject);

	const result = await query.exec();

	if (result.length > 0) return true;
	else return false;
};

const findAllImages = async () => {
	const allImages = await getAllImages();

	const result = allImages.map(async (thisUrl) => {
		let usedInBlog = await imageIsUsedInMongo(BlogPost, {
			'image.url': thisUrl.url,
		});

		let usedInPageContent = await imageIsUsedInMongo(PageContent, {
			'content.text': thisUrl.url,
		});

		let usedInUserAvatar = await imageIsUsedInMongo(User, {
			avatar: thisUrl.url,
		});

		let isUsed = usedInBlog || usedInPageContent || usedInUserAvatar;

		return {
			...thisUrl,
			isUsed,
		};
	});

	return await Promise.all(result);
};

const findUsedImages = async () => {
	const images = await findAllImages();
	const result = images.filter((i) => i.isUsed === true);
	return result;
};

const findImageByProperty = async (property, value, usedOnly = false) => {
	const images = usedOnly ? await findUsedImages() : await findAllImages();

	return images.filter((i) => i[property] === value);
};

const handleDeleteImage = async (property, value, safe = true) => {
	const results = await findImageByProperty(property, value);
	const image = results[0];
	if (!image) return { status: false, error: 'Image could not be found' };

	if (safe && image.isUsed) {
		return {
			status: false,
			error: 'Image is being used as content somewhere',
		};
	}

	console.log(image);
	const error = await deleteImage(image.name);

	if (error && error.errors[0].reason !== 'notFound')
		return { status: false, error: 'Error deleting file' };
};

module.exports = {
	findUsedImages,
	findAllImages,
	findImageByProperty,
	handleDeleteImage,
};
