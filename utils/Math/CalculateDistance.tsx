import { Address } from "@/types/Address";

export function CalculateDistance(address: Address, acc: Address) {
  const latDiff = address.lat - acc.lat;
  const lngDiff = address.lng - acc.lng;

  return Math.sqrt(latDiff ** 2 + lngDiff ** 2);
}
