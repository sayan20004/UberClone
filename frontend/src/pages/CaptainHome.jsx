import React, { useRef, useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import CaptainDetails from '../components/CaptainDetails';
import RidePopUp from '../components/RidePopUp';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ConfirmRidePopUp from '../components/ConfirmRidePopUp';
import { SocketContext } from '../context/SocketContext';
import { CaptainDataContext } from '../context/CapatainContext';
import axios from 'axios';

const CaptainHome = () => {
    const [ ridePopupPanel, setRidePopupPanel ] = useState(false);
    const [ confirmRidePopupPanel, setConfirmRidePopupPanel ] = useState(false);
    const ridePopupPanelRef = useRef(null);
    const confirmRidePopupPanelRef = useRef(null);
    const [ ride, setRide ] = useState(null);
    const [ locationError, setLocationError ] = useState(null); // Added state for location errors

    const { socket } = useContext(SocketContext);
    const { captain } = useContext(CaptainDataContext);

    // Geolocation options
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0 // Don't use cached location
    };

    // Function to handle geolocation errors
    const handleGeoError = (error) => {
        console.error("Geolocation Error:", error.code, error.message);
        let errorMessage = "Could not determine location.";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Please enable it in your browser settings.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable. Check your signal or try again later."; // kCLErrorLocationUnknown maps to this
                break;
            case error.TIMEOUT:
                errorMessage = "The request to get user location timed out.";
                break;
            default:
                errorMessage = "An unknown error occurred while getting location.";
                break;
        }
        setLocationError(errorMessage); // Update state to potentially show error to user
    };

    // Effect for Socket connection and location updates
    useEffect(() => {
        if (!captain?._id) return; // Don't run if captain data isn't loaded yet

        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        });

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLocationError(null); // Clear previous errors
                        const { latitude, longitude } = position.coords;
                        console.log('Captain Position updated:', latitude, longitude); // Log update
                        socket.emit('update-location-captain', {
                            userId: captain._id,
                            location: {
                                ltd: latitude,
                                lng: longitude
                            }
                        });
                    },
                    handleGeoError, // Use the error handler
                    geoOptions      // Use defined options
                );
            } else {
                setLocationError("Geolocation is not supported by this browser.");
            }
        };

        // Update immediately and then set interval
        updateLocation();
        const locationInterval = setInterval(updateLocation, 10000); // Update every 10 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(locationInterval);

    }, [ captain, socket ]); // Rerun effect if captain or socket changes

    // Effect for Socket ride events
    useEffect(() => {
        const handleNewRide = (data) => {
            setRide(data);
            setRidePopupPanel(true);
        };

        socket.on('new-ride', handleNewRide);

        // Cleanup listener on component unmount
        return () => {
            socket.off('new-ride', handleNewRide);
        };
    }, [ socket ]);

    // Function to confirm ride via API
    async function confirmRide() {
        if (!ride?._id || !captain?._id) return; // Guard clause

        try {
            const token = localStorage.getItem('token'); // Assuming captain token is stored here
            if (!token) {
                 console.error("Authentication token not found.");
                 // Handle missing token (e.g., redirect to login)
                 return;
            }

            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
                rideId: ride._id,
                // Captain ID is now taken from the auth middleware on the backend
                // captainId: captain._id, // Not needed if backend uses auth context
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                 setRidePopupPanel(false);
                 setConfirmRidePopupPanel(true);
            } else {
                 console.error("Failed to confirm ride, status:", response.status);
                 // Handle non-200 success responses if applicable
            }
        } catch (error) {
            console.error("Error confirming ride:", error.response?.data || error.message);
            // Handle API errors (show message to user, etc.)
        }
    }


    // GSAP Animations (unchanged from original)
    useGSAP(() => {
        gsap.to(ridePopupPanelRef.current, {
            transform: ridePopupPanel ? 'translateY(0)' : 'translateY(100%)'
        });
    }, [ ridePopupPanel ]);

    useGSAP(() => {
        gsap.to(confirmRidePopupPanelRef.current, {
            transform: confirmRidePopupPanel ? 'translateY(0)' : 'translateY(100%)'
        });
    }, [ confirmRidePopupPanel ]);

    return (
        <div className='h-screen'>
            {/* Display location error if any */}
            {locationError && (
                 <div style={{ position: 'fixed', top: '70px', left: '10px', right: '10px', background: 'red', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 100 }}>
                      Error: {locationError}
                 </div>
            )}
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                {/* Changed link to logout */}
                <Link to='/captain/logout' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-lg font-medium ri-logout-box-r-line"></i>
                </Link>
            </div>
            <div className='h-3/5'>
                <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
            </div>
            <div className='h-2/5 p-6'>
                {/* Render CaptainDetails only if captain data is available */}
                {captain ? <CaptainDetails /> : <p>Loading captain details...</p>}
            </div>
            <div ref={ridePopupPanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                {/* Render RidePopUp only if ride data is available */}
                {ride && (
                    <RidePopUp
                        ride={ride}
                        setRidePopupPanel={setRidePopupPanel}
                        setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                        confirmRide={confirmRide}
                    />
                )}
            </div>
            <div ref={confirmRidePopupPanelRef} className='fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                 {/* Render ConfirmRidePopUp only if ride data is available */}
                {ride && (
                     <ConfirmRidePopUp
                          ride={ride}
                          setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                          setRidePopupPanel={setRidePopupPanel}
                     />
                )}
            </div>
        </div>
    );
};

export default CaptainHome;