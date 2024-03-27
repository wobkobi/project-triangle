// utils/removeMarker.tsx
import { Address } from "@/types/Address";
import { AddMarker } from "@/utils/Markers/AddMarker";

export const RemoveMarker = (
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
  let removedAddress: Address;

  if (isFromCentral) {
    removedAddress = potentialCentrals.splice(index, 1)[0];
    setPotentialCentrals([...potentialCentrals]);
  } else {
    removedAddress = addresses.splice(index, 1)[0];
    setAddresses([...addresses]);
  }

  const markerIndex = markersRef.current.findIndex(
    (marker) =>
      marker.getPosition()?.lat() === removedAddress.lat &&
      marker.getPosition()?.lng() === removedAddress.lng
  );

  if (markerIndex > -1) {
    markersRef.current[markerIndex].setMap(null);
    markersRef.current.splice(markerIndex, 1);
  }

  if (addresses.length < 2 && geoCenterMarkerRef.current) {
    geoCenterMarkerRef.current.setMap(null);
    geoCenterMarkerRef.current = null;
  }

  if (addresses.length === 0 && potentialCentrals.length === 0) {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  } else {
    AddMarker(
      map,
      addresses,
      potentialCentrals,
      markersRef,
      geoCenterMarkerRef
    );
  }
};
