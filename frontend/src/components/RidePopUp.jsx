import React from 'react';

// Assume 'ride', 'confirmRide', 'ignoreRide', 'setRidePopupPanel' props are passed
const RidePopUp = (props) => {
    const { ride, confirmRide, ignoreRide, setRidePopupPanel } = props;

    // Prevent rendering if essential ride data is missing
    if (!ride || !ride.user) {
        return (
            <div className="relative p-4 text-center text-red-500">
                Error: Ride details are missing.
                 {/* Provide a way to close even on error */}
                <button onClick={() => setRidePopupPanel(false)} className="mt-2 text-blue-500 underline">Close</button>
            </div>
        );
    }

    // Safely access nested properties
    const userName = `${ride.user.fullname?.firstname || 'User'} ${ride.user.fullname?.lastname || ''}`.trim();
    const pickupDisplay = ride.pickup || 'Address unavailable';
    const destinationDisplay = ride.destination || 'Address unavailable';
    const fareDisplay = ride.fare?.toFixed(2) || 'N/A';
    // TODO: Calculate distance from captain's current location to pickup point
    const distanceDisplay = ride.distance ? `${(ride.distance / 1000).toFixed(1)} KM away` : 'Distance unavailable'; // Placeholder distance

    return (
        <div className="relative pb-4"> {/* Added relative positioning and padding */}
            {/* Close button (acts like ignore) */}
            <h5 className='p-1 text-center w-[93%] absolute top-0 cursor-pointer' onClick={ignoreRide}> {/* Use ignoreRide handler */}
                <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600"></i>
            </h5>

            <h3 className='text-2xl font-semibold mb-5 pt-8 text-center'>New Ride Available!</h3>

            {/* User Info */}
            <div className='flex items-center justify-between p-3 bg-yellow-400 rounded-lg mt-4'>
                <div className='flex items-center gap-3 '>
                    {/* Placeholder image */}
                    <img className='h-12 rounded-full object-cover w-12' src="https://i.pinimg.com/236x/af/26/28/af26280b0ca305be47df0b799ed1b12b.jpg" alt="User Avatar" />
                    <h2 className='text-lg font-medium capitalize'>{userName}</h2>
                </div>
                <h5 className='text-lg font-semibold'>{distanceDisplay}</h5> {/* Display distance */}
            </div>

            {/* Ride Details */}
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5 text-left'>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill text-xl pt-1 text-gray-600"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{pickupDisplay}</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="text-xl ri-map-pin-2-fill pt-1 text-gray-600"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{destinationDisplay}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line text-xl text-gray-600"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{fareDisplay}</h3>
                            {/* TODO: Get actual payment method */}
                            <p className='text-sm -mt-1 text-gray-600'>Payment: Cash</p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='mt-5 w-full flex flex-col sm:flex-row gap-2'> {/* Flex row for buttons */}
                    <button
                        onClick={confirmRide} // Use the confirmRide handler passed from parent
                        className='flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold p-3 px-10 rounded-lg transition-colors duration-200' // Use flex-1 for equal width
                    >
                        Accept
                    </button>

                    <button
                        onClick={ignoreRide} // Use the ignoreRide handler passed from parent
                        className='flex-1 mt-2 sm:mt-0 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold p-3 px-10 rounded-lg transition-colors duration-200' // Use flex-1
                    >
                        Ignore
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RidePopUp;