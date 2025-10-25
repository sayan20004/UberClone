const mapService = require('../services/maps.service');
const { validationResult } = require('express-validator');
// TODO: Replace console.error with a proper logging library (e.g., Winston, Pino)
// const logger = require('../path/to/logger'); // Example placeholder

module.exports.getCoordinates = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { address } = req.query;

    try {
        const coordinates = await mapService.getAddressCoordinate(address);
        res.status(200).json(coordinates);
    } catch (error) {
        // Replace console.error with proper logging
        console.error(`Get coordinates error for address "${address}":`, error);
        // Check error type for more specific status codes if possible
        const statusCode = error.message === 'Unable to fetch coordinates' ? 404 : 500;
        res.status(statusCode).json({ message: error.message || 'Failed to get coordinates.' });
    }
};

module.exports.getDistanceTime = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { origin, destination } = req.query;

    try {
        const distanceTime = await mapService.getDistanceTime(origin, destination);
        res.status(200).json(distanceTime);

    } catch (err) {
        // Replace console.error with proper logging
        console.error(`Get distance/time error from "${origin}" to "${destination}":`, err);
        // Check specific error types if needed (e.g., Maps API error)
        const statusCode = err.message === 'No routes found' ? 404 : 500;
        res.status(statusCode).json({ message: err.message || 'Failed to get distance and time.' });
    }
};

module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { input } = req.query;

    try {
        const suggestions = await mapService.getAutoCompleteSuggestions(input);
        res.status(200).json(suggestions);
    } catch (err) {
         // Replace console.error with proper logging
        console.error(`Get autocomplete error for input "${input}":`, err);
         // Check specific error types if needed (e.g., Maps API error)
        const statusCode = err.message === 'Unable to fetch suggestions' ? 503 : 500; // 503 Service Unavailable might fit Maps API failure
        res.status(statusCode).json({ message: err.message || 'Failed to get suggestions.' });
    }
};