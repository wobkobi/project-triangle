import { Address } from "@/types/Address";
import { Map } from "@/types/MapTypes";
export default function GoogleMapsAutocomplete(
  map: Map | undefined,
  inputRef: React.RefObject<HTMLInputElement>,
  isCentral: boolean,
  addresses: Address[],
  potentialCentrals: Address[],
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>,
  setPotentialCentrals: React.Dispatch<React.SetStateAction<Address[]>>
) {
  if (!map || !inputRef.current) return;

  const autocomplete = new window.google.maps.places.Autocomplete(
    inputRef.current
  );
  autocomplete.bindTo("bounds", map);
  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) return;

    const newAddress = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      name: place.formatted_address || "",
    };

    // Function to check for duplicate addresses
    const addressExists = (addressArray: Address[], address: Address) =>
      addressArray.some((a) => a.lat === address.lat && a.lng === address.lng);

    // Handle adding new addresses or potential centrals based on the current mode
    if (isCentral) {
      if (!addressExists(potentialCentrals, newAddress))
        setPotentialCentrals((prev: any) => [...prev, newAddress]);
    } else {
      if (!addressExists(addresses, newAddress))
        setAddresses((prev: any) => [...prev, newAddress]);
    }

    // Clear the input field after adding a new place
    if (inputRef.current) inputRef.current.value = "";
  });
}
