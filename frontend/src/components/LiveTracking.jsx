import React, { useState, useEffect, useRef } from 'react'; // Added useRef import
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
};

// Default center (e.g., somewhere central if the app has a primary region, or 0,0)
const defaultCenter = {
    lat: 20.5937, // Example: Center of India
    lng: 78.9629
};

const LiveTracking = () => {
    const [ currentPosition, setCurrentPosition ] = useState(null); // Start with null
    const [ mapCenter, setMapCenter ] = useState(defaultCenter);
    const [ locationError, setLocationError ] = useState(null);

    // Geolocation options
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 0 // Don't use cached location
    };

    // Function to handle geolocation errors
    const handleGeoError = (error) => {
        console.error("Geolocation Watch Error:", error.code, error.message);
        let errorMessage = "Could not track location.";
        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Tracking disabled.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable. Check your signal or try again later."; // kCLErrorLocationUnknown maps to this
                break;
            case error.TIMEOUT:
                errorMessage = "The request to get location timed out.";
                break;
            default:
                errorMessage = "An unknown error occurred during location tracking.";
                break;
        }
        setLocationError(errorMessage);
        // Optionally, stop watching if permission denied
        // if (error.code === error.PERMISSION_DENIED && watchIdRef.current) {
        //     navigator.geolocation.clearWatch(watchIdRef.current);
        // }
    };

    const watchIdRef = useRef(null); // Use ref to store watchId

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser.");
            return;
        }

        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setLocationError(null); // Clear errors on success
                const { latitude, longitude } = position.coords;
                const newPosition = {
                    lat: latitude,
                    lng: longitude
                };
                console.log('LiveTracking Position updated:', latitude, longitude);
                setCurrentPosition(newPosition);
                // Set map center only the first time or if it hasn't been set by user interaction
                if (!currentPosition) { // Only center initially
                     setMapCenter(newPosition);
                }
            },
            handleGeoError, // Use the error handler
            geoOptions      // Use defined options
        );

        // Cleanup: clear watch on component unmount
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

    // If needed, add a function to allow the map to be recentered manually
    // const recenterMap = () => {
    //    if (currentPosition) {
    //       setMapCenter(currentPosition);
    //    }
    // };

    return (
        <>
            {/* Display location error if any - style as needed */}
            {locationError && (
                 <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', background: 'rgba(220, 53, 69, 0.8)', color: 'white', padding: '10px', borderRadius: '5px', zIndex: 10, textAlign: 'center', fontSize: '0.9em' }}>
                      <i className="ri-error-warning-line" style={{ marginRight: '5px' }}></i> Error: {locationError}
                 </div>
            )}
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter} // Use mapCenter state
                    zoom={15}
                    // Optional: Consider allowing user interaction
                    // options={{ gestureHandling: 'cooperative' }}
                >
                    {/* Only show marker if position is known */}
                    {currentPosition && <Marker position={currentPosition} />}
                </GoogleMap>
            </LoadScript>
            {/* Optional button to recenter map
             <button onClick={recenterMap} style={{ position: 'absolute', bottom: '80px', right: '10px', zIndex: 5 }}>
                 Recenter
             </button>
             */}
        </>
    );
};

export default LiveTracking;