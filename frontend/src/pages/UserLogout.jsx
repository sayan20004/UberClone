import React, { useEffect, useState } from 'react'; // Added useEffect, useState
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext'; // Import context if needed to clear user state

// Changed to a functional component that performs logout on mount
const UserLogout = () => {
    const navigate = useNavigate();
    const { setUser } = React.useContext(UserDataContext); // Get setUser to clear context state
    const [ logoutMessage, setLogoutMessage ] = useState('Logging out...'); // State for user feedback

    useEffect(() => {
        const performLogout = async () => {
            const token = localStorage.getItem('token');

            // Clear local storage and context immediately regardless of backend call success
            localStorage.removeItem('token');
            setUser(null); // Or set to initial state: { email: '', fullName: { firstName: '', lastName: '' }}

            if (!token) {
                // If no token exists, just redirect
                setLogoutMessage('No active session found. Redirecting...');
                setTimeout(() => navigate('/login'), 1500); // Short delay for message visibility
                return;
            }

            try {
                 // **CHANGED** VITE_API_URL to VITE_BASE_URL
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    setLogoutMessage('Logout successful. Redirecting...');
                     console.log("Backend logout confirmed.");
                } else {
                     // Handle cases where backend might return non-200 on success (unlikely for GET logout)
                     console.warn("Logout request returned status:", response.status);
                     setLogoutMessage('Logout processed. Redirecting...'); // Proceed with redirect even if backend response isn't perfect
                }
            } catch (err) {
                 // Log error but proceed with redirect as client-side logout is done
                console.error("Logout API call failed:", err.response?.data || err.message);
                setLogoutMessage('Logout processed locally. Redirecting...'); // Inform user local logout happened
            } finally {
                 // Redirect after a short delay to show the message
                 setTimeout(() => navigate('/login'), 1500);
            }
        };

        performLogout();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, setUser]); // Add dependencies

    // Display a message to the user while logging out
    return (
        <div style={{ padding: '2em', textAlign: 'center' }}>
            <h2>{logoutMessage}</h2>
            {/* Optionally add a spinner */}
        </div>
    );
};

export default UserLogout;