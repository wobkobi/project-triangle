// File: src/utils/googleMaps/markers/clearAllMarkers.ts

/**
 * Removes every AdvancedMarkerElement from the map and empties the array.
 * @param markers - Array of google.maps.marker.AdvancedMarkerElement instances
 */
export default function clearAllMarkers(
  markers: google.maps.marker.AdvancedMarkerElement[]
): void {
  markers.forEach((m) => {
    m.map = null; // removes from the map
  });
  markers.length = 0;
}
