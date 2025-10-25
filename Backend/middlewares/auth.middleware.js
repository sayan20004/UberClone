const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const blackListTokenModel = require('../models/blackListToken.model');
const captainModel = require('../models/captain.model');
const logger = require('../config/logger');

module.exports.authUser = async (req, res, next) => {
    // **CHANGED:** Rely solely on Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Get token part after 'Bearer '

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try { // Added try around blacklist check and verify
        const isBlacklisted = await blackListTokenModel.findOne({ token: token });

        if (isBlacklisted) {
            logger.error(`Authentication attempt failed: Token is blacklisted (${token.substring(0, 10)}...)`);
            return res.status(401).json({ message: 'Unauthorized: Invalid session' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            logger.error(`Authentication failed: User not found for token ID ${decoded._id}`);
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user = user;
        return next();

    } catch (err) {
        // Handle specific JWT errors like expiration or malformed token
        if (err.name === 'JsonWebTokenError') {
             logger.error(`Authentication error: Invalid token - ${err.message}`);
             return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        } else if (err.name === 'TokenExpiredError') {
            logger.error(`Authentication error: Token expired - ${err.message}`);
            return res.status(401).json({ message: 'Unauthorized: Session expired' });
        }
        // General error
        logger.error('Authentication error:', err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

module.exports.authCaptain = async (req, res, next) => {
    // **CHANGED:** Rely solely on Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Get token part after 'Bearer '

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try { // Added try around blacklist check and verify
        const isBlacklisted = await blackListTokenModel.findOne({ token: token });

        if (isBlacklisted) {
             logger.error(`Captain authentication attempt failed: Token is blacklisted (${token.substring(0, 10)}...)`);
            return res.status(401).json({ message: 'Unauthorized: Invalid session' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);

        if (!captain) {
             logger.error(`Captain authentication failed: Captain not found for token ID ${decoded._id}`);
             return res.status(401).json({ message: 'Unauthorized: Captain not found' });
        }

        req.captain = captain;
        return next();

    } catch (err) {
         // Handle specific JWT errors like expiration or malformed token
        if (err.name === 'JsonWebTokenError') {
             logger.error(`Captain authentication error: Invalid token - ${err.message}`);
             return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        } else if (err.name === 'TokenExpiredError') {
            logger.error(`Captain authentication error: Token expired - ${err.message}`);
            return res.status(401).json({ message: 'Unauthorized: Session expired' });
        }
        // General error
        logger.error('Captain authentication error:', err);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};