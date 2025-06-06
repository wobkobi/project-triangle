import Address from "@/types/address";

/**
 * Calculates the simple arithmetic mean (geographical center) of a set of addresses.
 * @param addresses - Array of Address objects (each with lat and lng)
 * @returns A new Address object representing the geo-center, or null if fewer than 2 addresses
 */
export default function calculateGeoCenter(
  addresses: Address[]
): Address | null {
  if (addresses.length < 2) {
    return null; // Need at least two points to compute a center
  }

  // Sum all latitude and longitude values
  const { totalLat, totalLng } = addresses.reduce(
    (acc, curr) => {
      return {
        totalLat: acc.totalLat + curr.lat,
        totalLng: acc.totalLng + curr.lng,
      };
    },
    { totalLat: 0, totalLng: 0 }
  );

  // Compute average latitude and longitude
  const averageLat = totalLat / addresses.length;
  const averageLng = totalLng / addresses.length;

  return {
    lat: averageLat,
    lng: averageLng,
    name: "Geographical Center",
  };
}
