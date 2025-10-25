import React, { useEffect, useRef, useState, useContext } from 'react'; // Added useContext
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import axios from 'axios';
import 'remixicon/fonts/remixicon.css';
import LocationSearchPanel from '../components/LocationSearchPanel';
import VehiclePanel from '../components/VehiclePanel';
import ConfirmRide from '../components/ConfirmRide';
import LookingForDriver from '../components/LookingForDriver';
import WaitingForDriver from '../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import LiveTracking from '../components/LiveTracking';

const Home = () => {
    // Location State
    const [ pickup, setPickup ] = useState('');
    const [ destination, setDestination ] = useState('');
    const [ pickupSuggestions, setPickupSuggestions ] = useState([]);
    const [ destinationSuggestions, setDestinationSuggestions ] = useState([]);
    const [ activeField, setActiveField ] = useState(null); // 'pickup' or 'destination'

    // Panel Animation Refs & State
    const panelRef = useRef(null);
    const panelCloseRef = useRef(null); // Ref for close button visibility
    const vehiclePanelRef = useRef(null);
    const confirmRidePanelRef = useRef(null);
    const vehicleFoundRef = useRef(null); // Renamed from lookingForDriverRef for clarity
    const waitingForDriverRef = useRef(null);

    const [ panelOpen, setPanelOpen ] = useState(false); // Location search panel
    const [ vehiclePanel, setVehiclePanel ] = useState(false); // Choose vehicle panel
    const [ confirmRidePanel, setConfirmRidePanel ] = useState(false); // Confirm ride details panel
    const [ vehicleFound, setVehicleFound ] = useState(false); // Looking for driver panel
    const [ waitingForDriver, setWaitingForDriver ] = useState(false); // Driver assigned panel

    // Ride State
    const [ fare, setFare ] = useState({}); // Stores { auto: ..., car: ..., moto: ... }
    const [ vehicleType, setVehicleType ] = useState(null); // 'auto', 'car', 'moto'
    const [ ride, setRide ] = useState(null); // Stores the ride object from backend

    // UI State
    const [ error, setError ] = useState(''); // Generic error message state
    const [ suggestionError, setSuggestionError ] = useState(''); // Specific error for suggestions
    const [ fareError, setFareError ] = useState(''); // Specific error for fare calculation
    const [ rideCreationError, setRideCreationError ] = useState(''); // Specific error for ride creation

    // Hooks
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const { user } = useContext(UserDataContext); // Assuming user context has user._id

    // GSAP Animations (using useGSAP hook)
    useGSAP(() => {
        gsap.to(panelRef.current, { height: panelOpen ? '70%' : '0%', padding: panelOpen ? 24 : 0, duration: 0.3 });
        gsap.to(panelCloseRef.current, { opacity: panelOpen ? 1 : 0, duration: 0.3 });
    }, [ panelOpen ]);

    useGSAP(() => {
        gsap.to(vehiclePanelRef.current, { y: vehiclePanel ? '0%' : '100%', duration: 0.3 });
    }, [ vehiclePanel ]);

    useGSAP(() => {
        gsap.to(confirmRidePanelRef.current, { y: confirmRidePanel ? '0%' : '100%', duration: 0.3 });
    }, [ confirmRidePanel ]);

    useGSAP(() => {
        gsap.to(vehicleFoundRef.current, { y: vehicleFound ? '0%' : '100%', duration: 0.3 });
    }, [ vehicleFound ]);

    useGSAP(() => {
        gsap.to(waitingForDriverRef.current, { y: waitingForDriver ? '0%' : '100%', duration: 0.3 });
    }, [ waitingForDriver ]);


    // Socket Event Listeners
    useEffect(() => {
        if (!socket || !user?._id) return; // Ensure socket and user are available

        console.log(`Socket joining with user ID: ${user._id}`);
        socket.emit("join", { userType: "user", userId: user._id });

        const handleRideConfirmed = (confirmedRide) => {
            console.log('Ride confirmed:', confirmedRide);
            setRide(confirmedRide); // Store the confirmed ride details
            setVehicleFound(false); // Close looking panel
            setWaitingForDriver(true); // Open waiting panel
        };

        const handleRideStarted = (startedRide) => {
            console.log("Ride started:", startedRide);
            setWaitingForDriver(false); // Close waiting panel
            // Pass the latest ride data (which might include captain details, etc.)
            navigate('/riding', { state: { ride: startedRide } });
        };

        socket.on('ride-confirmed', handleRideConfirmed);
        socket.on('ride-started', handleRideStarted);

        // Cleanup function
        return () => {
            console.log("Cleaning up Home socket listeners");
            socket.off('ride-confirmed', handleRideConfirmed);
            socket.off('ride-started', handleRideStarted);
            // Optionally emit a 'leave' event if needed by backend
            // socket.emit("leave", { userType: "user", userId: user._id });
        };
        // Re-run if socket connection changes or user ID changes
    }, [ socket, user?._id, navigate ]);

    // Debounce function (simple implementation)
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // Fetch Suggestions Function (Debounced)
    const fetchSuggestions = async (inputValue, fieldType) => {
        if (!inputValue || inputValue.length < 3) { // Only fetch if input is long enough
             if (fieldType === 'pickup') setPickupSuggestions([]);
             else setDestinationSuggestions([]);
             setSuggestionError(''); // Clear error on short input
             return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('User not authenticated'); // Handle missing token

            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: inputValue },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (fieldType === 'pickup') {
                setPickupSuggestions(response.data || []);
            } else {
                setDestinationSuggestions(response.data || []);
            }
            setSuggestionError(''); // Clear error on success
        } catch (err) {
            console.error(`Error fetching ${fieldType} suggestions:`, err.response?.data || err.message);
            setSuggestionError(`Could not fetch ${fieldType} suggestions.`);
             // Clear suggestions on error
             if (fieldType === 'pickup') setPickupSuggestions([]);
             else setDestinationSuggestions([]);
        }
    };

     // Create debounced versions of the fetch function
    const debouncedFetchPickup = debounce(fetchSuggestions, 300); // 300ms delay
    const debouncedFetchDestination = debounce(fetchSuggestions, 300);

    // Input Change Handlers
    const handlePickupChange = (e) => {
        const value = e.target.value;
        setPickup(value);
        setActiveField('pickup'); // Ensure active field is set
        setPanelOpen(true);      // Open panel on change
        debouncedFetchPickup(value, 'pickup');
    };

    const handleDestinationChange = (e) => {
        const value = e.target.value;
        setDestination(value);
         setActiveField('destination');
         setPanelOpen(true);
        debouncedFetchDestination(value, 'destination');
    };

    // Form Submission (prevents default page reload)
    const submitHandler = (e) => {
        e.preventDefault();
        // Usually triggers 'findTrip' via button click, not form submit directly
        console.log("Form submit prevented.");
    };

     // Find Trip (Fetch Fare)
     const findTrip = async () => {
         setError(''); // Clear general errors
         setFareError(''); // Clear specific fare error
         setFare({}); // Clear previous fares

         if (!pickup || !destination) {
             setError('Please enter both pickup and destination.');
             return;
         }

         try {
             const token = localStorage.getItem('token');
             if (!token) throw new Error('User not authenticated');

             const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
                 params: { pickup, destination },
                 headers: { Authorization: `Bearer ${token}` }
             });

             if (response.status === 200 && response.data) {
                 setFare(response.data);
                 setPanelOpen(false); // Close location search
                 setVehiclePanel(true); // Open vehicle selection
             } else {
                  console.warn("Unexpected fare response:", response);
                  setFareError('Could not get fare information.');
             }
         } catch (err) {
             console.error("Error fetching fare:", err.response?.data || err.message);
              if (err.response?.status === 401) {
                  setError('Authentication failed. Please log in again.');
              } else if (err.response?.status === 404) {
                   setFareError('Could not calculate fare for the selected locations.');
              } else {
                   setFareError(err.response?.data?.message || 'Failed to get fare. Please try again.');
              }
         }
     };

     // Create Ride Request
     const createRide = async () => {
         setRideCreationError(''); // Clear specific error

         if (!pickup || !destination || !vehicleType) {
             setRideCreationError('Missing ride details. Please select locations and vehicle type.');
             return;
         }

         try {
             const token = localStorage.getItem('token');
             if (!token) throw new Error('User not authenticated');

             const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
                 pickup,
                 destination,
                 vehicleType
             }, {
                 headers: { Authorization: `Bearer ${token}` }
             });

             if (response.status === 201 && response.data) {
                  console.log("Ride creation successful:", response.data);
                  // Backend now sends socket event to captains.
                  // Frontend transitions to 'LookingForDriver' panel.
                  setConfirmRidePanel(false); // Close confirm panel
                  setVehicleFound(true); // Open looking panel
                  // We don't store the initial ride response here, wait for 'ride-confirmed'
             } else {
                  console.warn("Unexpected ride creation response:", response);
                  setRideCreationError('Could not create ride request. Unexpected server response.');
             }

         } catch (err) {
             console.error("Error creating ride:", err.response?.data || err.message);
              if (err.response?.status === 401) {
                  setError('Authentication failed. Please log in again.'); // Use general error for auth
              } else {
                  setRideCreationError(err.response?.data?.message || 'Failed to create ride request. Please try again.');
              }
               // Keep panels open on error for user feedback
               // setConfirmRidePanel(false);
               // setVehicleFound(false);
         }
     };

     // Handle selection from LocationSearchPanel
     const handleSuggestionSelect = (suggestion) => {
         if (activeField === 'pickup') {
             setPickup(suggestion);
             setPickupSuggestions([]); // Clear suggestions after selection
         } else if (activeField === 'destination') {
             setDestination(suggestion);
             setDestinationSuggestions([]); // Clear suggestions
         }
         // Keep panel open maybe? Or close if both filled?
         // setPanelOpen(false); // Close panel after selection
         // Check if both fields are now filled and potentially trigger fare calculation
         if ((activeField === 'pickup' && destination) || (activeField === 'destination' && pickup)) {
             // Optionally auto-trigger findTrip or wait for button click
         }
     };


    return (
        <div className='h-screen relative overflow-hidden'>
            {/* Logo */}
            <img className='w-16 absolute left-5 top-5 z-10' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" />

            {/* Map Area */}
            <div className='h-screen w-screen absolute top-0 left-0 z-0'>
                <LiveTracking />
            </div>

            {/* Input & Panel Area */}
            <div className='flex flex-col justify-end h-screen absolute top-0 w-full z-10 pointer-events-none'> {/* Disable pointer events on container */}
                {/* Main Input Box */}
                <div className='h-[30%] p-6 bg-white relative pointer-events-auto'> {/* Enable pointer events here */}
                     {/* Close button for location panel (conditionally rendered by animation) */}
                    <h5 ref={panelCloseRef} onClick={() => setPanelOpen(false)} className='absolute opacity-0 right-6 top-6 text-2xl cursor-pointer'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold mb-3'>Find a trip</h4> {/* Added margin */}
                     {error && <p className="text-red-500 text-xs mb-2">{error}</p>} {/* General Error */}
                    <form className='relative' onSubmit={submitHandler}>
                        {/* Decorative line */}
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full z-0"></div>
                        {/* Pickup Input */}
                        <input
                            onClick={() => { setPanelOpen(true); setActiveField('pickup'); }} // Focus sets active field and opens panel
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-3 text-lg rounded-lg w-full relative z-10' // Increased padding, z-index
                            type="text"
                            placeholder='Add a pick-up location'
                            aria-label="Pick-up location"
                        />
                         {/* Destination Input */}
                        <input
                             onClick={() => { setPanelOpen(true); setActiveField('destination'); }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-3 text-lg rounded-lg w-full mt-3 relative z-10' // Increased padding, z-index
                            type="text"
                            placeholder='Enter your destination'
                            aria-label="Destination"
                         />
                    </form>
                    <button
                        onClick={findTrip}
                        className='bg-black text-white px-4 py-3 rounded-lg mt-4 w-full text-lg font-semibold disabled:opacity-50' // Increased size
                        disabled={!pickup || !destination} // Disable if locations not set
                    >
                        Find Trip
                    </button>
                    {fareError && <p className="text-red-500 text-xs mt-2">{fareError}</p>}
                </div>

                {/* Location Search Sliding Panel */}
                <div ref={panelRef} className='bg-white h-0 overflow-y-auto pointer-events-auto'> {/* Enable scroll and pointer events */}
                    {suggestionError && <p className="text-red-500 text-xs px-6 pt-2">{suggestionError}</p>}
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        onSuggestionClick={handleSuggestionSelect} // Pass handler function
                        // Removed unused props like setPanelOpen, setVehiclePanel
                        // setPickup={setPickup} // Handled by onSuggestionClick
                        // setDestination={setDestination} // Handled by onSuggestionClick
                        activeField={activeField}
                    />
                </div>
            </div>

             {/* Vehicle Panel */}
            <div ref={vehiclePanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-4 py-6 pt-12 shadow-lg rounded-t-xl pointer-events-auto'> {/* Increased z-index */}
                <VehiclePanel
                    selectVehicle={setVehicleType} // Pass setter function
                    fare={fare}
                    setConfirmRidePanel={setConfirmRidePanel} // To open next panel
                    setVehiclePanel={setVehiclePanel} // To close self
                />
            </div>

            {/* Confirm Ride Panel */}
            <div ref={confirmRidePanelRef} className='fixed w-full z-30 bottom-0 translate-y-full bg-white px-4 py-6 pt-12 shadow-lg rounded-t-xl pointer-events-auto'> {/* Increased z-index */}
                <ConfirmRide
                    createRide={createRide} // Pass create ride function
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setConfirmRidePanel={setConfirmRidePanel} // To close self
                    setVehicleFound={setVehicleFound} // To open next panel (renamed for clarity)
                />
                 {rideCreationError && <p className="text-red-500 text-xs mt-2 px-4">{rideCreationError}</p>}
            </div>

             {/* Looking For Driver Panel */}
            <div ref={vehicleFoundRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white px-4 py-6 pt-12 shadow-lg rounded-t-xl pointer-events-auto'> {/* Increased z-index */}
                {/* Passing necessary details to display */}
                <LookingForDriver
                    pickup={pickup}
                    destination={destination}
                    fare={fare}
                    vehicleType={vehicleType}
                    setVehicleFound={setVehicleFound} // To close self (e.g., on cancel)
                    // TODO: Add cancel ride request functionality here
                />
            </div>

            {/* Waiting For Driver Panel */}
            <div ref={waitingForDriverRef} className='fixed w-full z-50 bottom-0 translate-y-full bg-white px-4 py-6 pt-12 shadow-lg rounded-t-xl pointer-events-auto'> {/* Increased z-index */}
                <WaitingForDriver
                    ride={ride} // Pass the confirmed ride object
                    // Removed setVehicleFound as it's not relevant here
                    setWaitingForDriver={setWaitingForDriver} // To close self (e.g., on cancel)
                     // TODO: Add cancel ride functionality here if needed
                    // waitingForDriver={waitingForDriver} // Prop might not be needed inside component
                 />
            </div>
        </div>
    );
};

export default Home;