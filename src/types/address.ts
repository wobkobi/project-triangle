/**
 * Represents a geographical address or point on the map.
 * id - Optional: Place ID (used by Autocomplete)
 * lat - Latitude in decimal degrees
 * lng - Longitude in decimal degrees
 * name - The formatted address or name of this location
 * [marker] - Optional: a reference to the Google Maps Marker instance
 */
export default interface Address {
  id?: string;
  lat: number;
  lng: number;
  name: string;
  marker?: google.maps.marker.AdvancedMarkerElement;
}
