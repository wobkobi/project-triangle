import { Address } from "@/types/Address";

export function CalculateGeoCenter(addresses: Address[]): Address | null {
  if (addresses.length < 2) {
    return null;
  }

  const sumCoordinates = addresses.reduce(
    (acc, curr) => {
      acc.lat += curr.lat;
      acc.lng += curr.lng;
      return acc;
    },
    { lat: 0, lng: 0 }
  );

  const centerLat = sumCoordinates.lat / addresses.length;
  const centerLng = sumCoordinates.lng / addresses.length;

  return {
    lat: centerLat,
    lng: centerLng,
    name: "Geographical Center",
  };
}
