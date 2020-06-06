const PageContent = require('../../models/PageContent');
const {
	uploadImagePromise,
	deleteImageByUrl,
} = require('../../services/googleCloud');
const { getLastSegmentOfUrl } = require('../../util/stringHelpers');

const putUpdatePageContent = async (
	pageContent,
	req,
	next,
	uploadingNewImage,
) => {
	const { title, section, content } = req.body;
	console.log(uploadingNewImage);

	if (uploadingNewImage) {
		const newImageUrl = await uploadImagePromise(req.file, next);

		const error = await deleteImageByUrl(pageContent.content.text);

		if (error && error.errors[0].reason !== 'notFound') return false;

		pageContent.title = title;
		pageContent.section = section;
		pageContent.content.image = true;
		pageContent.content.text = newImageUrl;
	} else {
		if (!content.image) {
			const error = await deleteImageByUrl(pageContent.content.text);

			if (error && error.errors[0].reason !== 'notFound') return false;

			pageContent.content.text = content.text;
		}
		pageContent.title = title;
		pageContent.section = section;
		pageContent.content.image = content.image;
	}
};

const putNewPageContent = async (req, next) => {
	const { title, section, content } = req.body;

	return new PageContent({
		title,
		section,
		content: {
			image: content.image,
			text:
				content.image && req.file
					? await uploadImagePromise(req.file, next)
					: content.text,
		},
	});
};

const patchPageContent = async (req, next, originalPageContent) => {
	let newImageUrl = '';
	const updatedPageContent = req.body;
	if (updatedPageContent.content.image) {
		// Replacing the image for the content
		newImageUrl = await uploadImagePromise(req.file, next);
		const error = await deleteImageByUrl(pageContent.content.text);

		if (error && error.errors[0].reason !== 'notFound') return false;
	} else if (updatedPageContent.content.image === false) {
		// Simply removing image
		const error = await deleteImageByUrl(pageContent.content.text);

		if (error && error.errors[0].reason !== 'notFound') return false;
	}

	for (let key in updatedPageContent) {
		if (key in originalPageContent) {
			switch (key) {
				case 'content': {
					for (let nested in updatedPageContent[key]) {
						if (
							nested === 'text' &&
							!updatedPageContent[key]['image']
						) {
							originalPageContent[key][nested] =
								updatedPageContent[key][nested];
							break;
						} else if (nested === 'image') {
							originalPageContent[key][nested] =
								updatedPageContent[key][nested];
							if (updatedPageContent[key][nested]) {
								originalPageContent[key]['text'] = newImageUrl;
							}
						}
					}
					break;
				}
				default:
					originalPageContent[key] = updatedPageContent[key];
					break;
			}
		}
	}
};

const handlePageContentImageDeletion = async pageContent => {
	if (pageContent.content.image) {
		const error = await deleteImageByUrl(pageContent.content.text);

		if (error && error.errors[0].reason !== 'notFound') return false;
	}
};

module.exports = {
	putUpdatePageContent,
	putNewPageContent,
	patchPageContent,
	handlePageContentImageDeletion,
};
