import React, { createContext, useState } from 'react'; // Removed useContext as it's not needed here

// Corrected context name spelling
export const CaptainDataContext = createContext();

// Corrected component name spelling
const CaptainContext = ({ children }) => {
    // Initialize captain state with a structure that matches backend responses,
    // or null if no captain is logged in initially.
    const [ captain, setCaptain ] = useState(null);
    // Removed isLoading and error states as they might be better managed
    // within components that actually perform loading or encounter errors.
    // If needed globally, they can be added back.
    // const [ isLoading, setIsLoading ] = useState(false);
    // const [ error, setError ] = useState(null);

    // Removed updateCaptain function as setCaptain already does this.
    // If more complex logic is needed when updating, it can be added back.
    // const updateCaptain = (captainData) => {
    //     setCaptain(captainData);
    // };

    // Value provided by the context
    const value = {
        captain,
        setCaptain,
        // isLoading, // Removed
        // setIsLoading, // Removed
        // error, // Removed
        // setError, // Removed
        // updateCaptain // Removed
    };

    return (
        <CaptainDataContext.Provider value={value}>
            {children}
        </CaptainDataContext.Provider>
    );
};

export default CaptainContext; // Corrected export name
