// File: src/utils/googleMaps/initMap.ts

import type { Map as GoogleMapType } from "@/types/map";
import type { Dispatch, RefObject } from "react";

/**
 * initMap: dynamically loads the Maps JS API (with “places” + “marker” libraries),
 * then creates a Google Map with a required mapId (for advanced markers).
 * @param apiKey - Your Google Maps JavaScript API key.
 * @param mapRef - Ref to the DIV where the map will render.
 * @param setMap - React state setter to store the Google Map instance.
 */
export default function initMap(
  apiKey: string,
  mapRef: RefObject<HTMLDivElement>,
  setMap: Dispatch<GoogleMapType>
): void {
  // If the script is already present, just initialize
  if (!document.getElementById("google-maps-script")) {
    const script = document.createElement("script");
    script.id = "google-maps-script";
    // Load both "places" (for Autocomplete) and "marker" (for AdvancedMarkerElement)
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => initializeMap();
  } else {
    initializeMap();
  }

  /**
   *
   */
  function initializeMap(): void {
    if (!mapRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 }, // center of USA
      zoom: 4, // reasonable default zoom
      mapTypeId: "roadmap",
      // You MUST supply a mapId for AdvancedMarkerElement to work:
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "DEMO_MAP_ID",
    });

    setMap(map);
  }
}
