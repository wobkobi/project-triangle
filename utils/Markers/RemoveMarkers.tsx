import Address from "@/types/Address";
import { Map, Marker } from "@/types/MapTypes";
import AddMarker from "@/utils/markers/AddMarker";

export default function RemoveMarkers(
  indexes: number[],
  isFromCentral: boolean,
  addresses: Address[],
  potentialCentrals: Address[],
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>,
  setPotentialCentrals: React.Dispatch<React.SetStateAction<Address[]>>,
  map: Map | null,
  markersRef: React.MutableRefObject<Marker[]>,
  geoCenterMarkerRef: React.MutableRefObject<Marker | null>
) {
  if (!map) return;

  // Sort and reverse the indexes to handle splicing correctly
  const sortedIndexes = [...indexes].sort((a, b) => b - a);

  sortedIndexes.forEach((index) => {
    // Determine from which list to remove
    const list = isFromCentral ? potentialCentrals : addresses;
    if (index >= 0 && index < list.length) {
      const [removedAddress] = list.splice(index, 1);

      // Find and remove the corresponding marker
      const markerIndex = markersRef.current.findIndex(
        (marker) =>
          marker.position?.lat === removedAddress.lat &&
          marker.position?.lng === removedAddress.lng
      );

      if (markerIndex > -1) {
        markersRef.current[markerIndex].map = null;
        markersRef.current.splice(markerIndex, 1);
      }
    }
  });

  // Update states after removal
  if (isFromCentral) {
    setPotentialCentrals([...potentialCentrals]);
  } else {
    setAddresses([...addresses]);
  }

  // Check if geo center marker should be removed or updated
  if (addresses.length < 2 && geoCenterMarkerRef.current) {
    geoCenterMarkerRef.current.map = null;
    geoCenterMarkerRef.current = null;
  }

  // Re-calculate and add markers to reflect the changes
  AddMarker(map, addresses, potentialCentrals, markersRef, geoCenterMarkerRef);
}
