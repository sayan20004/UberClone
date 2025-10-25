import React, { useState, useContext } from 'react'; // Import useContext
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CaptainContext'; // Corrected spelling to CaptainDataContext

const Captainlogin = () => {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ error, setError ] = useState(''); // Added error state
  const [ isLoading, setIsLoading ] = useState(false); // Added loading state

  const { setCaptain } = useContext(CaptainDataContext); // Removed unused 'captain' and corrected context name
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state

    // Basic validation (optional)
    if (!email || !password) {
        setError('Please enter both email and password.');
        setIsLoading(false);
        return;
    }

    const captainLoginData = { // Renamed for clarity
      email: email,
      password: password
    };

    try { // Added try
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, captainLoginData);

      // Assuming 200 is the success status
      if (response.status === 200 && response.data?.token && response.data?.captain) {
        const { captain: loggedInCaptain, token } = response.data;
        setCaptain(loggedInCaptain); // Update context
        localStorage.setItem('token', token); // Use consistent 'token' key
        navigate('/captain-home'); // Redirect on success
        // No need to clear fields as navigating away
      } else {
         // Handle unexpected success statuses or missing data
         console.warn("Unexpected captain login response:", response);
         setError('Login failed. Unexpected response from server.');
      }

    } catch (err) { // Added catch
      console.error("Captain Login Error:", err.response?.data || err.message);
       // Provide more specific error messages
       if (err.response?.status === 401) {
           setError('Invalid email or password. Please try again.');
       } else if (err.response) {
            setError(err.response.data?.message || 'Login failed. Please check your details.');
       } else {
           setError('Login failed. Please check your connection and try again.');
       }
    } finally { // Added finally
      setIsLoading(false); // Unset loading state
      // Clear password field after attempt
      setPassword('');
    }
  };

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
      <div>
         {/* Consider adding alt text */}
        <img className='w-20 mb-3' src="https://www.svgrepo.com/show/505031/uber-driver.svg" alt="Captain Icon" />

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
        <p className='text-center'>Need an account? <Link to='/captain-signup' className='text-blue-600 hover:underline'>Register as a Captain</Link></p>
      </div>
      <div className="mt-auto pt-4"> {/* Added margin-top auto and padding */}
        <Link
          to='/login'
          className='bg-[#d5622d] hover:bg-orange-700 flex items-center justify-center text-white font-semibold mb-5 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base transition-colors duration-200'
        >
          Sign in as User
        </Link>
      </div>
    </div>
  );
};

export default Captainlogin;