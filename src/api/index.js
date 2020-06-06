const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth/controller'));
router.use('/blog-posts', require('./blog-posts/controller'));
router.use('/page-content', require('./page-content/controller'));
router.use('/users', require('./users/controller'));
router.use('/images', require('./images/controller'));

module.exports = router;
