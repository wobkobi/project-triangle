// File: src/utils/googleMaps/calculations/calculateMostCentral.ts

import Address from "@/types/address";

/**
 * CalculateMostCentralLocation: among a set of potential central addresses,
 * choose the one whose sum of straight-line distances to all addresses is minimal.
 * @param addresses - List of all Address objects (each with { lat, lng, name })
 * @param potentialCentrals - List of Address objects to consider as central candidates
 * @returns The Address from potentialCentrals that minimizes total distance to `addresses`, or null if none
 */
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

  let mostCentral: Address | null = null;
  let minTotalDistance = Infinity;

  // For each candidate central, compute sum of distances to all addresses.
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

/**
 * CalculateDistance: compute great‐circle distance (in km) between two points.
 * @param point1 - An Address object with { lat, lng }
 * @param point2 - Another Address object with { lat, lng }
 * @returns The distance in kilometers between point1 and point2
 */
function CalculateDistance(point1: Address, point2: Address): number {
  const { lat: lat1, lng: lng1 } = point1;
  const { lat: lat2, lng: lng2 } = point2;
  const earthRadius = 6371; // in kilometers

  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);

  const chordLengthSquared =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(chordLengthSquared),
      Math.sqrt(1 - chordLengthSquared)
    );

  return earthRadius * angularDistance;
}

/**
 * deg2rad: convert degrees to radians.
 * @param deg - Angle in degrees
 * @returns Equivalent angle in radians
 */
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
