import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Removed Link as it wasn't used
import axios from 'axios';

// Assume ride object passed in props contains necessary details like _id, user.fullname.firstname, pickup, destination, fare
const ConfirmRidePopUp = (props) => {
    const { ride, setConfirmRidePopupPanel, setRidePopupPanel } = props; // Destructure props for easier access
    const [ otp, setOtp ] = useState('');
    const [ error, setError ] = useState(''); // Added error state
    const [ isLoading, setIsLoading ] = useState(false); // Added loading state
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setIsLoading(true); // Set loading

        // Basic OTP validation (e.g., check length)
        if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
            setError('Please enter a valid 6-digit OTP.');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                 setError('Authentication error. Please log in again.');
                 setIsLoading(false);
                 // Optionally navigate to login: navigate('/captain-login');
                 return;
            }

            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/start-ride`, {
                params: {
                    rideId: ride?._id, // Use optional chaining
                    otp: otp
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Assuming 200 is the only success status for starting ride
            if (response.status === 200) {
                // Clear panels only on success
                setConfirmRidePopupPanel(false);
                setRidePopupPanel(false); // Assuming this needs to be closed too
                navigate('/captain-riding', { state: { ride: response.data } }); // Pass updated ride data if backend returns it
            } else {
                 // Handle unexpected success statuses if necessary
                 console.warn("Unexpected success status:", response.status);
                 setError(`Received unexpected status: ${response.status}. Please try again.`);
            }
        } catch (err) {
            console.error("Error starting ride:", err.response?.data || err.message);
            // Provide more specific error messages based on backend response if possible
            if (err.response?.status === 401) {
                setError('Authentication failed. Please log in again.');
                // Optionally navigate to login
            } else if (err.response?.status === 400 && err.response?.data?.message === 'Invalid OTP') {
                 setError('Invalid OTP entered. Please try again.');
            } else {
                 setError(err.response?.data?.message || 'Failed to start ride. Please try again later.');
            }
        } finally {
             setIsLoading(false); // Unset loading regardless of outcome
        }
    };

    // Handle closing the panel
    const handleClose = () => {
        setConfirmRidePopupPanel(false);
        // Do not close setRidePopupPanel here, let the RidePopUp component handle its own closure if needed
    };

    // Handle cancel button click (closes both popups?)
     const handleCancelRide = () => {
        // TODO: Implement ride cancellation logic if required (API call, state update)
        console.log("Ride cancellation requested"); // Placeholder
        setConfirmRidePopupPanel(false);
        setRidePopupPanel(false); // Assuming cancel closes both
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

            <h3 className='text-2xl font-semibold mb-5 pt-8'>Confirm Ride Start</h3>

            {/* Display Error Message */}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            {/* User Info */}
            <div className='flex items-center justify-between p-3 border-2 border-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    {/* Placeholder image, consider fetching user profile pic */}
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="User Avatar" />
                    <h2 className='text-lg font-medium capitalize'>{ride.user?.fullname?.firstname || 'User'}</h2>
                </div>
                {/* TODO: Calculate/fetch actual distance */}
                <h5 className='text-lg font-semibold'>{ride.distance ? `${(ride.distance / 1000).toFixed(1)} KM` : 'Distance unavailable'}</h5>
            </div>

            {/* Ride Details */}
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5 text-left'> {/* Ensure text aligns left */}
                    <div className='flex items-start gap-5 p-3 border-b-2'> {/* Changed items-center to items-start */}
                        <i className="ri-map-pin-user-fill text-xl pt-1"></i> {/* Adjust icon size/padding */}
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
                    <div className='flex items-center gap-5 p-3'> {/* Keep items-center here */}
                        <i className="ri-currency-line text-xl"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{ride.fare?.toFixed(2) || 'N/A'}</h3>
                             {/* TODO: Get actual payment method */}
                            <p className='text-sm -mt-1 text-gray-600'>Payment: Cash</p>
                        </div>
                    </div>
                </div>

                {/* OTP Form and Actions */}
                <div className='mt-6 w-full'>
                    <form onSubmit={submitHandler}>
                        <input
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            type="text" // Use "tel" for numeric keypad on mobile
                            inputMode="numeric" // Helps mobile keyboards
                            pattern="\d{6}" // Basic pattern validation
                            maxLength="6" // Limit input length
                            required // HTML5 validation
                            className='bg-[#eee] px-6 py-4 font-mono text-lg rounded-lg w-full mt-3 text-center tracking-widest' // Center align OTP
                            placeholder='Enter 6-Digit OTP'
                            disabled={isLoading} // Disable input while loading
                        />

                        <button
                            type="submit"
                            className='w-full mt-5 text-lg flex justify-center bg-green-600 text-white font-semibold p-3 rounded-lg disabled:opacity-50'
                            disabled={isLoading} // Disable button while loading
                        >
                            {isLoading ? 'Confirming...' : 'Confirm Start'}
                        </button>
                        <button
                            type="button" // Important: Prevent form submission
                            onClick={handleCancelRide} // Use the specific cancel handler
                            className='w-full mt-2 bg-red-600 text-lg text-white font-semibold p-3 rounded-lg disabled:opacity-50'
                            disabled={isLoading} // Optionally disable during confirm action
                        >
                            Cancel Ride {/* Changed text */}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConfirmRidePopUp;