import React from 'react';

// Assume props: pickup, destination, fare, vehicleType, setConfirmRidePanel, setVehicleFound, createRide
const ConfirmRide = (props) => {
    const {
        pickup,
        destination,
        fare,
        vehicleType,
        setConfirmRidePanel,
        setVehicleFound, // Renamed for clarity (previously setLookingForDriver?)
        createRide // Function to call when confirming
    } = props;

    // Determine the correct fare based on the selected vehicle type
    const calculatedFare = fare && vehicleType ? fare[vehicleType] : null;

    // Get a display name for the vehicle type
    const getVehicleDisplayName = (type) => {
        switch (type) {
            case 'car': return 'UberGo Car';
            case 'moto': return 'Uber Moto';
            case 'auto': return 'Uber Auto';
            default: return 'Selected Vehicle';
        }
    };

     // Get appropriate image based on vehicle type
    const getVehicleImage = (type) => {
        switch (type) {
            case 'car': return "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg";
            case 'moto': return "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png";
            case 'auto': return "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png";
            default: return "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"; // Default
        }
    };


    const handleConfirm = () => {
        // Call the createRide function passed from the parent (Home.jsx)
        if (createRide) {
            createRide();
        }
        // Panels are typically closed/opened within the createRide function's success/error handling in Home.jsx
        // setVehicleFound(true); // This might be handled in Home.jsx after createRide succeeds
        // setConfirmRidePanel(false); // This might be handled in Home.jsx after createRide succeeds
    };

    const handleBack = () => {
         setConfirmRidePanel(false); // Go back to vehicle selection
    }

    return (
        <div className="relative pb-4"> {/* Added relative positioning and padding */}
            {/* Back button at the top */}
            <h5 className='p-1 text-center w-[93%] absolute top-0 cursor-pointer' onClick={handleBack}>
                 <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600"></i> {/* Use back arrow or similar */}
            </h5>

            <h3 className='text-2xl font-semibold mb-5 pt-8 text-center'>Confirm your Ride</h3>

            <div className='flex gap-2 justify-between flex-col items-center'>
                 {/* Vehicle Image and Type */}
                 <div className="flex flex-col items-center">
                    <img className='h-20 object-contain' src={getVehicleImage(vehicleType)} alt={`${getVehicleDisplayName(vehicleType)} icon`} />
                    <p className="mt-2 text-sm font-medium">{getVehicleDisplayName(vehicleType)}</p>
                 </div>

                 {/* Ride Details */}
                <div className='w-full mt-5 text-left'>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill text-xl pt-1 text-gray-600"></i>
                        <div>
                             {/* TODO: Use shorter address name */}
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{pickup || 'Address unavailable'}</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="text-xl ri-map-pin-2-fill pt-1 text-gray-600"></i>
                        <div>
                            {/* TODO: Use shorter address name */}
                            <h3 className='text-lg font-medium'>Destination</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{destination || 'Address unavailable'}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'>
                        <i className="ri-currency-line text-xl text-gray-600"></i>
                        <div>
                            <h3 className='text-lg font-medium'>
                                {calculatedFare ? `₹${calculatedFare.toFixed(2)}` : 'Fare N/A'}
                            </h3>
                            {/* TODO: Get actual payment method */}
                            <p className='text-sm -mt-1 text-gray-600'>Payment: Cash</p>
                        </div>
                    </div>
                </div>

                {/* Confirm Button */}
                <button
                    onClick={handleConfirm}
                    className='w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg text-lg transition-colors duration-200' // Added hover effect, padding, text size
                >
                    Confirm {getVehicleDisplayName(vehicleType)}
                </button>
                 {/* Back Button (Optional) */}
                 {/* <button
                    onClick={handleBack}
                    className='w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold p-2 rounded-lg text-sm transition-colors duration-200'
                >
                    Change Vehicle
                </button> */}
            </div>
        </div>
    );
};

export default ConfirmRide;