import Address from "@/types/Address";

export default function CalculateMostCentralLocation(
  addresses: Address[],
  potentialCentrals: Address[]
): Address | null {
  if (potentialCentrals.length === 0 || addresses.length === 0) {
    return null;
  }

  if (potentialCentrals.length === 1) {
    return null;
  }

  // Find the most central location
  let mostCentral: Address | null = null;
  let minTotalDistance = Infinity;

  // Calculate the total distance from each potential central location
  potentialCentrals.forEach((central) => {
    const totalDistance = addresses.reduce(
      (sum, address) => sum + CalculateDistance(address, central),
      0
    );

    // Update the most central location if a better one is found
    if (totalDistance < minTotalDistance) {
      minTotalDistance = totalDistance;
      mostCentral = central;
    }
  });

  return mostCentral;
}

// Calculate the distance between two points
function CalculateDistance(point1: Address, point2: Address) {
  const { lat: lat1, lng: lng1 } = point1;
  const { lat: lat2, lng: lng2 } = point2;

  // Radius of the Earth in kilometers
  const earthRadius = 6371;

  // Convert latitude and longitude from degrees to radians
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);

  // Calculate the chord length squared between the points
  const chordLengthSquared =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  // Calculate the angular distance in radians
  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(chordLengthSquared),
      Math.sqrt(1 - chordLengthSquared)
    );
  const distance = earthRadius * angularDistance;
  return distance;
}

// Convert degrees to radians
function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
