import Address from "@/types/address";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface DistanceMatrixResponse {
  rows: {
    elements: {
      distance: {
        value: number;
      };
      status: string;
    }[];
  }[];
}

/**
 * Queries Google Distance Matrix API to compute pairwise driving distances between each pair of addresses.
 * @param addresses - Array of Address objects (each with lat and lng)
 * @returns A 2D array (matrix) of distances in meters
 * @throws If the API response structure is unexpected
 */
async function getDistances(addresses: Address[]): Promise<number[][]> {
  if (addresses.length === 0) {
    return [];
  }

  // Build "lat,lng" strings for origins and destinations
  const coordStrings = addresses.map((addr) => `${addr.lat},${addr.lng}`);
  const origins = encodeURIComponent(coordStrings.join("|"));
  const destinations = origins; // same list for both origins and destinations

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${origins}&destinations=${destinations}&key=${GOOGLE_MAPS_API_KEY}`;

  const response = await axios.get<DistanceMatrixResponse>(url);
  const data = response.data;

  if (!data.rows || data.rows.length !== addresses.length) {
    throw new Error("Unexpected response structure from Distance Matrix API");
  }

  // Construct a symmetric distance matrix (in meters)
  const matrix: number[][] = data.rows.map((row) => {
    if (!row.elements || row.elements.length !== addresses.length) {
      throw new Error("Mismatched elements in Distance Matrix API response");
    }
    return row.elements.map((el) => {
      if (el.status !== "OK") {
        // If a route cannot be calculated, treat distance as Infinity
        return Infinity;
      }
      return el.distance.value;
    });
  });

  return matrix;
}

/**
 * Given a matrix of pairwise distances, finds the index of the address
 * with the smallest sum of distances to all others.
 * @param distances - 2D array of distances between addresses
 * @returns Index of the most central address
 */
function findMostCentralIndex(distances: number[][]): number {
  let bestIndex = 0;
  let bestSum = Infinity;

  for (let i = 0; i < distances.length; i++) {
    const sum = distances[i].reduce((acc, curr) => acc + curr, 0);
    if (sum < bestSum) {
      bestSum = sum;
      bestIndex = i;
    }
  }

  return bestIndex;
}

/**
 * Calculates which address is most central by driving distance using the Google Distance Matrix API.
 * @param addresses - Array of Address objects to evaluate
 * @returns The Address object most central by driving distance, or null if none
 */
export default async function calculateMostCentralWithRoads(
  addresses: Address[]
): Promise<Address | null> {
  if (addresses.length === 0) {
    return null;
  }

  try {
    const distances = await getDistances(addresses);
    const mostCentralIndex = findMostCentralIndex(distances);
    console.log(
      "calculateMostCentralWithRoads: Most Central Index",
      mostCentralIndex
    );
    return addresses[mostCentralIndex];
  } catch (error) {
    console.error("Error calculating central location using roads:", error);
    return null;
  }
}
