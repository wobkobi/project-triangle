import Address from "@/types/address";
import { Map, Marker, createMarker, createPin } from "@/types/map";
import calculateGeoCenter from "@/utils/googleMaps/calculations/calculateGeoCenter";
import calculateMostCentral from "@/utils/googleMaps/calculations/calculateMostCentral";
import calculateMostCentralWithRoads from "@/utils/googleMaps/calculations/calculateMostCentralWithRoads";

/**
 * Adds markers for all addresses, potential centrals, the geographical center, and the most central address.
 * Clears existing markers first, then re-adds them all.
 * @param map - The Google Map instance
 * @param addresses - Array of Address objects representing all addresses
 * @param potentialCentrals - Array of Address objects representing potential central locations
 * @param markersRef - Ref object holding an array of existing Marker instances
 * @param geoCenterMarkerRef - Ref to store the “geographical center” marker instance
 * @param useRoads - If true, compute “most central” based on driving distance; otherwise use straight-line
 * @returns The Address object determined to be most central
 */
export default async function addMarker(
  map: Map,
  addresses: Address[],
  potentialCentrals: Address[],
  markersRef: React.MutableRefObject<Marker[]>,
  geoCenterMarkerRef: React.MutableRefObject<Marker | null>,
  useRoads: boolean
): Promise<Address> {
  // 1) Remove previous geo-center marker if it exists
  if (geoCenterMarkerRef.current) {
    geoCenterMarkerRef.current.map = null;
    geoCenterMarkerRef.current = null;
  }

  // 2) Remove existing markers
  markersRef.current.forEach((m) => {
    m.map = null;
  });
  markersRef.current = [];

  // 3) Add red markers for each “address”
  addresses.forEach(({ lat, lng }) => {
    const position = new google.maps.LatLng(lat, lng);
    const redPin = createPin({
      background: "#ea4335",
      borderColor: "#c5221f",
      glyphColor: "#b31412",
    });
    const marker = createMarker({
      position,
      map,
      content: redPin.element,
    });
    markersRef.current.push(marker);
  });

  // 4) Determine the most central address (using roads or straight-line)
  let mostCentralAddress: Address | null = null;
  if (useRoads) {
    mostCentralAddress = await calculateMostCentralWithRoads(addresses);
  } else {
    mostCentralAddress = calculateMostCentral(addresses, potentialCentrals);
  }

  if (!mostCentralAddress) {
    // Fallback: pick first available
    if (addresses.length > 0) {
      mostCentralAddress = addresses[0];
    } else if (potentialCentrals.length > 0) {
      mostCentralAddress = potentialCentrals[0];
    } else {
      throw new Error("No valid addresses or potential centrals available");
    }
  }

  // 5) Add blue markers for each “potential central” except the one flagged as most central
  potentialCentrals.forEach((central) => {
    if (
      !mostCentralAddress ||
      central.lat !== mostCentralAddress.lat ||
      central.lng !== mostCentralAddress.lng
    ) {
      const position = new google.maps.LatLng(central.lat, central.lng);
      const bluePin = createPin({
        background: "#4285f4",
        borderColor: "#357ae8",
        glyphColor: "#2a56c6",
      });
      const marker = createMarker({
        position,
        map,
        content: bluePin.element,
      });
      markersRef.current.push(marker);
    }
  });

  // 6) Add yellow marker for the “geographical center” of all addresses
  const geoCenter = calculateGeoCenter(addresses);
  if (geoCenter) {
    const position = new google.maps.LatLng(geoCenter.lat, geoCenter.lng);
    const yellowPin = createPin({
      background: "#fbbc05",
      borderColor: "#e9ab04",
      glyphColor: "#c98f02",
    });
    const marker = createMarker({
      position,
      map,
      content: yellowPin.element,
    });
    geoCenterMarkerRef.current = marker;
  }

  // 7) Add a green marker for the “most central” address
  if (mostCentralAddress) {
    const position = new google.maps.LatLng(
      mostCentralAddress.lat,
      mostCentralAddress.lng
    );
    const greenPin = createPin({
      background: "#34a853",
      borderColor: "#2c8f47",
      glyphColor: "#22733e",
    });
    const greenMarker = createMarker({
      position,
      map,
      content: greenPin.element,
    });
    markersRef.current.push(greenMarker);
  }

  // 8) Fit map bounds to include every marker (addresses + potentials)
  const bounds = new google.maps.LatLngBounds();
  addresses.concat(potentialCentrals).forEach(({ lat, lng }) => {
    bounds.extend(new google.maps.LatLng(lat, lng));
  });
  map.fitBounds(bounds, { top: 25, right: 25, bottom: 25, left: 25 });

  return mostCentralAddress;
}
