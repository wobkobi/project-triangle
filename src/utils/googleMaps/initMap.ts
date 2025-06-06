import { createMap as CreateMap } from "@/types/map";
import { Loader } from "@googlemaps/js-api-loader";
import { Dispatch, RefObject, SetStateAction } from "react";

/**
 * Loads the Google Maps JS API and initializes a map in the given container.
 * @param apiKey - Your Google Maps API key
 * @param mapRef - Ref to the HTML <div> where the map should be mounted
 * @param setMap - State setter to save the created Map instance
 * @returns Promise<void>
 */
export default async function initMap(
  apiKey: string,
  mapRef: RefObject<HTMLDivElement>,
  setMap: Dispatch<SetStateAction<ReturnType<typeof CreateMap> | undefined>>
): Promise<void> {
  const loader = new Loader({
    apiKey,
    version: "weekly",
    libraries: ["places", "geometry", "marker"],
  });

  try {
    await loader.load();

    if (mapRef.current) {
      const map = CreateMap(mapRef.current, {
        center: { lat: 40.7128, lng: -74.006 },
        zoom: 2,
        mapId: "f1b7b3b3b7b3b1f7",
      });
      setMap(map);
    }
  } catch (error) {
    console.error("Error loading Google Maps:", error);
  }
}
