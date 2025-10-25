import React, { useContext, useEffect, useState } from 'react';
import { CaptainDataContext } from '../context/CaptainContext'; // Corrected spelling
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CaptainProtectWrapper = ({ children }) => {
    const navigate = useNavigate();
    const { captain, setCaptain } = useContext(CaptainDataContext); // Corrected spelling
    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState(''); // Added error state

    useEffect(() => {
        const verifyCaptain = async () => {
            setError(''); // Clear previous errors
            const token = localStorage.getItem('token'); // Use consistent 'token' key

            if (!token) {
                console.log("No captain token found, redirecting to captain login.");
                navigate('/captain-login');
                return; // Stop if no token
            }

            // Optional: Skip verification if captain data already exists
            // if (captain?._id) {
            //     setIsLoading(false);
            //     return;
            // }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200 && response.data?.captain) {
                    setCaptain(response.data.captain); // Set captain data in context
                    setIsLoading(false); // Finished loading
                } else {
                    // Handle unexpected success status or missing captain data
                    console.warn("Unexpected captain profile response:", response);
                    throw new Error(`Unexpected status code ${response.status} or missing data`);
                }
            } catch (err) {
                console.error("Captain verification failed:", err.response?.data || err.message);
                // Clear potentially invalid token and captain state
                localStorage.removeItem('token');
                setCaptain(null);
                setError('Session invalid or expired. Please log in again.'); // Set error message
                setIsLoading(false); // Finished loading (with error)
                // Redirect to captain login
                navigate('/captain-login');
            }
        };

        verifyCaptain();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ navigate, setCaptain ]); // Dependencies

    // Display loading state
    if (isLoading) {
        return (
            <div style={{ padding: '2em', textAlign: 'center' }}>
                Loading captain session...
                {/* Optionally add a spinner */}
            </div>
        );
    }

    // Display error state (though usually redirects quickly)
    // if (error) {
    //     return (
    //         <div style={{ padding: '2em', textAlign: 'center', color: 'red' }}>
    //             {error}
    //         </div>
    //     );
    // }

    // Render children only if loading is complete, no error caused redirect, and captain data exists
    return captain ? <>{children}</> : null;
};

export default CaptainProtectWrapper;