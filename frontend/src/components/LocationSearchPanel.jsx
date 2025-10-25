import React from 'react';

// Updated props: accepts suggestions and a single click handler
const LocationSearchPanel = ({ suggestions, onSuggestionClick, activeField }) => {

    const handleSuggestionClick = (suggestion) => {
        // Call the handler passed from the parent (Home.jsx)
        if (onSuggestionClick) {
            onSuggestionClick(suggestion);
        }
    };

    // Determine placeholder text based on the active field
    const placeholderText = activeField === 'pickup'
        ? "Searching pickup locations..."
        : "Searching destinations...";

    return (
        <div className="px-6 pb-6"> {/* Added padding consistent with Home.jsx panel */}
            {/* Display loading/placeholder or suggestions */}
            {suggestions && suggestions.length > 0 ? (
                suggestions.map((suggestion, idx) => (
                    <div
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className='flex gap-4 border border-gray-100 hover:border-gray-300 p-3 rounded-xl items-center my-2 justify-start cursor-pointer transition-colors duration-150' // Added hover effect, cursor, transition
                    >
                        {/* Icon */}
                        <div className='bg-gray-100 h-8 w-8 flex items-center justify-center rounded-full flex-shrink-0'> {/* Adjusted size */}
                            <i className="ri-map-pin-line text-gray-600"></i> {/* Changed icon */}
                        </div>
                        {/* Suggestion Text */}
                        <h4 className='font-medium text-sm text-left flex-grow'>{suggestion}</h4> {/* Adjusted text size and alignment */}
                    </div>
                ))
            ) : (
                 // Display a message if no suggestions are available (or while loading)
                 <div className="text-center text-gray-500 py-4">{placeholderText}</div>
            )}
        </div>
    );
};

export default LocationSearchPanel;