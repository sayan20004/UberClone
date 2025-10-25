import React, { useEffect, useContext, useState } from 'react'; // Added useState
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { SocketContext } from '../context/SocketContext';
import LiveTracking from '../components/LiveTracking';
// Assuming remixicon CSS is imported globally in main.jsx or index.html

const Riding = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);

    // Get initial ride data from navigation state, provide default structure
    const initialRide = location.state?.ride || {};
    const [ rideDetails, setRideDetails ] = useState(initialRide); // State to hold ride details

    // Safely access nested properties with defaults
    const captainName = rideDetails?.captain?.fullname?.firstname || 'Captain';
    const vehiclePlate = rideDetails?.captain?.vehicle?.plate || 'Plate N/A';
    // TODO: Get vehicle model dynamically
    const vehicleDescription = rideDetails?.captain?.vehicle?.description || 'Vehicle Model'; // Placeholder
    const destinationDisplay = rideDetails?.destination || 'Destination unavailable';
    const fareDisplay = rideDetails?.fare?.toFixed(2) || 'N/A';
    // TODO: Get payment method dynamically
    const paymentMethod = rideDetails?.paymentMethod || 'Cash'; // Placeholder

    useEffect(() => {
        // Redirect if essential ride data is missing on initial load
        if (!rideDetails?._id || !rideDetails?.captain) {
            console.error("Riding page loaded without essential ride data. Redirecting.");
            // Optionally show a message before redirecting
            navigate('/home');
            return; // Stop further execution of the effect
        }

        const handleRideEnded = (endedRideData) => {
            console.log("Ride ended event received:", endedRideData);
            // TODO: Potentially show a ride summary/payment confirmation before navigating
            alert(`Ride ended! Final fare: ₹${endedRideData?.fare?.toFixed(2) || fareDisplay}`); // Simple alert for now
            navigate('/home'); // Navigate back home after ride ends
        };

        // Listen for ride ended event
        socket.on("ride-ended", handleRideEnded);

        // TODO: Listen for 'captain_location_update' events if implemented
        // socket.on('captain_location_update', (locationData) => { ... update map marker ... });

        // Cleanup listener on component unmount
        return () => {
            console.log("Cleaning up Riding socket listeners");
            socket.off("ride-ended", handleRideEnded);
            // socket.off('captain_location_update');
        };
        // Add dependencies: socket, navigate, fareDisplay (for alert fallback)
    }, [socket, navigate, rideDetails, fareDisplay]); // Re-run if rideDetails changes (though unlikely needed here)


    // TODO: Implement Payment functionality
    const handleMakePayment = () => {
        alert(`Payment of ₹${fareDisplay} using ${paymentMethod} (Not Implemented)`);
        // Add actual payment integration logic here
    };

    return (
        // Use flex column for layout
        <div className='h-screen flex flex-col'>
            {/* Home Button */}
            <Link
                to='/home'
                className='fixed right-4 top-4 z-10 h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-100'
                aria-label="Go to Home"
            >
                <i className="text-lg font-medium ri-home-5-line"></i>
            </Link>

            {/* Map Area - takes up remaining space */}
            <div className='flex-grow h-1/2'> {/* Use flex-grow to fill space */}
                {/*
                  TODO: Enhance LiveTracking to show Captain's location marker
                  Pass captain's initial location and update via socket events
                */}
                <LiveTracking />
            </div>

            {/* Ride Details Area - fixed height */}
            <div className='h-1/2 p-4 bg-white shadow-lg rounded-t-xl flex flex-col'> {/* Added flex-col */}
                {/* Captain Info */}
                <div className='flex items-center justify-between mb-4'>
                     {/* TODO: Use dynamic vehicle image */}
                    <img className='h-12 object-contain' src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg" alt="Vehicle" />
                    <div className='text-right'>
                        <h2 className='text-lg font-medium capitalize'>{captainName}</h2>
                        <h4 className='text-xl font-semibold -mt-1 -mb-1'>{vehiclePlate}</h4>
                        <p className='text-sm text-gray-600'>{vehicleDescription}</p>
                    </div>
                </div>

                {/* Destination and Fare Info */}
                <div className='flex-grow overflow-y-auto mb-4'> {/* Allow scrolling if content overflows */}
                    <div className='flex items-start gap-5 p-3 border-b-2'> {/* items-start for alignment */}
                        <i className="text-xl ri-map-pin-2-fill pt-1 text-gray-600"></i>
                        <div>
                            <h3 className='text-lg font-medium'>Destination</h3>
                             {/* TODO: Use shorter address name */}
                            <p className='text-sm -mt-1 text-gray-600'>{destinationDisplay}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 p-3'> {/* items-center is fine here */}
                        <i className="ri-currency-line text-xl text-gray-600"></i>
                        <div>
                            <h3 className='text-lg font-medium'>₹{fareDisplay}</h3>
                            <p className='text-sm -mt-1 text-gray-600'>Payment: {paymentMethod}</p>
                        </div>
                    </div>
                    {/* Add more details if needed, e.g., ETA */}
                </div>

                {/* Payment Button - Pushed to bottom */}
                <button
                    onClick={handleMakePayment}
                    className='w-full mt-auto bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg text-lg transition-colors duration-200'
                >
                    Make Payment {/* Or "Complete Payment" if ride ended */}
                </button>
            </div>
        </div>
    );
};

export default Riding;