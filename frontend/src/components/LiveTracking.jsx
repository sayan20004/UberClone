import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '100%',
};

// Default center if geolocation fails or is denied (e.g., center of India)
const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629
};

const LiveTracking = () => {
    const [ currentPosition, setCurrentPosition ] = useState(null); // Initialize as null until position is obtained
    const [ mapError, setMapError ] = useState(null); // Changed state name for clarity

    useEffect(() => {
        let watchId = null;

        const handleSuccess = (position) => {
            const { latitude, longitude } = position.coords;
            // console.log('Position updated:', latitude, longitude); // Keep for debugging if needed
            setCurrentPosition({
                lat: latitude,
                lng: longitude
            });
            setMapError(null); // Clear error on success
        };

        const handleError = (err) => {
            console.error("Geolocation Error:", err.code, err.message);
            // Provide user-friendly messages based on error code
            let errorMessage = "Could not get location.";
            switch(err.code) {
                case err.PERMISSION_DENIED:
                    errorMessage = "Location permission denied. Please enable it in your browser settings.";
                    break;
                case err.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable.";
                    break;
                case err.TIMEOUT:
                    errorMessage = "The request to get user location timed out.";
                    break;
                default:
                    errorMessage = "An unknown error occurred while getting location.";
                    break;
            }
            setMapError(`${errorMessage} Displaying default location.`);
            // Set to default center only if no position has ever been successfully retrieved
            if (!currentPosition) {
                 setCurrentPosition(defaultCenter);
            }
        };

        if (navigator.geolocation) {
             // Get initial position first to avoid delay
            navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
                 enableHighAccuracy: true,
                 timeout: 10000,
                 maximumAge: 60000 // Allow slightly older cache initially
            });

            // Then watch for changes
            watchId = navigator.geolocation.watchPosition(
                handleSuccess,
                handleError,
                {
                    enableHighAccuracy: true, // Request more accurate position for watching
                    timeout: 10000,          // Time before error callback is invoked if no update
                    maximumAge: 0             // Don't use cached position for subsequent updates
                }
            );
        } else {
             setMapError("Geolocation is not supported by this browser. Displaying default location.");
             setCurrentPosition(defaultCenter);
        }

        // Cleanup function to clear the watch when the component unmounts
        return () => {
            if (watchId !== null && navigator.geolocation) {
                navigator.geolocation.clearWatch(watchId);
                console.log("Cleared geolocation watch."); // Log cleanup
            }
        };
        // Run this effect only once on mount
    }, []); // Empty dependency array ensures this runs only once


     // Display loading state until the first position (or default) is set
     if (!currentPosition) {
        return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map...</div>;
     }

     // Optionally display error message to user (e.g., as an overlay)
     // if (mapError) { console.warn(mapError); /* Add UI element here */ }

    return (
        // Ensure API key is loaded correctly
        <LoadScript
            googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            loadingElement={<div style={{ height: '100%' }} />} // Basic loading placeholder for LoadScript
            onError={(e) => setMapError('Failed to load Google Maps script.')} // Handle script loading error
        >
            {/* Display error if map script failed to load */}
            {mapError && !currentPosition && <div style={{ padding: '1em', color: 'red' }}>{mapError}</div>}

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition} // Uses state, which might be defaultCenter on error
                zoom={15}
                options={{ // Minimal controls for a tracking map
                    zoomControl: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                 }}
                // Optionally handle map load errors
                // onLoad={() => console.log('Map loaded')}
                // onUnmount={() => console.log('Map unmounted')}
            >
                {/* Only show marker if position is valid and not the default fallback */}
                {currentPosition !== defaultCenter && (
                    <Marker
                        position={currentPosition}
                        // Optionally customize the marker icon
                        // icon={{
                        //    url: '/path/to/your/marker.svg',
                        //    scaledSize: new window.google.maps.Size(30, 30)
                        // }}
                     />
                )}
            </GoogleMap>
        </LoadScript>
    );
};

export default LiveTracking;