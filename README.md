# GeoWord Quest

A location-based word hunt game built with React, Leaflet, and Firebase.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Update `.env` with your Firebase details:
     ```
     VITE_FIREBASE_API_KEY=your_key
     VITE_FIREBASE_AUTH_DOMAIN=your_domain
     VITE_FIREBASE_PROJECT_ID=your_project_id
     ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- **Real-time Location Tracking**: Uses the browser's Geolocation API.
- **Interactive Map**: Built with Leaflet.
- **Daily Word Puzzle**: Find spheres to unlock letters.
- **Responsive Design**: Mobile-first UI with Tailwind CSS.

## Notes

- Ensure you allow location access when prompted.
- The game generates random spheres around your initial location.
- Walk within 50 meters of a sphere to collect it.
