import { Address } from "@/types/Address";
import { CalculateGeoCenter } from "../Math/CalculateGeoCenter";
import { CalculateMostCentralLocation } from "../Math/CalulateMostCentralLocation";

export function AddMarker(
  map: google.maps.Map,
  addresses: Address[],
  potentialCentrals: Address[],
  markers: React.MutableRefObject<google.maps.Marker[]>,
  geoCenterMarkerRef: React.MutableRefObject<google.maps.Marker | null>
) {
  if (!map) return;

  // Remove previous geo center marker if it exists
  if (geoCenterMarkerRef.current) {
    geoCenterMarkerRef.current.setMap(null);
    geoCenterMarkerRef.current = null;
  }

  // Clear existing markers
  markers.current.forEach((marker) => marker.setMap(null));
  markers.current = [];

  // Add markers for addresses
  addresses.forEach(({ lat, lng }) => {
    const position = new google.maps.LatLng(lat, lng);
    const marker = new google.maps.Marker({
      position,
      map,
      icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
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
      const position = new google.maps.LatLng(central.lat, central.lng);
      const marker = new google.maps.Marker({
        position,
        map,
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
      markers.current.push(marker);
    }
  });

  // Add marker for the geographical center
  const geoCenter = CalculateGeoCenter(addresses);
  if (geoCenter) {
    const position = new google.maps.LatLng(geoCenter.lat, geoCenter.lng);
    const marker = new google.maps.Marker({
      position,
      map,
      icon: "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
    });
    geoCenterMarkerRef.current = marker;
  }

  // Add a green marker for the most central location
  if (mostCentralAddress) {
    const position = new google.maps.LatLng(
      mostCentralAddress.lat,
      mostCentralAddress.lng
    );
    const marker = new google.maps.Marker({
      position,
      map,
      icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
    });
    markers.current.push(marker);
  }

  // Adjust map bounds to include all markers
  const adjustBoundsAndZoom = () => {
    const bounds = new google.maps.LatLngBounds();
    addresses.concat(potentialCentrals).forEach(({ lat, lng }) => {
      bounds.extend(new google.maps.LatLng(lat, lng));
    });
    map.fitBounds(bounds, { top: 10, right: 10, bottom: 10, left: 10 }); // Adding some padding
  };

  // Call adjustBoundsAndZoom after adding markers or whenever necessary
  if (map) {
    adjustBoundsAndZoom();
  }
}
