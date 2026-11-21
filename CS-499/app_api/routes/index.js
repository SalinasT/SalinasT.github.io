const express = require('express');  // Express app
const router = express.Router();    // Router logic

// This is where we import the controllers we will route
const tripsController = require('../controllers/trips.js');
const authController = require('../controllers/authentication.js');

const jwt = require('jsonwebtoken'); // Enable JSON Web Tokens

const createRateLimiter = require('../middleware/rateLimiter');

const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5
});


// Method to authenticate our JWT
function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    if(!authHeader) {
        return res.status(401).json({ message: 'Missing Authorization Header' });
    }

    const parts = authHeader.split(' ');
    if(parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    const token = parts[1];
    if(!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if(err) {
            return res.status(401).json({ message: 'Token Validation Error!' });
        }
        req.auth = verified; 
        next();
    });
}

// console.log(process.env.JWT_SECRET);

router
    .route("/register")
    .post(authLimiter, authController.register);

router
    .route("/login")
    .post(authLimiter, authController.login);

// define route for login endpoint
router
    .route('/login')
    .post(authController.login);

// Define route for our trips endpoint
router
    .route('/trips')
    .get(tripsController.tripsList) // GET Method routes routeist
    .post(authenticateJWT ,tripsController.tripsAddtrip); //POST Method Adds a Trip authenticateJWT ,


// GET Method routes tripsFindByCode - requires parameter
router
    .route('/trips/:tripCode')
    .get(tripsController.tripsFindByCode)
    .put(authenticateJWT ,tripsController.tripsUpdateTrip);

module.exports = router;