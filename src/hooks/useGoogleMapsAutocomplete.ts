// File: src/hooks/useGoogleMapsAutocomplete.ts

import Address from "@/types/address";
import { Map } from "@/types/map";

/**
 * Sets up Google Places Autocomplete on the given inputRef, binds it to the map’s bounds,
 * and adds selected places into either `addresses` or `potentialCentrals` arrays.
 * @param map - The Google Map instance
 * @param inputRef - Ref to the <input> element for place searching
 * @param isCentral - If true, places are added to `potentialCentrals`; otherwise to `addresses`
 * @param addresses - Current array of saved addresses
 * @param potentialCentrals - Current array of potential central locations
 * @param setAddresses - Setter to update `addresses` state
 * @param setPotentialCentrals - Setter to update `potentialCentrals` state
 */
export default function useGoogleMapsAutocomplete(
  map: Map | undefined,
  inputRef: React.RefObject<HTMLInputElement>,
  isCentral: boolean,
  addresses: Address[],
  potentialCentrals: Address[],
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>,
  setPotentialCentrals: React.Dispatch<React.SetStateAction<Address[]>>
): void {
  if (!map || !inputRef.current || !window.google?.maps?.places) return;

  const autocomplete = new window.google.maps.places.Autocomplete(
    inputRef.current
  );
  autocomplete.bindTo("bounds", map);

  const addressExists = (list: Address[], addr: Address): boolean =>
    list.some((a) => a.lat === addr.lat && a.lng === addr.lng);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const newAddress: Address = {
      id: place.place_id || undefined,
      name: place.formatted_address || "",
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };

    if (isCentral) {
      if (!addressExists(potentialCentrals, newAddress)) {
        setPotentialCentrals((prev) => [...prev, newAddress]);
      }
    } else {
      if (!addressExists(addresses, newAddress)) {
        setAddresses((prev) => [...prev, newAddress]);
      }
    }

    inputRef.current!.value = "";
  });
}
