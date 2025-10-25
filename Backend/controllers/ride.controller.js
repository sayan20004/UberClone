const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');
// TODO: Replace console.error with a proper logging library (e.g., Winston, Pino)
// const logger = require('../path/to/logger'); // Example placeholder

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Removed userId from destructuring, using req.user._id instead
    const { pickup, destination, vehicleType } = req.body;

    try {
        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });

        // Populate user details for socket message, explicitly exclude sensitive data if needed
        const rideWithUser = await rideModel.findById(ride._id).populate({
            path: 'user',
            select: 'fullname email _id' // Explicitly select fields, exclude password
        });

        if (!rideWithUser) {
             console.error(`Error finding ride after creation: ${ride._id}`);
             // Don't send socket messages if ride creation failed unexpectedly after DB insert
             return res.status(500).json({ message: 'Error processing ride creation.' });
        }


        // Avoid sending OTP in the initial HTTP response
        const rideResponse = rideWithUser.toObject();
        delete rideResponse.otp; // Ensure OTP is not in HTTP response
        res.status(201).json(rideResponse);


        // Find nearby captains after successfully creating and responding
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 2); // Assuming radius is 2 km

        // Prepare data for socket message (ensure OTP is not included here either)
        const rideDataForSocket = rideWithUser.toObject();
        delete rideDataForSocket.otp; // Double-check OTP removal for socket event

        captainsInRadius.forEach(captain => { // Changed map to forEach as we don't need the return value
            if (captain.socketId) { // Check if captain is connected
                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: rideDataForSocket // Send data without OTP
                });
                console.log(`Sent new-ride event to captain ${captain._id} (Socket: ${captain.socketId})`);
            } else {
                 console.log(`Captain ${captain._id} is not connected, skipping new-ride event.`);
            }
        });

    } catch (err) {
        // Replace console.error with proper logging
        console.error('Ride creation error:', err);
        // Provide a more generic error message to the client
        return res.status(500).json({ message: 'Failed to create ride due to a server error.' });
    }
};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        const fare = await rideService.getFare(pickup, destination);
        return res.status(200).json(fare);
    } catch (err) {
         // Replace console.error with proper logging
         console.error('Get fare error:', err);
         // Check specific error types if needed (e.g., Maps API error)
         return res.status(500).json({ message: err.message || 'Failed to calculate fare.' });
    }
};

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        // rideService.confirmRide populates user and captain and selects OTP
        let ride = await rideService.confirmRide({ rideId, captain: req.captain }); // Use let

        // Ensure user is connected before sending socket message
        if (ride.user && ride.user.socketId) {
             sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-confirmed',
                // **ADDED:** Create a safe copy excluding OTP for socket message
                data: { ...ride.toObject(), otp: undefined } // Exclude OTP
            });
            console.log(`Sent ride-confirmed event to user ${ride.user._id} (Socket: ${ride.user.socketId})`);
        } else {
             console.warn(`User ${ride.user?._id} for ride ${ride._id} not connected, could not send ride-confirmed event.`);
        }


        // Remove OTP from the HTTP response
        ride = ride.toObject(); // Convert to plain object
        delete ride.otp;

        return res.status(200).json(ride);

    } catch (err) {
        // Replace console.error with proper logging
        console.error('Ride confirmation error:', err);
        // Send appropriate status code based on error type
        const statusCode = err.message === 'Ride not found' ? 404 : 500;
        return res.status(statusCode).json({ message: err.message || 'Failed to confirm ride.' });
    }
};

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        // rideService.startRide populates user/captain, selects OTP for validation
        let ride = await rideService.startRide({ rideId, otp, captain: req.captain }); // Use let

        // logger.info('Ride started:', ride._id); // Example logging

        // Ensure user is connected before sending socket message
        if (ride.user && ride.user.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-started',
                // **ADDED:** Create a safe copy excluding OTP for socket message
                data: { ...ride.toObject(), otp: undefined } // Exclude OTP
            });
             console.log(`Sent ride-started event to user ${ride.user._id} (Socket: ${ride.user.socketId})`);
        } else {
             console.warn(`User ${ride.user?._id} for ride ${ride._id} not connected, could not send ride-started event.`);
        }

        // Remove OTP from the HTTP response
        ride = ride.toObject(); // Convert to plain object
        delete ride.otp;

        return res.status(200).json(ride);

    } catch (err) {
         // Replace console.error with proper logging
        console.error('Start ride error:', err);
         // Send appropriate status code based on error type
        let statusCode = 500;
        if (err.message === 'Ride not found') statusCode = 404;
        if (err.message === 'Invalid OTP' || err.message === 'Ride not accepted') statusCode = 400; // Or 403 Forbidden?
        return res.status(statusCode).json({ message: err.message || 'Failed to start ride.' });
    }
};

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        // rideService.endRide populates user/captain
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        // Ensure user is connected before sending socket message
        if (ride.user && ride.user.socketId) {
            sendMessageToSocketId(ride.user.socketId, {
                event: 'ride-ended',
                data: ride // OTP should not be selected here by default
            });
             console.log(`Sent ride-ended event to user ${ride.user._id} (Socket: ${ride.user.socketId})`);
        } else {
             console.warn(`User ${ride.user?._id} for ride ${ride._id} not connected, could not send ride-ended event.`);
        }

        // OTP is not selected by default, so no need to remove unless explicitly selected in service
        return res.status(200).json(ride);

    } catch (err) {
        // Replace console.error with proper logging
        console.error('End ride error:', err);
        // Send appropriate status code based on error type
        let statusCode = 500;
        if (err.message === 'Ride not found') statusCode = 404;
        if (err.message === 'Ride not ongoing') statusCode = 400; // Or 409 Conflict?
        return res.status(statusCode).json({ message: err.message || 'Failed to end ride.' });
    }
}; // Removed extra 's' at the end