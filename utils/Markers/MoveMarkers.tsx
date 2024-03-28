import Address from "@/types/Address";
import { Map, Marker } from "@/types/MapTypes";
import AddMarker from "@/utils/Markers/AddMarker";

export default function MoveMarkers(
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

  // Create a function to check if the address already exists in the target list
  const addressExists = (address: Address, list: Address[]) => {
    return list.some(
      (existingAddress) =>
        existingAddress.lat === address.lat &&
        existingAddress.lng === address.lng
    );
  };

  sortedIndexes.forEach((index) => {
    const listToRemoveFrom = isFromCentral ? potentialCentrals : addresses;
    const listToAddTo = isFromCentral ? addresses : potentialCentrals;
    const [address] = listToRemoveFrom.splice(index, 1);

    if (address && !addressExists(address, listToAddTo)) {
      listToAddTo.push(address);
    } else {
      // Add it back to its original list and show a popup
      listToRemoveFrom.splice(index, 0, address);
      window.alert("You can't have duplicates in the same list.");
    }
  });

  // Set the new state for both lists
  setAddresses([...addresses]);
  setPotentialCentrals([...potentialCentrals]);

  // After moving, re-add all markers to reflect the new state
  AddMarker(map, addresses, potentialCentrals, markersRef, geoCenterMarkerRef);
}
