const { format } = require('util');
const { Storage } = require('@google-cloud/storage');

const uploadImage = (file, next, callback) => {
	const storage = new Storage();

	const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
	const blob = bucket.file(file.originalname);
	const blobStream = blob.createWriteStream();
	blobStream.on('error', err => {
		next(err);
	});

	blobStream.on('finish', () => {
		callback(
			format(
				`https://storage.googleapis.com/${bucket.name}/${blob.name}`,
			),
		);
	});

	blobStream.end(file.buffer);
}

const uploadImagePromise = (file, next) => {
    return new Promise((resolve, reject) => {
        uploadImage(file, next, url => {
            resolve(url);
        });
    });
};

const deleteImage = async (fileName) => {
    const storage = new Storage();
    const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);
    try {
        await bucket.file(fileName).delete();
        return;
    } catch (error) {
        return error;
    }
};

module.exports.uploadImagePromise = uploadImagePromise;
module.exports.deleteImage = deleteImage;
