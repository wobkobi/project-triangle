import type { GoogleMapType } from "@/types/map";
import type { Dispatch, RefObject } from "react";

/**
 * initMap: loads the Maps JS API (with “places” and “marker” libraries),
 * then creates a Google Map centered on New Zealand (using your styled Map ID).
 * @param apiKey – your Google Maps API key
 * @param mapRef – ref to the <div> where the map will render (may be null initially)
 * @param setMap – React state setter to store the Google Map instance
 */
export default function initMap(
  apiKey: string,
  mapRef: RefObject<HTMLDivElement | null>,
  setMap: Dispatch<GoogleMapType>
): void {
  if (!document.getElementById("google-maps-script")) {
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}` +
      `&libraries=places,marker`;
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
      center: { lat: -40.9006, lng: 174.886 },
      zoom: 5,
      mapTypeId: "roadmap",
      mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || "",
    });

    setMap(map);
  }
}
