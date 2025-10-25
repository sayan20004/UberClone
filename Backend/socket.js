const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');
// TODO: Replace console.error/console.log with a proper logging library (e.g., Winston, Pino)
// const logger = require('../path/to/logger'); // Example placeholder

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*', // Consider restricting this in production e.g., 'http://localhost:5173' or your frontend URL
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        // Handle user/captain joining and storing socket ID
        socket.on('join', async (data) => {
            // Basic validation for join data
            if (!data || !data.userId || !data.userType || !['user', 'captain'].includes(data.userType)) {
                console.error(`Join attempt failed: Invalid data received from socket ${socket.id}:`, data);
                // Optionally emit an error back to the client
                // socket.emit('join_error', { message: 'Valid User ID and User Type (user/captain) are required.' });
                return;
            }

            const { userId, userType } = data;

            try {
                let updated = false;
                let Model = userType === 'user' ? userModel : captainModel;

                // Update the document and get the result to check if it existed
                const result = await Model.findByIdAndUpdate(userId, { socketId: socket.id }, { new: true }); // Use new:true only if you need the updated doc back

                if (result) {
                    updated = true;
                     // Store relevant info on the socket object for later use (e.g., disconnect)
                    socket.userId = userId;
                    socket.userType = userType;
                }

                if (updated) {
                    console.log(`Socket ID ${socket.id} associated with ${userType} ${userId}`);
                     // Optionally confirm join to the client
                     // socket.emit('join_success', { message: `Successfully joined as ${userType}` });
                } else {
                     console.warn(`Could not find ${userType} with ID ${userId} to associate socket ${socket.id}`);
                     // Optionally emit an error back to the client
                     // socket.emit('join_error', { message: `Could not find ${userType} record.` });
                }
            } catch (err) {
                 console.error(`Error associating socket ${socket.id} with ${userType} ${userId}:`, err);
                 // Optionally emit an error back to the client
                 // socket.emit('join_error', { message: 'Server error during join.' });
            }
        });

        // Handle captain location updates
        socket.on('update-location-captain', async (data) => {
            // More robust validation
            if (!data || !data.userId || typeof data.userId !== 'string' ||
                !data.location || typeof data.location.ltd !== 'number' || typeof data.location.lng !== 'number') {
                console.error(`Invalid location update data received from socket ${socket.id}:`, JSON.stringify(data));
                // Optionally emit error back
                // return socket.emit('location_update_error', { message: 'Invalid location data format (requires userId, location.ltd, location.lng)' });
                return; // Stop processing invalid data
            }

            const { userId, location } = data;

            // Optional: Check if the socket user matches the userId being updated
            // This relies on socket.userId being set during 'join'
            if (socket.userId !== userId || socket.userType !== 'captain') {
               console.warn(`Socket ${socket.id} (type: ${socket.userType}, id: ${socket.userId}) attempted to update location for captain ${userId}. Denying.`);
               // return socket.emit('location_update_error', { message: 'Authorization error' });
               return;
            }

            try {
                const updatedCaptain = await captainModel.findByIdAndUpdate(userId, {
                    location: {
                        ltd: location.ltd,
                        lng: location.lng
                    },
                    // Optionally update status to active when location is updated
                    status: 'active'
                }, { new: false }); // Use { new: false } if you don't need the updated doc back immediately

                if (!updatedCaptain) {
                    console.warn(`Captain ${userId} not found during location update from socket ${socket.id}`);
                    // Optionally emit error back
                    // return socket.emit('location_update_error', { message: 'Captain not found' });
                } else {
                    // Reduce logging frequency if needed, this logs every update
                    // console.log(`Updated location for captain ${userId}: ${location.ltd}, ${location.lng}`);
                    // TODO: Implement broadcasting updated location to relevant users if needed
                    // Example: Find users currently matched with this captain and emit 'captain_location_update'
                }

            } catch (err) {
                 console.error(`Error updating location for captain ${userId} from socket ${socket.id}:`, err);
                 // Optionally emit error back
                 // socket.emit('location_update_error', { message: 'Server error during location update.' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log(`Client disconnected: ${socket.id}`);
             // Use userId and userType stored on the socket if available
            const userId = socket.userId;
            const userType = socket.userType;

            if (userId && userType) {
                try {
                    let Model = userType === 'user' ? userModel : captainModel;
                    let updateQuery = { $unset: { socketId: "" } };

                    // If it's a captain, also set status to inactive
                    if (userType === 'captain') {
                        updateQuery.$set = { status: 'inactive' };
                    }

                    // Only update the specific user/captain who disconnected
                    const result = await Model.updateOne({ _id: userId, socketId: socket.id }, updateQuery); // Match socketId too to prevent race conditions

                    if (result.modifiedCount > 0) {
                        console.log(`Cleared socketId ${userType === 'captain' ? 'and set status inactive ' : ''}for disconnected ${userType}: ${userId}`);
                    } else {
                         // This might happen if the socket disconnected before 'join' completed or if DB was updated elsewhere
                        console.log(`No ${userType} found with ID ${userId} and socketId ${socket.id} on disconnect.`);
                    }
                } catch (err) {
                    console.error(`Error clearing socketId/status on disconnect for ${userType} ${userId} (Socket: ${socket.id}):`, err);
                }
            } else {
                // Fallback if userId/userType wasn't stored on socket (less reliable)
                 console.warn(`Socket ${socket.id} disconnected without associated user/captain info. Attempting fallback cleanup.`);
                try {
                    // Attempt to find and update based only on socket.id (less precise)
                     await userModel.updateOne({ socketId: socket.id }, { $unset: { socketId: "" } });
                     await captainModel.updateOne({ socketId: socket.id }, { $set: { status: 'inactive' }, $unset: { socketId: "" } });
                     console.log(`Fallback cleanup attempted for socket ${socket.id}.`);
                 } catch (err) {
                     console.error(`Error during fallback cleanup for socket ${socket.id}:`, err);
                 }
            }
        });

        // Generic error handler for the socket connection itself
        socket.on('error', (err) => {
            console.error(`Socket Error for ${socket.id} (User: ${socket.userId}, Type: ${socket.userType}):`, err.message);
            // Consider disconnecting the socket depending on the error type
            // socket.disconnect(true);
        });

    });
}

// Function to send messages
const sendMessageToSocketId = (socketId, messageObject) => {
    // Basic validation
    if (!socketId || !messageObject || !messageObject.event || messageObject.data === undefined) { // Check data exists
        console.error('sendMessageToSocketId: Invalid arguments.', { socketId, event: messageObject?.event });
        return;
    }

    // console.log(`Attempting to send event "${messageObject.event}" to socketId ${socketId}`); // Reduce noise unless debugging

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
         // console.log(`Successfully sent event "${messageObject.event}" to socketId ${socketId}`); // Log success if needed
    } else {
        console.error('Socket.io not initialized. Cannot send message.');
    }
};

module.exports = { initializeSocket, sendMessageToSocketId };