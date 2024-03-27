import { Address } from "@/types/Address";
import { CalculateDistance } from "./CalculateDistance";

export function CalculateMostCentralLocation(
  addresses: Address[],
  potentialCentrals: Address[]
): Address | null {
  if (potentialCentrals.length === 0 || addresses.length === 0) {
    return null;
  }

  if (addresses.length < 2) {
    return null;
  }

  let mostCentral: Address | null = null;
  let minAverageDistance = Infinity;

  potentialCentrals.forEach((central) => {
    const totalDistance = addresses.reduce((sum, address) => {
      return sum + CalculateDistance(address, central);
    }, 0);

    const averageDistance = totalDistance / addresses.length;

    if (averageDistance < minAverageDistance) {
      minAverageDistance = averageDistance;
      mostCentral = central;
    }
  });

  return mostCentral;
}
