import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';

const UserSignup = () => {
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ firstName, setFirstName ] = useState('');
  const [ lastName, setLastName ] = useState('');
  // Removed userData state as it wasn't used after submission
  const [ error, setError ] = useState(''); // Added error state
  const [ isLoading, setIsLoading ] = useState(false); // Added loading state

  const { setUser } = useContext(UserDataContext); // Removed unused 'user' from context destructuring
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state

    // Basic frontend validation (supplement to backend validation)
    if (!firstName || !email || !password) {
      setError('First name, email, and password are required.');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
    }
    // Simple email format check (backend validation is primary)
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
    }


    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName // Backend handles optional last name
      },
      email: email,
      password: password
    };

    try { // Added try
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser);

      // Assuming 201 Created is the success status
      if (response.status === 201 && response.data?.token && response.data?.user) {
        const { user: registeredUser, token } = response.data;
        setUser(registeredUser); // Update context
        localStorage.setItem('token', token); // Store token
        navigate('/home'); // Redirect on success
        // No need to clear fields here as we are navigating away
      } else {
        // Handle unexpected success statuses or missing data
        console.warn("Unexpected signup response:", response);
        setError('Signup failed. Unexpected response from server.');
      }
    } catch (err) { // Added catch
      console.error("Signup Error:", err.response?.data || err.message);
      if (err.response?.status === 400) {
          // Check for specific validation errors if backend provides them
          if (err.response.data?.errors && Array.isArray(err.response.data.errors)) {
              // Join multiple validation errors, or take the first one
              const messages = err.response.data.errors.map(e => e.msg).join(' ');
              setError(messages || 'Registration failed. Please check your details.');
          } else {
               // Generic 400 error (like "User already exists")
               setError(err.response.data?.message || 'Registration failed. Please check your details.');
          }
      } else if (err.response) {
            setError(err.response.data?.message || 'Signup failed due to a server error.');
      } else {
            setError('Signup failed. Please check your connection and try again.');
      }
    } finally { // Added finally
      setIsLoading(false); // Unset loading state
      // Do not clear fields automatically on error, let user correct them
      // setEmail('');
      // setFirstName('');
      // setLastName('');
      // setPassword('');
    }
  };

  return (
    <div>
      <div className='p-7 h-screen flex flex-col justify-between'>
        <div>
           {/* Consider adding alt text */}
          <img className='w-16 mb-10' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s" alt="User Signup Icon" />

          <form onSubmit={submitHandler}>

            <h3 className='text-lg w-full font-medium mb-2 text-left'>What's your name</h3>
            <div className='flex gap-4 mb-7'>
              <input
                required
                className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base disabled:opacity-70'
                type="text"
                placeholder='First name'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={isLoading}
              />
              <input
                // Removed required for last name, assuming optional
                className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base disabled:opacity-70'
                type="text"
                placeholder='Last name (optional)'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <h3 className='text-lg font-medium mb-2 text-left'>What's your email</h3>
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base disabled:opacity-70'
              type="email"
              placeholder='email@example.com'
              disabled={isLoading}
            />

            <h3 className='text-lg font-medium mb-2 text-left'>Enter Password</h3>
            <input
              required
              className='bg-[#eeeeee] mb-7 rounded-lg px-4 py-2 border w-full text-lg placeholder:text-base disabled:opacity-70'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder='At least 6 characters' // Hint for user
              minLength="6" // HTML5 validation
              disabled={isLoading}
            />

             {/* Display Error Message */}
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

            <button
                type="submit"
                className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base disabled:opacity-50'
                disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create account'}
            </button>

          </form>
          <p className='text-center'>Already have an account? <Link to='/login' className='text-blue-600 hover:underline'>Login here</Link></p>
        </div>
        <div className="mt-auto pt-4"> {/* Added margin-top auto and padding */}
          <p className='text-[10px] leading-tight'>
            This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span>.
          </p>
        </div>
      </div>
    </div >
  );
};

export default UserSignup;