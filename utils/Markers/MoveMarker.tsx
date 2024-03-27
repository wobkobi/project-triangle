// utils/moveMarker.tsx
import { Address } from "@/types/Address";
import { AddMarker } from "@/utils/Markers/AddMarker";

export const MoveMarker = (
  index: number,
  isFromCentral: boolean,
  addresses: Address[],
  potentialCentrals: Address[],
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>,
  setPotentialCentrals: React.Dispatch<React.SetStateAction<Address[]>>,
  map: google.maps.Map | null,
  markersRef: React.MutableRefObject<google.maps.Marker[]>,
  geoCenterMarkerRef: React.MutableRefObject<google.maps.Marker | null>
) => {
  if (!map) return;
  const addressToMove = isFromCentral
    ? potentialCentrals.splice(index, 1)[0]
    : addresses.splice(index, 1)[0];

  if (isFromCentral) {
    setAddresses((prev) => [...prev, addressToMove]);
  } else {
    setPotentialCentrals((prev) => [...prev, addressToMove]);
  }

  AddMarker(map, addresses, potentialCentrals, markersRef, geoCenterMarkerRef);
};
