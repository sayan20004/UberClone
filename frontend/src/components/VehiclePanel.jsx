import React from 'react';

// Assume props: fare ({ car: ..., moto: ..., auto: ... }), setVehiclePanel, setConfirmRidePanel, selectVehicle (function)
const VehiclePanel = (props) => {
    const { fare, setVehiclePanel, setConfirmRidePanel, selectVehicle } = props;

    // Helper to get vehicle details (could be moved to a config file)
    const vehicleDetails = {
        car: {
            name: "UberGo",
            capacity: 4,
            description: "Affordable, compact rides",
            imageUrl: "https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg",
            // TODO: Add dynamic 'mins away' based on nearby drivers
            minsAway: 2
        },
        moto: {
            name: "Moto",
            capacity: 1,
            description: "Affordable motorcycle rides",
            imageUrl: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_638,w_956/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png",
            minsAway: 3
        },
        auto: {
            name: "UberAuto",
            capacity: 3,
            description: "Affordable Auto rides",
            imageUrl: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png",
            minsAway: 3
        }
    };

    // Handler for selecting a vehicle
    const handleVehicleSelect = (vehicleType) => {
        selectVehicle(vehicleType); // Set the selected vehicle type in parent state (Home.jsx)
        setConfirmRidePanel(true); // Open the confirm ride panel
        setVehiclePanel(false); // Close this panel
    };

    // Handler to close the panel (go back)
    const handleClose = () => {
        setVehiclePanel(false);
    };

    // Function to render a single vehicle option
    const renderVehicleOption = (type) => {
        const details = vehicleDetails[type];
        // Ensure fare is available before rendering
        const vehicleFare = fare && fare[type] !== undefined ? fare[type] : null;

        return (
            <div
                key={type}
                // Only make clickable if fare is available
                onClick={vehicleFare !== null ? () => handleVehicleSelect(type) : undefined}
                className={`flex border-2 ${vehicleFare !== null ? 'hover:border-black active:border-black cursor-pointer' : 'opacity-50 cursor-not-allowed'} mb-2 rounded-xl w-full p-3 items-center justify-between transition-colors duration-150`}
                aria-label={`Select ${details.name}, Fare ${vehicleFare !== null ? `₹${vehicleFare.toFixed(2)}` : 'unavailable'}`}
                role={vehicleFare !== null ? 'button' : undefined}
                tabIndex={vehicleFare !== null ? 0 : -1} // Make it focusable if clickable
            >
                <img className='h-10 w-16 object-contain flex-shrink-0' src={details.imageUrl} alt={`${details.name} icon`} /> {/* Added flex-shrink-0 */}
                <div className='ml-3 flex-grow text-left'> {/* Use flex-grow, align left */}
                    <h4 className='font-medium text-base'>
                        {details.name}
                        <span className="ml-1 text-gray-600"><i className="ri-user-3-fill text-xs"></i> {details.capacity}</span>
                    </h4>
                    {/* TODO: Update minsAway dynamically */}
                    <h5 className='font-medium text-sm'>{details.minsAway} mins away</h5>
                    <p className='font-normal text-xs text-gray-600'>{details.description}</p>
                </div>
                <h2 className={`text-lg font-semibold ml-2 ${vehicleFare === null ? 'text-gray-400' : ''}`}>
                    {vehicleFare !== null ? `₹${vehicleFare.toFixed(2)}` : 'N/A'}
                </h2>
            </div>
        );
    };

    return (
        <div className="relative pb-4"> {/* Added relative positioning and padding */}
            {/* Close button */}
            <h5 className='p-1 text-center w-[93%] absolute top-0 cursor-pointer' onClick={handleClose}>
                <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600"></i>
            </h5>

            <h3 className='text-2xl font-semibold mb-5 pt-8 text-center'>Choose a Vehicle</h3>

            {/* Render vehicle options */}
            {renderVehicleOption('car')}
            {renderVehicleOption('moto')}
            {renderVehicleOption('auto')}

            {/* Show message if fares are not loaded */}
            {Object.keys(fare).length === 0 && (
                 <p className="text-center text-gray-500 mt-4">Calculating fares...</p>
            )}

        </div>
    );
};

export default VehiclePanel;