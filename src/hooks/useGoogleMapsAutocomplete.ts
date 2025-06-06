// File: src/hooks/useGoogleMapsAutocomplete.ts

import Address from "@/types/address";
import { Dispatch, RefObject, SetStateAction, useEffect } from "react";

interface UseAutocompleteParams {
  map: google.maps.Map; // must be non-null when called
  inputRef: RefObject<HTMLInputElement | null>;
  isCentral: boolean;
  addresses: Address[];
  potentialCentrals: Address[];
  setAddresses: Dispatch<SetStateAction<Address[]>>;
  setPotentialCentrals: Dispatch<SetStateAction<Address[]>>;
}

/**
 * Sets up Google Places Autocomplete on the given input element,
 * binding its bounds to the current map viewport and preventing duplicates.
 * @param params - Object containing all autocomplete parameters.
 * @param params.map - The initialized Google Map instance used to bias autocomplete results.
 * @param params.inputRef - Ref to the `<input>` element where Places Autocomplete is attached.
 * @param params.isCentral - When true, newly selected locations are added to `potentialCentrals`; otherwise, to `addresses`.
 * @param params.addresses - Current array of Address objects (each with `lat`, `lng`, `name`, and now `title`) in the “Addresses” list.
 * @param params.potentialCentrals - Current array of Address objects in the “Potential Centrals” list.
 * @param params.setAddresses - React setter to update the `addresses` array.
 * @param params.setPotentialCentrals - React setter to update the `potentialCentrals` array.
 */
export default function useGoogleMapsAutocomplete({
  map,
  inputRef,
  isCentral,
  addresses,
  potentialCentrals,
  setAddresses,
  setPotentialCentrals,
}: UseAutocompleteParams): void {
  useEffect(() => {
    if (!map || !inputRef.current) return;

    // 1) Create Autocomplete tied to the input element
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      fields: ["place_id", "formatted_address", "geometry", "name"],
    });

    // 2) Bind Autocomplete bounds to the map's viewport
    autocomplete.bindTo("bounds", map);

    // 3) Helper to check for duplicates by lat/lng
    const addressExists = (array: Address[], addr: Address): boolean =>
      array.some((a) => a.lat === addr.lat && a.lng === addr.lng);

    // 4) When a place is selected: add if not duplicate, then clear input
    const placeChangedListener = autocomplete.addListener(
      "place_changed",
      () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) return;

        const newAddr: Address = {
          id: place.place_id ?? undefined,
          title: place.name ?? "",
          name: place.formatted_address ?? place.name ?? "",
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        if (isCentral) {
          if (!addressExists(potentialCentrals, newAddr)) {
            setPotentialCentrals((prev) => [...prev, newAddr]);
          }
        } else {
          if (!addressExists(addresses, newAddr)) {
            setAddresses((prev) => [...prev, newAddr]);
          }
        }

        inputRef.current!.value = "";
      }
    );

    // 5) Cleanup on unmount or dependency change
    return () => {
      google.maps.event.removeListener(placeChangedListener);
    };
  }, [
    map,
    inputRef,
    isCentral,
    addresses,
    potentialCentrals,
    setAddresses,
    setPotentialCentrals,
  ]);
}
