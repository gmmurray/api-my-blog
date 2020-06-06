const {
	uploadImagePromise,
	deleteImageByUrl,
} = require('../../services/googleCloud');
const { hashPassword } = require('../../services/passwords');

const patchUser = async (req, next, originalUser) => {
	const updatedUser = req.body;
	if (req.file) {
		const newImageUrl = await uploadImagePromise(req.file, next);
		if (originalUser.avatar !== '') {
			const error = await deleteImageByUrl(originalUser.avatar);

			if (error && error.errors[0].reason !== 'notFound') return false;
		}
		updatedUser.avatar = newImageUrl;
	} else if (
		updatedUser.avatar &&
		updatedUser.avatar === '' &&
		originalUser.avatar !== ''
	) {
		const error = await deleteImageByUrl(originalUser.avatar);

		if (error && error.errors[0].reason !== 'notFound') return false;
	}

	for (let key in updatedUser) {
		if (key in originalUser) {
			switch (key) {
				case 'password': {
					const hashedPassword = await hashPassword(
						updatedUser.password,
						10,
					);
					originalUser.password = hashedPassword;
					break;
				}
				default: {
					originalUser[key] = updatedUser[key];
					break;
				}
			}
		}
	}
};

const handleUserAvatarDeletion = async user => {
	if (user.avatar !== '') {
		const error = await deleteImageByUrl(user.avatar);

		if (error && error.errors[0].reason !== 'notFound') return false;
	}
};

module.exports = {
	patchUser,
	handleUserAvatarDeletion,
};
