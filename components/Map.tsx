import { Loader } from "@googlemaps/js-api-loader";
import React, { useEffect, useRef, useState } from "react";

interface MapProps {
  apiKey: string;
}

interface Address {
  lat: number;
  lng: number;
  name: string;
  marker: google.maps.Marker;
}

const Map: React.FC<MapProps> = ({ apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [centralMarker, setCentralMarker] = useState<
    google.maps.Marker | undefined
  >(undefined);
  const [centralAddress, setCentralAddress] = useState<string>("");
  const markers = useRef<google.maps.Marker[]>([]); // Store markers in a ref

  const updateURL = (currentAddresses: Address[]) => {
    const params = new URLSearchParams();
    currentAddresses.forEach((address, index) => {
      params.append(
        `address${index}`,
        JSON.stringify({
          lat: address.lat,
          lng: address.lng,
          name: address.name,
        })
      );
    });
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params}`
    );
  };

  const loadAddressesFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const loadedAddresses: Address[] = [];
    params.forEach((value) => {
      try {
        const address = JSON.parse(value);
        if (address && address.lat && address.lng && address.name) {
          loadedAddresses.push(address);
        }
      } catch (error) {
        console.error("Error parsing address from URL:", error);
      }
    });
    setAddresses(loadedAddresses);
  };

  useEffect(() => {
    loadAddressesFromURL();
    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const initialCenter = { lat: 0, lng: 0 };
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 8,
        });
        setMap(newMap);

        setupAutocomplete(newMap);
      }
    });
  }, [apiKey]);

  const setupAutocomplete = (map: google.maps.Map) => {
    if (!inputRef.current) return;
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current
    );
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const name = place.formatted_address || "";
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
      });
      setAddresses((prev) => [...prev, { lat, lng, name, marker }]);
      if (inputRef.current) inputRef.current.value = "";
    });
  };

  useEffect(() => {
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];

    if (map) {
      const bounds = new window.google.maps.LatLngBounds();
      addresses.forEach((address) => {
        const position = new window.google.maps.LatLng(
          address.lat,
          address.lng
        );
        bounds.extend(position);

        // Recreate markers for current addresses
        const marker = new google.maps.Marker({
          position,
          map,
        });
        markers.current.push(marker); // Store the marker
      });
      if (addresses.length >= 2) {
        const centralLat =
          addresses.reduce((acc, { lat }) => acc + lat, 0) / addresses.length;
        const centralLng =
          addresses.reduce((acc, { lng }) => acc + lng, 0) / addresses.length;
        const centralPosition = new window.google.maps.LatLng(
          centralLat,
          centralLng
        );

        if (centralMarker) {
          centralMarker.setPosition(centralPosition);
        } else {
          const marker = new window.google.maps.Marker({
            position: centralPosition,
            map: map,
            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          });
          setCentralMarker(marker);
        }
        setCentralAddress(
          `Central Point: ${centralLat.toFixed(5)}, ${centralLng.toFixed(5)}`
        );
      } else {
        if (centralMarker) centralMarker.setMap(null);
        setCentralMarker(undefined);
        setCentralAddress("");
      }

      map.fitBounds(bounds);
      updateURL(addresses); // Update URL as necessary
    }
  }, [map, addresses]);

  const removeAddress = (indexToRemove: number) => {
    // Directly access and remove the marker associated with the address to be removed
    if (addresses[indexToRemove]?.marker) {
      addresses[indexToRemove].marker.setMap(null);

      // Filter out the address and its marker
      const updatedAddresses = addresses.filter(
        (_, index) => index !== indexToRemove
      );

      // Update the addresses state
      setAddresses(updatedAddresses);
    } else {
      console.error("Attempted to remove an address without a marker.");
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="p-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter an address"
          className="w-full rounded border border-gray-300 p-4 text-xl shadow focus:border-blue-500 focus:outline-none" // Tailwind classes for styling
        />
      </div>
      <div ref={mapRef} className="flex-grow" style={{ width: "100%" }} />
      <div className="overflow-auto" style={{ maxHeight: "300px" }}>
        <h2 className="mb-2 text-lg font-semibold">Address List:</h2>
        <ul className="list-disc space-y-2 pl-5">
          {addresses.map((address, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded bg-gray-100 p-2">
              <span>{address.name}</span>
              <button
                onClick={() => removeAddress(index)}
                className="focus:shadow-outline ml-4 rounded bg-red-500 px-2 py-1 font-bold text-white hover:bg-red-700 focus:outline-none">
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      {centralAddress && (
        <div className="mt-4 p-4">
          <h2 className="mb-2 text-lg font-semibold">Central Location:</h2>
          <p>{centralAddress}</p>
        </div>
      )}
    </div>
  );
};

export default Map;
