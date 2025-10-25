import React from 'react';

// Assume props pickup, destination, fare, vehicleType, setVehicleFound are passed
const LookingForDriver = (props) => {
    const { pickup, destination, fare, vehicleType, setVehicleFound } = props;

    // TODO: Implement cancel ride request functionality
    const handleCancelSearch = () => {
        console.log("Cancel ride search requested.");
        // Add API call to cancel the ride request on the backend if necessary
        setVehicleFound(false); // Close this panel
    };

    // Determine the correct fare based on the selected vehicle type
    const calculatedFare = fare && vehicleType ? fare[vehicleType] : null;

    // Get a display name for the vehicle type
    const getVehicleDisplayName = (type) => {
        switch (type) {
            case 'car': return 'UberGo Car';
            case 'moto': return 'Uber Moto';
            case 'auto': return 'Uber Auto';
            default: return 'Vehicle';
        }
    };

    // TODO: Get appropriate image based on vehicle type
    const getVehicleImage = (type) => {
        switch (type) {
            case 'car': return "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg";
            case 'moto': return "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png";
            case 'auto': return "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png";
            default: return "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"; // Default image
        }
    };

    return (
        <div className="relative pb-4"> {/* Added relative positioning and padding */}
            {/* Close/Cancel button at the top */}
            <h5 className='p-1 text-center w-[93%] absolute top-0 cursor-pointer' onClick={handleCancelSearch}>
                 <i className="text-3xl text-gray-400 ri-close-line hover:text-gray-600"></i> {/* Changed icon to close */}
            </h5>

            <h3 className='text-2xl font-semibold mb-5 pt-8 text-center'>Looking for a Driver...</h3>

            {/* Loading indicator (optional) */}
            <div className="flex justify-center items-center my-4">
                 {/* You can add a spinner SVG or animation here */}
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>


            <div className='flex gap-2 justify-between flex-col items-center'>
                {/* Vehicle Image */}
                <img className='h-20 object-contain' src={getVehicleImage(vehicleType)} alt={`${getVehicleDisplayName(vehicleType)} icon`} />

                {/* Ride Details */}
                <div className='w-full mt-5 text-left'>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="ri-map-pin-user-fill text-xl pt-1 text-gray-600"></i>
                        <div>
                             {/* TODO: Use a shorter/formatted pickup address name */}
                            <h3 className='text-lg font-medium'>Pickup</h3>
                            <p className='text-sm -mt-1 text-gray-600'>{pickup || 'Address unavailable'}</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-5 p-3 border-b-2'>
                        <i className="text-xl ri-map-pin-2-fill pt-1 text-gray-600"></i>
                        <div>
                            {/* TODO: Use a shorter/formatted destination address name */}
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

                {/* Cancel Button */}
                 <button
                    onClick={handleCancelSearch}
                    className='w-full mt-5 bg-red-600 text-white font-semibold p-2 rounded-lg'
                >
                    Cancel Request
                </button>
            </div>
        </div>
    );
};

export default LookingForDriver;