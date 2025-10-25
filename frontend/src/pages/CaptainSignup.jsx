import React, { useState, useContext } from 'react'; // Import useContext
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CaptainDataContext } from '../context/CaptainContext'; // Corrected spelling to CaptainDataContext

const CaptainSignup = () => {
  const navigate = useNavigate();

  // Personal Details
  const [ email, setEmail ] = useState('');
  const [ password, setPassword ] = useState('');
  const [ firstName, setFirstName ] = useState('');
  const [ lastName, setLastName ] = useState('');

  // Vehicle Details
  const [ vehicleColor, setVehicleColor ] = useState('');
  const [ vehiclePlate, setVehiclePlate ] = useState('');
  const [ vehicleCapacity, setVehicleCapacity ] = useState('');
  const [ vehicleType, setVehicleType ] = useState(''); // Initialize as empty string

  // UI State
  const [ error, setError ] = useState(''); // Added error state
  const [ isLoading, setIsLoading ] = useState(false); // Added loading state

  const { setCaptain } = useContext(CaptainDataContext); // Removed unused 'captain'

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setIsLoading(true); // Set loading state

    // Basic frontend validation (supplement to backend validation)
    if (!firstName || !email || !password || !vehicleColor || !vehiclePlate || !vehicleCapacity || !vehicleType) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
     if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
    }
     if (parseInt(vehicleCapacity, 10) < 1) {
         setError('Vehicle capacity must be at least 1.');
         setIsLoading(false);
         return;
     }
    // Simple email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Please enter a valid email address.');
        setIsLoading(false);
        return;
    }


    const captainData = {
      fullname: {
        firstname: firstName,
        lastname: lastName // Backend handles optional last name
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: parseInt(vehicleCapacity, 10), // Ensure capacity is a number
        vehicleType: vehicleType
      }
    };

    try { // Added try
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData);

      // Assuming 201 Created is the success status
      if (response.status === 201 && response.data?.token && response.data?.captain) {
        const { captain: registeredCaptain, token } = response.data;
        setCaptain(registeredCaptain); // Update context
        localStorage.setItem('token', token); // Use consistent 'token' key
        navigate('/captain-home'); // Redirect on success
        // No need to clear fields here as navigating away
      } else {
        // Handle unexpected success statuses or missing data
        console.warn("Unexpected captain signup response:", response);
        setError('Signup failed. Unexpected response from server.');
      }
    } catch (err) { // Added catch
      console.error("Captain Signup Error:", err.response?.data || err.message);
       if (err.response?.status === 400) {
           // Check for specific validation errors if backend provides them
          if (err.response.data?.errors && Array.isArray(err.response.data.errors)) {
              const messages = err.response.data.errors.map(e => e.msg).join(' ');
              setError(messages || 'Registration failed. Please check your details.');
          } else {
               // Generic 400 error (like "Captain already exists")
               setError(err.response.data?.message || 'Registration failed. Please check your details.');
          }
      } else if (err.response) {
            setError(err.response.data?.message || 'Signup failed due to a server error.');
      } else {
            setError('Signup failed. Please check your connection and try again.');
      }
    } finally { // Added finally
      setIsLoading(false); // Unset loading state
       // Do not clear fields automatically on error
    }
  };

  return (
    // Increased padding and adjusted layout for better spacing
    <div className='py-5 px-5 min-h-screen flex flex-col justify-between'>
      <div>
         {/* Alt text added */}
        <img className='w-20 mb-3' src="https://www.svgrepo.com/show/505031/uber-driver.svg" alt="Captain Signup Icon" />

        <form onSubmit={submitHandler}>

          <h3 className='text-lg w-full font-medium mb-2 text-left'>What's your name</h3>
          <div className='flex flex-col sm:flex-row gap-4 mb-7'> {/* Stack on small screens */}
            <input
              required
              className='bg-[#eeeeee] w-full sm:w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base disabled:opacity-70'
              type="text"
              placeholder='First name'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
            />
            <input
              // Removed required for last name
              className='bg-[#eeeeee] w-full sm:w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base disabled:opacity-70'
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
            placeholder='At least 6 characters'
            minLength="6"
            disabled={isLoading}
          />

          <h3 className='text-lg font-medium mb-2 text-left'>Vehicle Information</h3>
          <div className='flex flex-col sm:flex-row gap-4 mb-7'>
            <input
              required
              className='bg-[#eeeeee] w-full sm:w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base disabled:opacity-70'
              type="text"
              placeholder='Vehicle Color'
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
               disabled={isLoading}
            />
            <input
              required
              className='bg-[#eeeeee] w-full sm:w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base disabled:opacity-70'
              type="text"
              placeholder='Vehicle Plate'
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
               disabled={isLoading}
            />
          </div>
          <div className='flex flex-col sm:flex-row gap-4 mb-7'>
            <input
              required
              className='bg-[#eeeeee] w-full sm:w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base disabled:opacity-70'
              type="number" // Use number type
              placeholder='Vehicle Capacity'
              value={vehicleCapacity}
              onChange={(e) => setVehicleCapacity(e.target.value)}
              min="1" // HTML5 validation for minimum
               disabled={isLoading}
            />
            <select
              required
              className='bg-[#eeeeee] w-full sm:w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-base disabled:opacity-70'
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
               disabled={isLoading}
            >
              <option value="" disabled>Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="moto">Moto</option> {/* Changed value to match backend */}
            </select>
          </div>

           {/* Display Error Message */}
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}


          <button
            type="submit"
            className='bg-[#111] text-white font-semibold mb-3 rounded-lg px-4 py-2 w-full text-lg placeholder:text-base disabled:opacity-50'
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Captain Account'}
          </button>

        </form>
        <p className='text-center'>Already have an account? <Link to='/captain-login' className='text-blue-600 hover:underline'>Login here</Link></p>
      </div>
      <div className="mt-auto pt-4"> {/* Added margin-top auto and padding */}
        <p className='text-[10px] mt-6 leading-tight'>
          This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply</span>.
        </p>
      </div>
    </div>
  );
};

export default CaptainSignup;