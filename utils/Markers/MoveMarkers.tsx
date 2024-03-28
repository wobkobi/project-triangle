import { Address } from "@/types/Address";
import { Map, Marker } from "@/types/MapTypes";
import { AddMarker } from "@/utils/markers/AddMarker";
export function MoveMarkers(
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

  const addressesToMove: Address[] = [];

  // Use forEach to process each index
  sortedIndexes.forEach((index) => {
    if (isFromCentral) {
      const [address] = potentialCentrals.splice(index, 1);
      if (address) addressesToMove.push(address);
    } else {
      const [address] = addresses.splice(index, 1);
      if (address) addressesToMove.push(address);
    }
  });

  if (isFromCentral) {
    // Add moved addresses to the other list
    setAddresses((prev) => [...prev, ...addressesToMove]);
  } else {
    // Add moved potential centrals to the other list
    setPotentialCentrals((prev) => [...prev, ...addressesToMove]);
  }

  // After moving, re-add all markers to reflect the new state
  AddMarker(map, addresses, potentialCentrals, markersRef, geoCenterMarkerRef);
}
