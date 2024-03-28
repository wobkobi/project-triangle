import Address from "@/types/Address";
import {
  LatLng,
  LatLngBounds,
  Map,
  Marker,
  PinElement,
} from "@/types/MapTypes";
import { CalculateGeoCenter } from "@/utils/math/CalculateGeoCenter";
import { CalculateMostCentralLocation } from "@/utils/math/CalulateMostCentralLocation";

export default function AddMarker(
  map: Map,
  addresses: Address[],
  potentialCentrals: Address[],
  markers: React.MutableRefObject<Marker[]>,
  geoCenterMarkerRef: React.MutableRefObject<Marker | null>
) {
  if (!map) return;

  // Remove previous geo center marker if it exists
  if (geoCenterMarkerRef.current) {
    geoCenterMarkerRef.current.map = null;
    geoCenterMarkerRef.current = null;
  }

  // Clear existing markers
  markers.current.forEach((marker) => (marker.map = null));
  markers.current = [];

  // Add markers for addresses
  addresses.forEach(({ lat, lng }) => {
    const position = LatLng(lat, lng);
    const redPin = PinElement({
      background: "#ea4335",
      borderColor: "#c5221f",
      glyphColor: "#b31412",
    });
    const marker = Marker({
      position,
      map,
      content: redPin.element,
    });
    markers.current.push(marker);
  });

  // Determine the most central location if any
  const mostCentralAddress = CalculateMostCentralLocation(
    addresses,
    potentialCentrals
  );

  // Add markers for potential central locations
  potentialCentrals.forEach((central) => {
    if (
      !mostCentralAddress ||
      central.lat !== mostCentralAddress.lat ||
      central.lng !== mostCentralAddress.lng
    ) {
      const position = LatLng(central.lat, central.lng);
      const bluePin = PinElement({
        background: "#4285f4",
        borderColor: "#357ae8",
        glyphColor: "#2a56c6",
      });
      const marker = Marker({
        position,
        map,
        content: bluePin.element,
      });
      markers.current.push(marker);
    }
  });

  // Add marker for the geographical center
  const geoCenter = CalculateGeoCenter(addresses);
  if (geoCenter) {
    const position = LatLng(geoCenter.lat, geoCenter.lng);
    const yellowPin = PinElement({
      background: "#fbbc05",
      borderColor: "#e9ab04",
      glyphColor: "#c98f02",
    });
    const marker = Marker({
      position,
      map,
      content: yellowPin.element,
    });
    geoCenterMarkerRef.current = marker;
  }

  // Add a green marker for the most central location
  if (mostCentralAddress) {
    const position = LatLng(mostCentralAddress.lat, mostCentralAddress.lng);
    const greenPin = PinElement({
      background: "#34a853",
      borderColor: "#2c8f47",
      glyphColor: "#22733e",
    });
    const greenMarker = Marker({
      position,
      map,
      content: greenPin.element,
    });
    markers.current.push(greenMarker);
  }

  // Adjust map bounds to include all markers
  const adjustBoundsAndZoom = () => {
    const bounds = LatLngBounds();
    addresses.concat(potentialCentrals).forEach(({ lat, lng }) => {
      bounds.extend(LatLng(lat, lng));
    });

    // Increase padding to ensure markers are comfortably within view
    const paddingOptions = { top: 25, right: 25, bottom: 25, left: 25 }; // Increased padding
    map.fitBounds(bounds, paddingOptions);
  };

  // Call adjustBoundsAndZoom after adding markers or whenever necessary
  if (map) {
    adjustBoundsAndZoom();
  }
}
