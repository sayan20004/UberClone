import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Keep useNavigate
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';

const UserLogin = () => {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  // Removed userData state as it wasn't used after submission
  const [ error, setError ] = useState(''); // Added error state
  const [ isLoading, setIsLoading ] = useState(false); // Added loading state

  const { setUser } = useContext(UserDataContext); // Removed unused 'user' from context destructuring
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state

    // Basic validation (optional, supplement to required attribute)
    if (!email || !password) {
        setError('Please enter both email and password.');
        setIsLoading(false);
        return;
    }

    const loginData = { // Renamed for clarity
      email: email,
      password: password
    };

    try { // Added try
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, loginData);

      // Assuming 200 is the only success status for login
      if (response.status === 200 && response.data?.token && response.data?.user) {
        const { user: loggedInUser, token } = response.data;
        setUser(loggedInUser); // Update context
        localStorage.setItem('token', token); // Store token
        navigate('/home'); // Redirect on success
      } else {
         // Handle unexpected success statuses or missing data in response
         console.warn("Unexpected login response:", response);
         setError('Login failed. Unexpected response from server.');
      }
    } catch (err) { // Added catch
      console.error("Login Error:", err.response?.data || err.message);
       // Provide more specific error messages based on backend response if possible
       if (err.response?.status === 401) {
           setError('Invalid email or password. Please try again.');
       } else if (err.response) {
            // Other server-side error (e.g., 400 Bad Request from validation)
            setError(err.response.data?.message || 'Login failed. Please check your details.');
       } else {
           // Network error or other issues
           setError('Login failed. Please check your connection and try again.');
       }
    } finally { // Added finally
      setIsLoading(false); // Unset loading state regardless of outcome
      // Clear password field after attempt, keep email for convenience?
      setPassword('');
    }
  };

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
        {/* Consider adding alt text describing the image */}
        <img className='w-16 mb-10' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s" alt="User Login Icon" />

        <form onSubmit={submitHandler}>
          <h3 className='text-lg font-medium mb-2 text-left'>What's your email</h3>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base disabled:opacity-70'
            type="email"
            placeholder='email@example.com'
            disabled={isLoading} // Disable input while loading
          />

          <h3 className='text-lg font-medium mb-2 text-left'>Enter Password</h3>
          <input
            required
            className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base disabled:opacity-70'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder='password'
            disabled={isLoading} // Disable input while loading
          />

          {/* Display Error Message */}
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <button
            type="submit" // Explicitly set type
            className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base disabled:opacity-50'
            disabled={isLoading} // Disable button while loading
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className='text-center'>New here? <Link to='/signup' className='text-blue-600 hover:underline'>Create new Account</Link></p>
      </div>
      <div className="mt-auto pt-4"> {/* Added margin-top auto and padding */}
        <Link
          to='/captain-login'
          className='bg-[#10b461] hover:bg-green-700 flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base transition-colors duration-200'
        >
          Sign in as Captain
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;