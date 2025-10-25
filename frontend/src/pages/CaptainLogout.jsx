import {React,} from 'react'; // Keep React import
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react'; // Added imports
import { CaptainDataContext } from '../context/CaptainContext'; // Import context

// Changed to a functional component that performs logout on mount
const CaptainLogout = () => {
    const navigate = useNavigate();
    const { setCaptain } = useContext(CaptainDataContext); // Get setCaptain to clear context state
    const [ logoutMessage, setLogoutMessage ] = useState('Logging out...'); // State for user feedback

    useEffect(() => {
        const performLogout = async () => {
             // Use consistent 'token' key used during login
            const token = localStorage.getItem('token');

            // Clear local storage and context immediately
            localStorage.removeItem('token'); // Use consistent key
            setCaptain(null); // Clear captain data in context

            if (!token) {
                // If no token exists, just redirect
                setLogoutMessage('No active session found. Redirecting...');
                setTimeout(() => navigate('/captain-login'), 1500); // Redirect to captain login
                return;
            }

            try {
                // **CHANGED** VITE_API_URL to VITE_BASE_URL
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    setLogoutMessage('Logout successful. Redirecting...');
                    console.log("Backend captain logout confirmed.");
                } else {
                     console.warn("Captain logout request returned status:", response.status);
                     setLogoutMessage('Logout processed. Redirecting...');
                }
            } catch (err) {
                 // Log error but proceed with redirect
                console.error("Captain logout API call failed:", err.response?.data || err.message);
                setLogoutMessage('Logout processed locally. Redirecting...');
            } finally {
                 // Redirect after a short delay
                 setTimeout(() => navigate('/captain-login'), 1500); // Redirect to captain login
            }
        };

        performLogout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, setCaptain]); // Add dependencies

    // Display a message to the user
    return (
        <div style={{ padding: '2em', textAlign: 'center' }}>
            <h2>{logoutMessage}</h2>
            {/* Optionally add a spinner */}
        </div>
    );
};

export default CaptainLogout;