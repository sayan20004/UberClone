import React, { useState } from 'react';
// Removed Link as it wasn't used
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Assume ride object passed in props contains _id, user.fullname.firstname, pickup, destination, fare
const FinishRide = (props) => {
    const { ride, setFinishRidePanel } = props; // Destructure props
    const [ error, setError ] = useState(''); // Added error state
    const [ isLoading, setIsLoading ] = useState(false); // Added loading state
    const navigate = useNavigate();

    async function endRide() {
        setError(''); // Clear previous errors
        setIsLoading(true); // Set loading

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                 setError('Authentication error. Please log in again.');
                 setIsLoading(false);
                 // Optionally navigate to login: navigate('/captain-login');
                 return;
            }

            // Ensure ride ID is available
            if (!ride?._id) {
                setError('Ride information is missing. Cannot end ride.');
                setIsLoading(false);
                return;
            }

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/end-ride`, {
                rideId: ride._id
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Assuming 200 is the success status for ending ride
            if (response.status === 200) {
                // Navigate back to captain home on success
                navigate('/captain-home');
                 // Closing the panel might happen automatically due to navigation,
                 // but explicitly calling it ensures cleanup if navigation fails
                 setFinishRidePanel(false);
            } else {
                 console.warn("Unexpected success status:", response.status);
                 setError(`Received unexpected status: ${response.status}. Please try again.`);
            }

        } catch (err) {
            console.error("Error ending ride:", err.response?.data || err.message);
            // Provide more specific error messages
            if (err.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
                 // Optionally navigate to login
            } else if (err.response?.status === 404) {
                 setError('Ride not found.');
            } else if (err.response?.status === 400 || err.response?.status === 409) { // Handle "Ride not ongoing" etc.
                 setError(err.response.data.message || 'Cannot end ride at this time.');
            } else {
                 setError(err.response?.data?.message || 'Failed to end ride. Please try again later.');
            }
        } finally {
            setIsLoading(false); // Unset loading regardless of outcome
        }
    }

    // Handle closing the panel without ending the ride
    const handleClose = () => {
        setFinishRidePanel(false);
    };

     // Prevent rendering if ride data is missing
    if (!ride) {
        return (
            <div className="p-4 text-center text-red-500">
                Error: Ride details are missing.
                <button onClick={handleClose} className="mt-2 text-blue-500 underline">Close</button>
            </div>
        );
    }

    return (
        <div className="relative"> {/* Added relative positioning for absolute child */}
             {/* Close button at the top */}
            <h5 className='p-1 text-center w-[93%] absolute top-0 cursor-pointer' onClick={handleClose}>
                 <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600"></i>
            </h5>

            <h3 className='text-2xl font-semibold mb-5 pt-8'>Finish this Ride</h3>

            {/* Display Error Message */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* User Info */}
            <div className='flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                     {/* Placeholder image */}
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="User Avatar" />
                    <h2 className='text-lg font-medium capitalize'>{ride.user?.fullname?.firstname || 'User'}</h2>
                </div>
                 {/* TODO: Calculate/fetch actual distance */}
                <h5 className='text-lg font-semibold'>{ride.distance ? `${(ride.distance / 1000).toFixed(1)} KM` : 'Distance unavailable'}</h5>
            </div>

             {/* Ride Details */}
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5 text-left'> {/* Ensure text aligns left */}
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill text-xl pt-1"></i>
                        <div>
                             {/* TODO: Use a shorter/formatted pickup address name */}
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{ride.pickup || 'Address unavailable'}</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="text-xl ri-map-pin-2-fill pt-1"></i>
                        <div>
                             {/* TODO: Use a shorter/formatted destination address name */}
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{ride.destination || 'Address unavailable'}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line text-xl"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{ride.fare?.toFixed(2) || 'N/A'}</h3>
                             {/* TODO: Get actual payment method */}
                            <p className='text-sm -mt-1 text-gray-600'>Payment: Cash</p>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className='mt-10 w-full'>
                    <button
                        onClick={endRide}
                        className='w-full text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg disabled:opacity-50'
                        disabled={isLoading} // Disable button while loading
                    >
                        {isLoading ? 'Finishing...' : 'Finish Ride'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinishRide;