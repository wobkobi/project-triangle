import Address from "@/types/address";
import { GoogleMapType, Marker } from "@/types/map";
import addMarker from "@/utils/googleMaps/markers/addMarker";

/**
 * Removes the selected items (by index) from either `addresses` or `potentialCentrals`.
 * Also removes their corresponding markers from the map, updates state,
 * and then re-renders all markers (including recalculating the central location).
 * @param indexes - Array of indexes to remove
 * @param isFromCentral - True if removing from `potentialCentrals`; false if from `addresses`
 * @param addresses - Current array of Address objects
 * @param potentialCentrals - Current array of potential central Address objects
 * @param setAddresses - Setter to update `addresses`
 * @param setPotentialCentrals - Setter to update `potentialCentrals`GoogleMapType
 * @param map - Google Map instance (never undefined here)
 * @param markersRef - Ref containing array of existing Marker instances
 * @param geoCenterMarkerRef - Ref containing the geo-center Marker
 * @returns Promise<void>
 */
export default async function removeAddressItems(
  indexes: number[],
  isFromCentral: boolean,
  addresses: Address[],
  potentialCentrals: Address[],
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>,
  setPotentialCentrals: React.Dispatch<React.SetStateAction<Address[]>>,
  map: GoogleMapType,
  markersRef: React.RefObject<Marker[]>,
  geoCenterMarkerRef: React.RefObject<Marker | null>
): Promise<void> {
  // 1) Remove items from the chosen list, working backwards so indexes stay valid
  const sortedIndexes = [...indexes].sort((a, b) => b - a);
  sortedIndexes.forEach((idx) => {
    const list = isFromCentral ? potentialCentrals : addresses;
    if (idx >= 0 && idx < list.length) {
      const [removed] = list.splice(idx, 1);

      // Find & remove that address’s marker from markersRef
      const markerIdx = markersRef.current.findIndex((m) => {
        const pos = m.position;
        if (!pos) return false;
        const latVal = typeof pos.lat === "function" ? pos.lat() : pos.lat;
        const lngVal = typeof pos.lng === "function" ? pos.lng() : pos.lng;
        return latVal === removed.lat && lngVal === removed.lng;
      });

      if (markerIdx > -1) {
        markersRef.current[markerIdx].map = null;
        markersRef.current.splice(markerIdx, 1);
      }
    }
  });

  // 2) Update the state arrays
  if (isFromCentral) {
    setPotentialCentrals([...potentialCentrals]);
  } else {
    setAddresses([...addresses]);
  }

  // 3) If fewer than 2 addresses remain, remove the geo-center marker
  if (addresses.length < 2 && geoCenterMarkerRef.current) {
    geoCenterMarkerRef.current.map = null;
    geoCenterMarkerRef.current = null;
  }

  // 4) Re-add all markers & recalculate the central location
  await addMarker(
    map,
    addresses,
    potentialCentrals,
    markersRef,
    geoCenterMarkerRef
  );
}
