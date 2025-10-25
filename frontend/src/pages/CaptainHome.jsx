import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CaptainDetails from '../components/CaptainDetails';
import RidePopUp from '../components/RidePopUp';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';
import { SocketContext } from '../context/SocketContext';
import { CaptainDataContext } from '../context/CaptainContext';
import axios from 'axios';
import LiveTracking from '../components/LiveTracking';

// Constants for location settings
const GEOLOCATION_OPTIONS = {
    enableHighAccuracy: false, // Keep this false to prioritize speed
    timeout: 20000,          // 20 second timeout
    maximumAge: 30000        // Accept positions up to 30 seconds old
};
const RETRY_LOCATION_INTERVAL = 30000; // Retry getting location every 30 seconds if watch fails

const CaptainHome = () => {
    // Panel State & Refs
    const [ ridePopupPanel, setRidePopupPanel ] = useState(false);
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false);
    const ridePopupPanelRef = useRef(null);
    const confirmRidePopupPanelRef = useRef(null);

    // Ride & Captain State
    const [ currentRide, setCurrentRide ] = useState(null);
    const [ error, setError ] = useState('');
    const [ locationError, setLocationError ] = useState('');
    const [ isOnline, setIsOnline ] = useState(false); // Tracks if we *believe* we are successfully sending location

    // Hooks
    const { socket } = useContext(SocketContext);
    const { captain } = useContext(CaptainDataContext);
    const navigate = useNavigate();
    const locationRetryTimer = useRef(null); // Ref for the retry interval timer

    // GSAP Animations (Keep as is)
    useGSAP(() => { gsap.to(ridePopupPanelRef.current, { y: ridePopupPanel ? '0%' : '100%', duration: 0.3 }); }, [ ridePopupPanel ]);
    useGSAP(() => { gsap.to(confirmRidePopupPanelRef.current, { y: confirmRidePopupPanel ? '0%' : '100%', duration: 0.3 }); }, [ confirmRidePopupPanel ]);


    // Socket Event Listeners & Location Updates
    useEffect(() => {
        if (!socket || !captain?._id) {
            console.log("CaptainHome useEffect: Waiting for socket and captain data...");
            return;
        }

        console.log(`CaptainHome useEffect: Socket connected and Captain ID ${captain._id} available. Joining...`);
        socket.emit('join', { userId: captain._id, userType: 'captain' });
        console.log(`Emitted join event for captain ${captain._id}`);

        // --- Location Update Logic ---
        let watchId = null;

        const updateLocation = (latitude, longitude, isRetry = false) => {
            // Only clear the error if it's a *new* update, not just a retry potentially getting the same old data
            if (!isRetry || locationError) {
                 setLocationError(''); // Clear error on successful update
            }
            if (socket.connected) {
                socket.emit('update-location-captain', {
                    userId: captain._id,
                    location: { ltd: latitude, lng: longitude }
                });
                if (!isOnline) setIsOnline(true); // Mark as online if sending updates
            } else {
                console.warn("Socket disconnected, cannot send location update.");
                setLocationError("Connection issue. Trying to reconnect...");
                setIsOnline(false);
            }
        };

        const handleLocationError = (err, isInitialAttempt = false) => {
            console.error(`Geolocation Error (${isInitialAttempt ? 'Initial' : 'Watch'}):`, err.code, err.message);
            let message = "Could not get location.";
             switch(err.code) {
                // ... (keep case messages as before) ...
                 case err.PERMISSION_DENIED: message = "Location permission denied. Please enable it."; break;
                 case err.POSITION_UNAVAILABLE: message = "Location unavailable. Check signal/settings."; break;
                 case err.TIMEOUT: message = "Timeout getting location. Check signal/settings."; break; // Slightly rephrased
                 default: message = "Unknown location error."; break;
            }
            setLocationError(`Location error: ${message}`);
            setIsOnline(false); // Mark as offline on error

            // If watchPosition fails, clear it and start the retry timer
            if (!isInitialAttempt && watchId !== null) {
                console.log("watchPosition failed, clearing watch and starting retry timer.");
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
                // Start periodic retries using getCurrentPosition
                if (locationRetryTimer.current === null) {
                    locationRetryTimer.current = setInterval(attemptLocationRetry, RETRY_LOCATION_INTERVAL);
                    attemptLocationRetry(); // Attempt immediately once
                }
            } else if (isInitialAttempt) {
                 // If initial getCurrentPosition fails, also start the retry timer
                  if (locationRetryTimer.current === null) {
                    locationRetryTimer.current = setInterval(attemptLocationRetry, RETRY_LOCATION_INTERVAL);
                    attemptLocationRetry(); // Attempt immediately once
                }
            }
        };

        // Function to attempt getting location with getCurrentPosition (for retries)
        const attemptLocationRetry = () => {
             if (!navigator.geolocation) return; // Should not happen if initial check passed, but safe check
             console.log("Attempting location retry via getCurrentPosition...");
             navigator.geolocation.getCurrentPosition(
                position => {
                    console.log("Location obtained via retry.");
                    updateLocation(position.coords.latitude, position.coords.longitude, true); // Pass true for isRetry
                    // If retry succeeds, stop the timer and try starting watchPosition again
                    if (locationRetryTimer.current !== null) {
                        clearInterval(locationRetryTimer.current);
                        locationRetryTimer.current = null;
                    }
                    startWatchingPosition(); // Try to restart watchPosition
                },
                err => {
                    // Don't restart the timer here, handleLocationError might do it if needed
                    handleLocationError(err, false); // Pass false for isInitialAttempt
                    console.error("Location retry failed.");
                },
                GEOLOCATION_OPTIONS // Use defined options
            );
        };

         // Function to start watchPosition
         const startWatchingPosition = () => {
             if (!navigator.geolocation || watchId !== null) return; // Don't start if already watching or no geolocation
             console.log("Attempting to start watching position...");
              watchId = navigator.geolocation.watchPosition(
                    position => {
                        // If watch succeeds after retries, clear the retry timer
                         if (locationRetryTimer.current !== null) {
                            console.log("watchPosition succeeded, clearing retry timer.");
                            clearInterval(locationRetryTimer.current);
                            locationRetryTimer.current = null;
                         }
                        updateLocation(position.coords.latitude, position.coords.longitude);
                    },
                    err => handleLocationError(err, false), // isInitialAttempt = false
                    GEOLOCATION_OPTIONS
                );
            console.log("Started watching position with ID:", watchId);
         };


        const startLocationUpdates = () => {
             console.log("Starting location updates process...");
             setError('');
             setLocationError('');
             if (navigator.geolocation) {
                // Try initial location
                navigator.geolocation.getCurrentPosition(
                    position => {
                        console.log("Initial position obtained.");
                        updateLocation(position.coords.latitude, position.coords.longitude);
                        startWatchingPosition(); // Start watching after initial success
                    },
                    err => {
                        handleLocationError(err, true); // isInitialAttempt = true
                        console.error("Could not get initial captain location.");
                        // Retry timer is started within handleLocationError if initial fails
                    },
                   GEOLOCATION_OPTIONS // Use defined options
                );
             } else {
                 console.error("Geolocation not supported.");
                 setLocationError("Geolocation not supported by this browser.");
                 setIsOnline(false);
             }
         };

        const stopLocationUpdates = () => {
             console.log("Stopping location updates...");
             setIsOnline(false);
             if (watchId !== null && navigator.geolocation) {
                 navigator.geolocation.clearWatch(watchId);
                 watchId = null;
                 console.log("Cleared geolocation watch.");
             }
             // Clear retry timer if it's running
             if (locationRetryTimer.current !== null) {
                 clearInterval(locationRetryTimer.current);
                 locationRetryTimer.current = null;
                 console.log("Cleared location retry timer.");
             }
             // Optionally tell backend captain is offline
             // if (socket.connected) { socket.emit('captain_offline', { userId: captain._id }); }
         };

        // Start updates
        startLocationUpdates();


        // --- New Ride Listener (Keep as is) ---
        const handleNewRide = (rideData) => { /* ... */ };
        socket.on('new-ride', handleNewRide);

        // --- Cleanup ---
        return () => {
            console.log(`Cleaning up CaptainHome for captain ${captain?._id}: stopping location, removing listeners.`);
            stopLocationUpdates(); // This now clears watch and retry timer
            socket.off('new-ride', handleNewRide);
        };
    }, [ socket, captain?._id, navigate, confirmRidePopupPanel ]); // Keep dependencies


    // --- Ride Acceptance/Ignore/Cancel Functions (Keep As Is) ---
    const acceptRide = async () => { /* ... */ };
    const ignoreRide = () => { /* ... */ };
    const cancelRideConfirmation = () => { /* ... */ };


    // --- Render Logic ---
    return (
        <div className='h-screen flex flex-col'>
            {/* Header */}
            <div className='fixed p-6 top-0 flex items-center justify-between w-full z-10 bg-gradient-to-b from-white via-white/80 to-transparent'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo" />
                <Link to='/captain/logout' className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-100' aria-label="Logout">
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>

             {/* Map Area */}
             <div className='flex-grow h-3/5 pt-20'>
                <LiveTracking />
            </div>

            {/* Captain Details Area */}
            <div className='h-2/5 p-6 bg-white shadow-lg rounded-t-xl z-10'>
                 {/* Status Indicator */}
                <div className="text-center mb-4">
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${isOnline ? 'bg-green-100 text-green-800' : (locationError ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')}`}>
                         {isOnline ? 'Online - Receiving Requests' : (locationError ? 'Tracking Location...' : 'Offline')}
                    </span>
                     {/* Displaying specific error below now */}
                </div>
                 {/* Display Errors */}
                {error && <p className="text-red-500 text-xs mb-2 text-center">{error}</p>}
                {locationError && <p className="text-yellow-600 text-xs mb-2 text-center">{locationError}</p>}

                {captain ? <CaptainDetails /> : <p>Loading captain details...</p>}
            </div>

            {/* Ride Popups (Keep As Is) */}
            <div ref={ridePopupPanelRef} className='fixed w-full z-20 bottom-0 translate-y-full bg-white px-4 py-6 pt-12 shadow-lg rounded-t-xl pointer-events-auto'>
                <RidePopUp
                    ride={currentRide}
                    setRidePopupPanel={setRidePopupPanel}
                    confirmRide={acceptRide}
                    ignoreRide={ignoreRide}
                />
            </div>
            <div ref={confirmRidePopupPanelRef} className='fixed w-full h-screen z-30 bottom-0 translate-y-full bg-white px-4 py-6 pt-12 shadow-lg rounded-t-xl pointer-events-auto overflow-y-auto'>
                <ConfirmRidePopUp
                    ride={currentRide}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    cancelConfirmation={cancelRideConfirmation}
                />
            </div>
        </div>
    );
};

export default CaptainHome;