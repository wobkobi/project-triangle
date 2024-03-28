import Address from "@/types/Address";

export default function CalculateGeoCenter(
  addresses: Address[]
): Address | null {
  if (addresses.length < 2) {
    return null; // A geographical center requires at least two distinct points
  }

  // Calculate the total sum of latitude and longitude values
  const totalCoordinates = addresses.reduce(
    (accumulator, currentAddress) => {
      accumulator.totalLat += currentAddress.lat;
      accumulator.totalLng += currentAddress.lng;
      return accumulator;
    },
    { totalLat: 0, totalLng: 0 }
  );

  // Calculate the average latitude and longitude to find the geographical center
  const averageLat = totalCoordinates.totalLat / addresses.length;
  const averageLng = totalCoordinates.totalLng / addresses.length;

  return {
    lat: averageLat,
    lng: averageLng,
    name: "Geographical Center",
  };
}
