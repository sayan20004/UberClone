const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blackListTokenModel = require('../models/blackListToken.model');
const { validationResult } = require('express-validator');
const logger = require('../config/logger');

module.exports.registerCaptain = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    try { // Added try
        const isCaptainAlreadyExist = await captainModel.findOne({ email });

        if (isCaptainAlreadyExist) {
             // Log specific internal error
            logger.error(`Captain registration attempt failed: Captain already exists for email ${email}`);
            // Send generic client error
            return res.status(400).json({ message: 'Registration failed. Please check your details.' });
        }

        const hashedPassword = await captainModel.hashPassword(password);

        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            email,
            password: hashedPassword,
            color: vehicle.color,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });

        const token = captain.generateAuthToken();

        // Avoid sending back sensitive info like password hash implicitly
        const captainResponse = captain.toObject();
        delete captainResponse.password;


        res.status(201).json({ token, captain: captainResponse });

    } catch (err) { // Added catch
        // Replace console.error with proper logging
        // logger.error('Captain registration failed:', err);
        logger.error('Captain registration failed:', err);
        res.status(500).json({ message: 'Registration failed due to a server error.' });
    }
};

module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try { // Added try
        const captain = await captainModel.findOne({ email }).select('+password');

        // **CHANGED:** Generic error for both captain not found and password mismatch
        if (!captain) {
            // Log the specific error internally if needed, but send generic response
            logger.error(`Captain login attempt failed: Captain not found for email ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await captain.comparePassword(password);

        if (!isMatch) {
            // Log the specific error internally if needed, but send generic response
            logger.error(`Captain login attempt failed: Password mismatch for email ${email}`);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = captain.generateAuthToken();

        // res.cookie('token', token); // **REMOVED** - Relying on Authorization header

        // Avoid sending back sensitive info like password hash implicitly
        const captainResponse = captain.toObject();
        delete captainResponse.password;

        res.status(200).json({ token, captain: captainResponse });

    } catch (err) { // Added catch
         // Replace console.error with proper logging
        logger.error('Captain login failed:', err);
        res.status(500).json({ message: 'Login failed due to a server error.' });
    }
};

module.exports.getCaptainProfile = async (req, res, next) => {
    // req.captain is populated by auth middleware, password is not selected
    res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
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
        res.status(200).json({ message: 'Logout successfully' });
    } catch (err) { // **ADDED catch**
        // Replace console.error with proper logging
        logger.error('Captain logout error:', err);
        res.status(500).json({ message: 'Logout failed due to a server error.' });
    }
};