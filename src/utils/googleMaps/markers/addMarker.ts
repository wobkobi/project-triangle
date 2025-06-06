// File: src/utils/googleMaps/markers/addMarker.ts

import type Address from "@/types/address";
import type { Map as GoogleMapType } from "@/types/map";
import type { MutableRefObject } from "react";

/**
 * addMarker:
 * - Places AdvancedMarkerElement pins for `addresses` (red) and `potentialCentrals` (blue).
 * - Chooses the “most central” candidate from potentialCentrals (straight-line or driving time).
 * - Places a green pin on that “most central” and a yellow pin at the geographic center.
 * @param map - Google Map instance
 * @param addresses - Array of Address ({ lat, lng, name })
 * @param potentialCentrals - Array of Address to consider
 * @param markersRef - Ref to collect all created AdvancedMarkerElement instances
 * @param geoCenterMarkerRef - Ref for the geographic-center marker (yellow)
 * @param useRoads - If true, sum driving durations via DirectionsService; otherwise use Haversine
 * @returns Promise<Address | null> chosen “most central” Address from potentialCentrals
 */
export default async function addMarker(
  map: GoogleMapType,
  addresses: Address[],
  potentialCentrals: Address[],
  markersRef: MutableRefObject<google.maps.marker.AdvancedMarkerElement[]>,
  geoCenterMarkerRef: MutableRefObject<google.maps.marker.AdvancedMarkerElement | null>,
  useRoads: boolean
): Promise<Address | null> {
  if (potentialCentrals.length === 0) {
    throw new Error("No potential centrals available");
  }

  // Dynamically load the “marker” library to get PinElement & AdvancedMarkerElement
  const markerLib = (await (
    google.maps as unknown as {
      importLibrary: (lib: "marker") => Promise<{
        PinElement: typeof google.maps.marker.PinElement;
        AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
      }>;
    }
  ).importLibrary("marker")) as {
    PinElement: typeof google.maps.marker.PinElement;
    AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement;
  };
  const { PinElement, AdvancedMarkerElement } = markerLib;

  // Build LatLngBounds to fit all markers
  const bounds = new google.maps.LatLngBounds();

  // 1) Place red pins (addresses)
  addresses.forEach((addr) => {
    const redPin = new PinElement({
      background: "#ff0000", // red
      scale: 1,
    });
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: addr.lat, lng: addr.lng },
      content: redPin.element,
      title: addr.name,
    });
    markersRef.current.push(marker);
    if (marker.position) {
      bounds.extend(marker.position);
    }
  });

  // 2) Place blue pins (potentialCentrals)
  potentialCentrals.forEach((pot) => {
    const bluePin = new PinElement({
      background: "#0000ff", // blue
      scale: 1,
    });
    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: pot.lat, lng: pot.lng },
      content: bluePin.element,
      title: pot.name,
    });
    markersRef.current.push(marker);
    if (marker.position) {
      bounds.extend(marker.position);
    }
  });

  // Auto‐fit map to show all red + blue markers
  map.fitBounds(bounds);

  // 3) Determine “most central” from potentialCentrals
  let mostCentral: Address | null = null;

  if (!useRoads) {
    // Straight-line: sum Haversine distance from each potential → all addresses
    const totalDist = (center: Address): number =>
      addresses.reduce((sum, a) => sum + haversine(a, center), 0);

    let minDist = Infinity;
    potentialCentrals.forEach((center) => {
      const d = totalDist(center);
      if (d < minDist) {
        minDist = d;
        mostCentral = center;
      }
    });
  } else {
    // Road travel-time: sum DirectionsService durations from each address → each potential
    const service = new google.maps.DirectionsService();

    /**
     * getDuration:
     * @param origin - Address origin
     * @param destination - Address destination
     * @returns Promise<number> resolving to travel duration in seconds (or Infinity on failure)
     */
    async function getDuration(
      origin: Address,
      destination: Address
    ): Promise<number> {
      return new Promise((resolve) => {
        service.route(
          {
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: destination.lat, lng: destination.lng },
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (
              status === "OK" &&
              result?.routes?.[0]?.legs?.[0]?.duration?.value != null
            ) {
              resolve(result.routes[0].legs[0].duration.value);
            } else {
              resolve(Infinity);
            }
          }
        );
      });
    }

    let minTime = Infinity;
    // For each candidate, sum durations from all addresses
    for (const center of potentialCentrals) {
      let sumTime = 0;
      for (const addr of addresses) {
        sumTime += await getDuration(addr, center);
      }
      if (sumTime < minTime) {
        minTime = sumTime;
        mostCentral = center;
      }
    }
  }

  // 4) Place a green pin on the chosen “most central” potential
  if (mostCentral) {
    const greenPin = new PinElement({
      background: "#00ff00", // green
      scale: 1,
    });
    const greenMarker = new AdvancedMarkerElement({
      map,
      position: { lat: mostCentral.lat, lng: mostCentral.lng },
      content: greenPin.element,
      title: `Most Central: ${mostCentral.name}`,
    });
    markersRef.current.push(greenMarker);
  }

  // 5) Compute geographic center of all points
  const allPoints = [...addresses, ...potentialCentrals];
  const avgLat =
    allPoints.reduce((sum, p) => sum + p.lat, 0) / allPoints.length;
  const avgLng =
    allPoints.reduce((sum, p) => sum + p.lng, 0) / allPoints.length;

  // Place or update a yellow pin at that geographic center
  const yellowPin = new PinElement({
    background: "#ffff00", // yellow
    scale: 1,
  });
  if (geoCenterMarkerRef.current) {
    geoCenterMarkerRef.current.position = { lat: avgLat, lng: avgLng };
  } else {
    const yellowMarker = new AdvancedMarkerElement({
      map,
      position: { lat: avgLat, lng: avgLng },
      content: yellowPin.element,
      title: "Geographic Center",
    });
    geoCenterMarkerRef.current = yellowMarker;
  }

  return mostCentral;
}

/**
 * Computes straight-line distance (in kilometers) between two lat/lng points using the Haversine formula.
 * @param p1 - First Address
 * @param p2 - Second Address
 * @returns Distance in kilometers
 */
function haversine(p1: Address, p2: Address): number {
  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers
  const dLat = toRad(p2.lat - p1.lat);
  const dLng = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) *
      Math.cos(toRad(p2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
