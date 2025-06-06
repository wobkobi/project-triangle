import { Marker } from "@/types/map";

/**
 * Removes all markers in the provided array from the map,
 * then clears that array in-place.
 * @param markers - An array of Marker instances to remove
 */
export default function clearAllMarkers(markers: Marker[]): void {
  markers.forEach((marker) => {
    // AdvancedMarkerElement: assign .map = null to remove from map
    marker.map = null;
  });
  markers.length = 0; // clear the array
}
