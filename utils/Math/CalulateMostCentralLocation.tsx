import { Address } from "@/types/Address";

export function CalculateMostCentralLocation(
  addresses: Address[],
  potentialCentrals: Address[]
): Address | null {
  if (potentialCentrals.length === 0 || addresses.length === 0) {
    return null;
  }

  if (potentialCentrals.length === 1) {
    return null;
  }

  let mostCentral: Address | null = null;
  let minTotalDistance = Infinity;

  potentialCentrals.forEach((central) => {
    const totalDistance = addresses.reduce(
      (sum, address) => sum + CalculateDistance(address, central),
      0
    );

    if (totalDistance < minTotalDistance) {
      minTotalDistance = totalDistance;
      mostCentral = central;
    }
  });

  return mostCentral;
}

function CalculateDistance(point1: Address, point2: Address) {
  const { lat: lat1, lng: lng1 } = point1;
  const { lat: lat2, lng: lng2 } = point2;

  const R = 6371;

  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
