// File: src/utils/googleMaps/markers/addMarker.ts

import Address from "@/types/address";
import type { GoogleMapType } from "@/types/map";
import { RefObject } from "react";

/**
 * Places AdvancedMarkerElement pins on the map:
 * • Red for each “address”
 * • Blue for each “potential central” (excluding the most central)
 * • Yellow for the geographic center of all addresses (if at least one)
 * • Green for the most central location among `potentialCentrals` (if any)
 * Adjusts bounds/zoom:
 * • One marker: fits a small padded bounds around it.
 * • Multiple markers: fits bounds with padding, then caps zoom.
 *
 * Ensures that after any zoom change, all markers remain in view.
 * @param map - GoogleMapType instance
 * @param addresses - Array of Address objects (`{ lat, lng, name }`)
 * @param potentialCentrals - Array of Address objects to consider as central candidates
 * @param markersRef - RefObject collecting all created AdvancedMarkerElements
 * @param geoCenterMarkerRef - RefObject holding the “geographic center” marker
 */
export default async function addMarker(
  map: GoogleMapType,
  addresses: Address[],
  potentialCentrals: Address[],
  markersRef: RefObject<google.maps.marker.AdvancedMarkerElement[]>,
  geoCenterMarkerRef: RefObject<google.maps.marker.AdvancedMarkerElement | null>
): Promise<void> {
  if (!map) return;

  // Dynamically import calculateGeoCenter and calculateMostCentral
  const { default: calculateGeoCenter } = await import(
    "@/utils/googleMaps/calculations/calculateGeoCenter"
  );
  const { default: calculateMostCentral } = await import(
    "@/utils/googleMaps/calculations/calculateMostCentral"
  );

  // Import the “marker” library and cast to MarkerLibrary
  const markerLib = (await google.maps.importLibrary(
    "marker"
  )) as google.maps.MarkerLibrary;
  const { PinElement, AdvancedMarkerElement } = markerLib;

  // 1) Red pins for addresses
  for (const addr of addresses) {
    const position = { lat: addr.lat, lng: addr.lng };
    const redPin = new PinElement({
      background: "#ea4335",
      borderColor: "#c5221f",
      glyphColor: "#b31412",
    });
    const marker = new AdvancedMarkerElement({
      map,
      position,
      content: redPin.element,
      title: addr.name,
    });
    markersRef.current.push(marker);
  }

  // 2) Compute “most central” among potentialCentrals
  const mostCentral = calculateMostCentral(addresses, potentialCentrals);

  // 3) Blue pins for each potential central that is not the “most central”
  for (const central of potentialCentrals) {
    const isMost =
      mostCentral !== null &&
      central.lat === mostCentral.lat &&
      central.lng === mostCentral.lng;
    if (!isMost) {
      const position = { lat: central.lat, lng: central.lng };
      const bluePin = new PinElement({
        background: "#4285f4",
        borderColor: "#357ae8",
        glyphColor: "#2a56c6",
      });
      const marker = new AdvancedMarkerElement({
        map,
        position,
        content: bluePin.element,
        title: central.name,
      });
      markersRef.current.push(marker);
    }
  }

  // 4) Yellow pin for geographic center (if at least one address)
  if (addresses.length > 0) {
    const geoCenter = calculateGeoCenter(addresses);
    if (geoCenter) {
      const position = { lat: geoCenter.lat, lng: geoCenter.lng };
      const yellowPin = new PinElement({
        background: "#fbbc05",
        borderColor: "#e9ab04",
        glyphColor: "#c98f02",
      });
      const marker = new AdvancedMarkerElement({
        map,
        position,
        content: yellowPin.element,
        title: "Geographic Center",
      });
      geoCenterMarkerRef.current = marker;
    }
  }

  // 5) Green pin for “most central” (if any)
  if (mostCentral) {
    const position = { lat: mostCentral.lat, lng: mostCentral.lng };
    const greenPin = new PinElement({
      background: "#34a853",
      borderColor: "#2c8f47",
      glyphColor: "#22733e",
    });
    const marker = new AdvancedMarkerElement({
      map,
      position,
      content: greenPin.element,
      title: "Most Central",
    });
    markersRef.current.push(marker);
  }

  // 6) Adjust bounds/zoom so that all markers stay on screen
  const bounds = new google.maps.LatLngBounds();
  const allPoints = [
    ...addresses.map((a) => ({ lat: a.lat, lng: a.lng })),
    ...potentialCentrals.map((c) => ({ lat: c.lat, lng: c.lng })),
  ];

  if (allPoints.length === 1) {
    // One point: create a small padded bounding box around it
    const pt = allPoints[0];
    const padding = 0.05; // ~0.05° ≈ 5km
    const ne = { lat: pt.lat + padding, lng: pt.lng + padding };
    const sw = { lat: pt.lat - padding, lng: pt.lng - padding };
    const singleBounds = new google.maps.LatLngBounds(sw, ne);
    map.fitBounds(singleBounds);
  } else if (allPoints.length > 1) {
    // Multiple points: extend bounds over every marker
    for (const pt of allPoints) {
      bounds.extend(pt);
    }
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    // After fitting, cap zoom to 14 if it zoomed in too far
    google.maps.event.addListenerOnce(map, "idle", () => {
      if ((map.getZoom() || 0) > 14) {
        map.setZoom(14);
      }
    });
  }
}
