const express = require('express');
const cors = require('cors');

const expressLoader = async ({app}) => {
    // Enable CORS
    app.use(cors());

    // Use JSON
    app.use(express.json());

    // Global authorization for deployed testing
    if (process.env.NODE_ENV === 'production') {
        app.use((req, res, next) => {
            if(req.headers.admin === process.env.STREET_CRED){
                next();
                return;
            } else {
                res.status(400).send('Unauthorized access');
                return;
            }
        });
    }

    // Set up router
    app.use('/api', require('../api/'));
}

module.exports = expressLoader;