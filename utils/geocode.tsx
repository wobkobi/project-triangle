//Utility functions for geocoding addresses and calculating the midpoint of multiple points

// Import the Geocode library
import Geocode from "react-geocode";

// Set the API key for the Geocode library
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""; // Ensure apiKey is defined
Geocode.setKey(apiKey);
