// File: src/types/address.ts

/**
 * Represents a geographical address or point on the map.
 *  id? - Optional Place ID (used by Autocomplete)
 *  lat - Latitude in decimal degrees
 *  lng - Longitude in decimal degrees
 *  name - The formatted address or name of this location
 *  title? - Optional: The “title” or place name returned by Autocomplete (e.g. “Starbucks”)
 *  marker? - Optional: a reference to the Google Maps AdvancedMarkerElement for this address
 */
export default interface Address {
  id?: string;
  lat: number;
  lng: number;
  name: string;
  title?: string;
  marker?: google.maps.marker.AdvancedMarkerElement;
}
