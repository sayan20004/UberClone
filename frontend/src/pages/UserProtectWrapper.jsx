import React, { useContext, useEffect, useState } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserProtectWrapper = ({ children }) => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserDataContext);
    const [ isLoading, setIsLoading ] = useState(true);
    const [ error, setError ] = useState(''); // Added error state for feedback

    useEffect(() => {
        const verifyUser = async () => {
            setError(''); // Clear previous errors
            const token = localStorage.getItem('token'); // Use consistent 'token' key

            if (!token) {
                console.log("No token found, redirecting to login.");
                navigate('/login');
                return; // Stop execution if no token
            }

            // If user data already exists in context, skip verification? Optional optimization.
            // if (user?._id) {
            //     setIsLoading(false);
            //     return;
            // }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200 && response.data) {
                    setUser(response.data); // Set user data in context
                    setIsLoading(false); // Finished loading
                } else {
                     // Handle unexpected success status
                     console.warn("Unexpected profile response status:", response.status);
                     throw new Error(`Unexpected status code ${response.status}`);
                }
            } catch (err) {
                console.error("User verification failed:", err.response?.data || err.message);
                // Clear potentially invalid token and user state
                localStorage.removeItem('token');
                setUser(null); // Or reset to initial state
                setError('Session invalid or expired. Please log in again.'); // Set error message
                setIsLoading(false); // Finished loading (with error)
                // Redirect to login after showing error briefly or immediately
                // Consider adding a small delay if showing error message
                navigate('/login');
            }
        };

        verifyUser();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ navigate, setUser ]); // Removed token from dependencies as it's read inside

    // Display loading state
    if (isLoading) {
        return (
            <div style={{ padding: '2em', textAlign: 'center' }}>
                Loading user session...
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

    // Render children only if loading is complete and no redirect happened
    // The check for `user` might be redundant if redirect happens on error
    return user ? <>{children}</> : null; // Render children if user exists, otherwise null (or redirect handled by useEffect)
};

export default UserProtectWrapper;