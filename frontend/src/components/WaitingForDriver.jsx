import React from 'react';

// Assume 'ride' prop contains captain details, otp, pickup, destination, fare
const WaitingForDriver = (props) => {
    const { ride, setWaitingForDriver } = props;

    // Handle closing the panel (e.g., if user wants to cancel)
    const handleCloseOrCancel = () => {
        // TODO: Implement cancel ride logic if needed (API call)
        console.log("Cancel ride requested while waiting for driver.");
        setWaitingForDriver(false); // Close this panel
    };

    // Prevent rendering if essential ride data is missing
    if (!ride || !ride.captain || !ride.otp) {
        return (
            <div className="relative p-4 text-center text-red-500">
                Error: Waiting details are incomplete.
                <button onClick={() => setWaitingForDriver(false)} className="mt-2 text-blue-500 underline">Close</button>
            </div>
        );
    }

    // Safely access nested properties
    const captainName = ride.captain?.fullname?.firstname || 'Captain';
    const vehiclePlate = ride.captain?.vehicle?.plate || 'Plate N/A';
    // TODO: Get vehicle model/description dynamically
    const vehicleDescription = ride.captain?.vehicle?.description || 'Vehicle Model'; // Placeholder


    return (
        <div className="relative pb-4"> {/* Added relative positioning and padding */}
            {/* Close/Cancel button */}
            <h5 className='p-1 text-center w-[93%] absolute top-0 cursor-pointer' onClick={handleCloseOrCancel}>
                 <i className="text-3xl text-gray-400 ri-close-line hover:text-gray-600"></i> {/* Changed to close icon */}
            </h5>

            {/* Captain and Vehicle Info */}
            <div className='flex items-center justify-between pt-8'> {/* Added padding top */}
                 {/* TODO: Use dynamic vehicle image */}
                <img className='h-12 object-contain' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Vehicle" />
                <div className='text-right'>
                    <h2 className='text-lg font-medium capitalize'>{captainName} is arriving!</h2>
                    <h4 className='text-xl font-semibold -mt-1 -mb-1'>{vehiclePlate}</h4>
                    <p className='text-sm text-gray-600'>{vehicleDescription}</p>
                     {/* Display OTP clearly */}
                    <p className='text-sm mt-1'>Share OTP with driver:</p>
                    <h1 className='text-2xl font-semibold tracking-widest'>{ride.otp}</h1>
                </div>
            </div>

             {/* Ride Details */}
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5 text-left'>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill text-xl pt-1 text-gray-600"></i>
                        <div>
                             {/* TODO: Use shorter address name */}
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{ride.pickup || 'Address unavailable'}</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="text-xl ri-map-pin-2-fill pt-1 text-gray-600"></i>
                        <div>
                            {/* TODO: Use shorter address name */}
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{ride.destination || 'Address unavailable'}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line text-xl text-gray-600"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{ride.fare?.toFixed(2) || 'N/A'}</h3>
                             {/* TODO: Get actual payment method */}
                            <p className='text-sm -mt-1 text-gray-600'>Payment: Cash</p>
                        </div>
                    </div>
                </div>
                 {/* Optional: Add a cancel button */}
                 <button
                    onClick={handleCloseOrCancel}
                    className='w-full mt-5 bg-red-600 text-white font-semibold p-2 rounded-lg'
                >
                    Cancel Ride
                </button>
            </div>
        </div>
    );
};

export default WaitingForDriver;