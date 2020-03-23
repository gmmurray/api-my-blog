const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth/controller'));
router.use('/blog-posts', require('./blog-posts/controller'));

module.exports = router