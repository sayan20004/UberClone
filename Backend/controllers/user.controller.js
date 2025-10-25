const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blackListToken.model');
const logger = require('../config/logger');

module.exports.registerUser = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password } = req.body;

    try { // Added try
        const isUserAlready = await userModel.findOne({ email });

        if (isUserAlready) {
            // Log specific internal error
            logger.error(`Registration attempt failed: User already exists for email ${email}`);
            // Send generic client error
            return res.status(400).json({ message: 'Registration failed. Please check your details.' });
        }

        const hashedPassword = await userModel.hashPassword(password);

        const user = await userService.createUser({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword
        });

        const token = user.generateAuthToken();

        // Avoid sending back sensitive info like password hash implicitly
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ token, user: userResponse });

    } catch (err) { // Added catch
        // Replace console.error with proper logging
        // logger.error('User registration failed:', err);
        logger.error('User registration failed:', err);
        res.status(500).json({ message: 'Registration failed due to a server error.' });
    }
};

module.exports.loginUser = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try { // Added try
        const user = await userModel.findOne({ email }).select('+password');

        // **CHANGED:** Generic error for both user not found and password mismatch
        if (!user) {
            // Log the specific error internally if needed, but send generic response
            logger.error(`Login attempt failed: User not found for email ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            // Log the specific error internally if needed, but send generic response
            logger.error(`Login attempt failed: Password mismatch for email ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = user.generateAuthToken();

        // res.cookie('token', token); // **REMOVED** - Relying on Authorization header

        // Avoid sending back sensitive info like password hash implicitly
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({ token, user: userResponse });

    } catch (err) { // Added catch
        // Replace console.error with proper logging
        logger.error('User login failed:', err);
        res.status(500).json({ message: 'Login failed due to a server error.' });
    }
};

module.exports.getUserProfile = async (req, res, next) => {
    // req.user is populated by auth middleware, password is not selected by default
    res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
    // **REMOVED** res.clearCookie('token');

    // **CHANGED** Token retrieval to only use header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // No token or invalid format, arguably already logged out client-side or unauthorized
        return res.status(200).json({ message: 'No active session or invalid token format.' });
    }
    const token = authHeader.split(' ')[1];

    try { // **ADDED try...catch**
        if (token) {
            // Check if token already blacklisted
            const isBlacklisted = await blackListTokenModel.findOne({ token: token });
            if (!isBlacklisted) {
                await blackListTokenModel.create({ token });
                logger.info(`Token blacklisted: ${token.substring(0, 10)}...`);
            } else {
                logger.info(`Token already blacklisted: ${token.substring(0, 10)}...`);
            }
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) { // **ADDED catch**
        // Replace console.error with proper logging
        logger.error('Logout error:', err);
        res.status(500).json({ message: 'Logout failed due to a server error.' });
    }
};