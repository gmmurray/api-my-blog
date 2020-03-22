const express = require('express');
const cors = require('cors');

const expressLoader = async ({app}) => {
    // Enable CORS
    app.use(cors());

    // Use JSON
    app.use(express.json());

    // Set up router
    app.use('/api', require('../api/'));
}

module.exports = expressLoader;