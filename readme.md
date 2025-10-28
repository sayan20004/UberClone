# Uber Clone: A Real-Time Ride-Sharing Application

This repository contains the source code for a full-stack Uber clone application. It enables users to request rides and allows drivers (referred to as "Captains") to accept and manage these rides, featuring real-time updates and map integration.

## Core Features

* **Dual User Roles:** Separate interfaces and functionalities for Riders (Users) and Drivers (Captains).
* **Authentication:** Secure user and captain registration and login using JWT for session management. Passwords are securely hashed. Includes logout functionality with token invalidation.
* **Ride Management:**
    * **Booking:** Riders can specify pickup and drop-off locations (with autocomplete suggestions via Google Maps API).
    * **Fare Estimation:** Calculates estimated fares based on distance and duration for different vehicle types (Car, Auto, Moto).
    * **Vehicle Selection:** Riders can choose their preferred vehicle type.
    * **Real-time Matching:** Ride requests are broadcast to nearby available Captains using Socket.IO.
* **Real-time Communication & Tracking:**
    * Captains receive instant notifications for new ride requests.
    * Riders receive real-time updates when a Captain accepts the ride.
    * OTP verification by the Captain to start the ride.
    * Live map-based location tracking during the ride for both Rider and Captain.
    * Notifications for ride start and end events.
* **Mapping Integration:** Leverages the Google Maps API for:
    * Displaying maps.
    * Fetching coordinates from addresses.
    * Calculating route distance and estimated travel time.
    * Providing location autocomplete suggestions.

## Technology Stack

**Frontend:**

* **Framework/Library:** React (with Vite)
* **Routing:** React Router
* **Styling:** Tailwind CSS
* **State Management:** React Context API
* **API Communication:** Axios
* **Real-time:** Socket.IO Client
* **Mapping:** @react-google-maps/api
* **Animation:** GSAP

**Backend:**

* **Framework:** Node.js, Express.js
* **Database:** MongoDB with Mongoose ODM
* **Real-time:** Socket.IO
* **Authentication:** JSON Web Tokens (jsonwebtoken), bcrypt
* **API Communication:** Axios (for Google Maps)
* **Validation:** express-validator
* **Environment Variables:** dotenv

**Database:**

* MongoDB

**External APIs:**

* Google Maps Platform (Geocoding, Distance Matrix, Places Autocomplete)

## Project Setup

**Prerequisites:**

* Node.js (v16.20.1 or higher recommended)
* npm / yarn
* MongoDB Server (local or cloud instance like MongoDB Atlas)
* Google Maps API Key

**Backend Configuration:**

1.  Clone the repository.
2.  Navigate to the `Backend` directory (`cd Backend`).
3.  Install dependencies: `npm install`.
4.  Create a `.env` file in the `Backend` directory.
5.  Add the following environment variables to your `.env` file:
    ```env
    DB_CONNECT=<Your MongoDB Connection String>
    PORT=<Backend Port, e.g., 3000>
    JWT_SECRET=<Your Secret Key for JWT>
    GOOGLE_MAPS_API=<Your Google Maps API Key>
    ```
6.  Start the backend server: `npm start` (or your configured run script).

**Frontend Configuration:**

1.  Navigate to the `Frontend` directory (`cd ../Frontend`).
2.  Install dependencies: `npm install`.
3.  Create a `.env` file in the `Frontend` directory.
4.  Add the following environment variables:
    ```env
    VITE_BASE_URL=http://localhost:<Backend Port> # e.g., http://localhost:3000
    VITE_GOOGLE_MAPS_API_KEY=<Your Google Maps API Key>
    ```
5.  Start the frontend development server: `npm run dev`.
6.  Open your browser and navigate to the provided local URL (e.g., `http://localhost:5173`).

## API Documentation

Detailed information about the backend API endpoints (user/captain authentication, ride management, map services) can be found in `Backend/README.md`.

## Project Structure Overview
```
├── Backend/                 # Node.js/Express Backend Code
│   ├── controllers/
│   ├── db/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env                 # Backend environment variables (needs creation)
│   ├── app.js
│   ├── package.json
│   ├── server.js
│   └── socket.js
├── Frontend/                # React/Vite Frontend Code
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                 # Frontend environment variables (needs creation)
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md                # This file
```