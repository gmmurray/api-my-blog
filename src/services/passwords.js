const bcrypt = require('bcryptjs');

const hashPassword = async (password, rounds) => {
	const salt = await bcrypt.genSalt(rounds);
	return await bcrypt.hash(password, salt);
};

module.exports = {
	hashPassword,
};
