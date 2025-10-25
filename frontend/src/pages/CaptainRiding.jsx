import React, { useRef, useState, useEffect } from 'react'; // Added useEffect
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import FinishRide from '../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LiveTracking from '../components/LiveTracking';

const CaptainRiding = () => {
    // Panel State & Ref
    const [ finishRidePanel, setFinishRidePanel ] = useState(false);
    const finishRidePanelRef = useRef(null);

    // Hooks
    const location = useLocation();
    const navigate = useNavigate();

    // Get ride data from navigation state, ensure it exists
    const rideData = location.state?.ride;

    // Redirect if ride data is missing
    useEffect(() => {
        if (!rideData?._id) {
            console.error("CaptainRiding loaded without ride data. Redirecting.");
            // Optionally show an error message briefly before redirecting
            navigate('/captain-home');
        }
    }, [rideData, navigate]);

    // GSAP Animation
    useGSAP(() => {
        // Ensure ref is current before animating
        if (finishRidePanelRef.current) {
            gsap.to(finishRidePanelRef.current, {
                y: finishRidePanel ? '0%' : '100%', // Use 'y' for vertical translate
                duration: 0.3
            });
        }
    }, [ finishRidePanel ]); // Dependency array includes panel state


    // Simple function to toggle the finish panel
    const toggleFinishPanel = () => {
        setFinishRidePanel(prevState => !prevState);
    }

    // Return null or a loading indicator if rideData is initially missing to prevent errors
    if (!rideData?._id) {
        return <div className="p-4 text-center">Loading ride data...</div>; // Or redirect immediately
    }

    // Safely access data for display (optional chaining and defaults)
    const pickupDisplay = rideData.pickup || 'Pickup N/A';
    // TODO: Calculate remaining distance/ETA dynamically
    const distanceAwayDisplay = 'Calculating...'; // Placeholder

    return (
        // Changed main div structure for clarity and map positioning
        <div className='h-screen relative flex flex-col'>

            {/* Header */}
            <div className='fixed p-6 top-0 flex items-center justify-between w-full z-20 bg-gradient-to-b from-white via-white/80 to-transparent'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" />
                {/* Logout Link */}
                <Link to='/captain/logout' className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-100' aria-label="Logout">
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

            {/* Map Area fills remaining space */}
             <div className='flex-grow h-4/5 pt-20 z-0'> {/* Adjust height/padding as needed */}
                 {/*
                   TODO: Enhance LiveTracking for CaptainRiding:
                   - Show Captain's current position (already does this).
                   - Show Pickup marker.
                   - Show Destination marker.
                   - Show route polyline.
                   - Update route/ETA based on captain's movement.
                 */}
                 <LiveTracking />
             </div>


            {/* Bottom Panel Toggle */}
            <div
                className='h-1/5 p-6 flex items-center justify-between relative bg-yellow-400 pt-10 z-10 cursor-pointer shadow-lg rounded-t-xl' // Added cursor, shadow, rounded top
                onClick={toggleFinishPanel} // Click anywhere on this bar to open/close panel
            >
                {/* Up/Down Arrow Indicator */}
                 <div className='absolute top-1 left-1/2 transform -translate-x-1/2 p-1 text-center w-full'>
                    <i className={`text-3xl text-gray-800 ${finishRidePanel ? 'ri-arrow-down-wide-line' : 'ri-arrow-up-wide-line'}`}></i>
                 </div>

                {/* Display simplified info like distance/ETA to destination */}
                <h4 className='text-xl font-semibold'>
                    {/* Display different text based on panel state */}
                    {finishRidePanel ? 'Close Ride Summary' : `Drop-off: ${pickupDisplay}`} {/* Show destination */}
                    {/* {`ETA: ${distanceAwayDisplay}`} */}
                </h4>
                {/* Button text changes based on panel state */}
                <button
                    className='bg-green-600 text-white font-semibold p-3 px-6 rounded-lg' // Adjusted padding
                    // Prevent button click from closing panel immediately if panel is open
                    onClick={(e) => { if (finishRidePanel) e.stopPropagation(); else toggleFinishPanel(); }}
                >
                    {finishRidePanel ? 'Close' : 'View Ride Details'}
                </button>
            </div>

            {/* Finish Ride Sliding Panel */}
            <div
                ref={finishRidePanelRef}
                // Increased z-index to ensure it's above the toggle bar
                className='fixed w-full h-auto max-h-[80vh] z-50 bottom-0 translate-y-full bg-white px-4 py-6 pt-12 shadow-lg rounded-t-xl overflow-y-auto pointer-events-auto' // Added max-height, overflow, pointer-events
            >
                {/* Pass ride data and the function to close the panel */}
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel}
                />
            </div>

        </div>
    );
};

export default CaptainRiding;