const router = require('express').Router();
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

const User = require('../../models/User');
// const { registerValidation, loginValidation } = require('../validation/users');

// Register
router.post('/register', async (req, res) => {
// 	// Validate data
// 	const error = await registerValidation(req.body);
// 	if (error) {
// 		return res.status(400).json(error);
// 	}

// 	// Check if email already exists
// 	if (await User.findOne({ email: req.body.email })) {
// 		return res.status(400).json('Email already exists');
// 	}

// Hash password
const salt = await bcrypt.genSalt(10);
const hashPassword = await bcrypt.hash(req.body.password, salt);

	const newUser = new User({
		name: req.body.name,
		email: req.body.email,
		username: req.body.username,
		avatar: req.body.avatar,
		bio: req.body.bio,
		password: hashPassword,
	});

	try {
		const savedUser = await newUser.save();
		res.status(200).json({ user: savedUser._id });
	} catch (err) {}
});

// // Login
// router.post('/login', async (req, res) => {
// 	// Validate
// 	const error = await loginValidation(req.body);
// 	if (error) {
// 		return res.status(400).json(error);
// 	}

// 	// Find user
// 	const user = await User.findOne({ email: req.body.email });
// 	if (!user) {
// 		return res.status(400).json('Invalid login attempt');
// 	}

// 	// Check password
// 	const validPass = await bcrypt.compare(req.body.password, user.password);
// 	if (!validPass) {
// 		return res.status(400).send('Invalid login attempt');
//     }
    
//     // Create and assign a JWT
//     const token = jwt.sign({_id: user.__id}, process.env.TOKEN_SECRET);
//     res.header('auth-token', token).send(token);
// });
router.get('/', (req, res) => {
	res.status(200).send('Auth route');
})
module.exports = router;
