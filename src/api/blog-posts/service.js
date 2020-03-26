const BlogPost = require('../../models/BlogPost');
const {
	uploadImagePromise,
	deleteImage,
} = require('../../services/googleCloud');

const postBlogPost = (data, file, imageUrl) => {
	const { title, intro, content, category, published } = data;
	const { description, alt } = data.image;
	return new BlogPost({
		title,
		intro,
		content,
		category,
		published,
		image: {
			url: imageUrl,
			description,
			alt,
			filename: file.originalname,
		},
		author: {
			// TODO: change to get from JWT
			id: '5e77a5b67e90e82bdc1f2ff5',
			name: 'John Johnson',
			avatar:
				'https://www.elegantthemes.com/blog/wp-content/uploads/2017/01/shutterstock_534491617-600.jpg',
		},
	});
};

const putUpdateBlogPost = (blogPost, data) => {
	const {
		title,
		intro,
		content,
		category,
		published,
		dateCreated,
		datePublished,
	} = data;

	const { description, alt } = data.image;

	blogPost = {
		title,
		intro,
		content,
		category,
		published,
		image: {
			description,
			alt,
		},
		dateCreated: Date.parse(dateCreated),
		datePublished: Date.parse(datePublished),
		lastModified: Date.now(),
	};
};

const putNewBlogPost = async (data, file, next) => {
	const {
		title,
		intro,
		content,
		category,
		published,
		dateCreated,
		datePublished,
	} = data;
    const { description, alt } = data.image;
    
	return new BlogPost({
		title,
		intro,
		content,
		category,
		published,
		image: {
			description,
			alt,
			url: await uploadImagePromise(file, next),
			filename: file.originalname,
		},
		author: {
			// TODO: change to get from JWT
			id: '5e77a5b67e90e82bdc1f2ff5',
			name: 'John Johnson',
			avatar:
				'https://www.elegantthemes.com/blog/wp-content/uploads/2017/01/shutterstock_534491617-600.jpg',
		},
		dateCreated: Date.parse(dateCreated),
		datePublished: Date.parse(datePublished),
		lastModified: Date.now(),
	});
};

module.exports.postBlogPost = postBlogPost;
module.exports.putUpdateBlogPost = putUpdateBlogPost;
module.exports.putNewBlogPost = putNewBlogPost;
