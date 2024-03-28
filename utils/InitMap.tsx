import { Map } from "@/types/MapTypes";
import { Loader } from "@googlemaps/js-api-loader";
import { Dispatch, RefObject, SetStateAction } from "react";

export const InitMap = async (
  apiKey: string,
  mapRef: RefObject<HTMLDivElement>,
  setMap: Dispatch<SetStateAction<Map | undefined>>
) => {
  const loader = new Loader({
    apiKey: apiKey,
    version: "weekly",
    libraries: ["places", "geometry"],
  });
  try {
    await loader.importLibrary("core"); // Using importLibrary instead of load
    await loader.importLibrary("geometry");
    await loader.importLibrary("places");
    await loader.importLibrary("marker");
    if (mapRef.current) {
      // Initialize map here
      const map = Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 2,
        mapId: "f1b7b3b3b7b3b1f7",
        gestureHandling: "greedy",
      });
      setMap(map);
    }
  } catch (error) {
    console.error("Error loading the Google Maps script", error);
  }
};
