const BlogPost = require('../../models/BlogPost');
const User = require('../../models/User');
const PageContent = require('../../models/PageContent');

const { listImages } = require('../../services/googleCloud');

const getAllImages = async () => {
	return await listImages();
};

const imageIsUsedInMongo = async (model, queryObject) => {
	const query = model.find(queryObject);

	const result = await query.exec();

	if (result.length > 0) return true;
	else return false;
};

const findUsedImages = async () => {
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

module.exports = {
	findUsedImages,
};
