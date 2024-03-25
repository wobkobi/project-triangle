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
  const [centralMarker, setCentralMarker] = useState<google.maps.Marker | null>(
    null
  );
  const [centralAddress, setCentralAddress] = useState<string>("");

  useEffect(() => {
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
    if (!map) return;
    const bounds = new window.google.maps.LatLngBounds();
    addresses.forEach(({ lat, lng }) => {
      const position = new window.google.maps.LatLng(lat, lng);
      bounds.extend(position);
      new window.google.maps.Marker({
        position,
        map,
      });
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
      setCentralMarker(null);
      setCentralAddress("");
    }

    map.fitBounds(bounds);
  }, [map, addresses]);

  const removeAddress = (indexToRemove: number) => {
    console.log(`Removing address at index: ${indexToRemove}`); // Debugging log

    // Access the marker of the address to be removed
    const markerToRemove = addresses[indexToRemove].marker;
    console.log(`Marker to remove:`, markerToRemove); // Debugging log

    // Remove the marker from the map
    markerToRemove.setMap(null);

    // Filter out the address and its marker
    const updatedAddresses = addresses.filter(
      (_, index) => index !== indexToRemove
    );

    // Update the addresses state
    setAddresses(updatedAddresses);

    console.log(`Updated addresses:`, updatedAddresses); // Debugging log
  };

  return (
    <div>
      <div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter an address"
          className="w-full rounded border border-gray-300 p-4 text-xl shadow focus:border-blue-500 focus:outline-none" // Tailwind classes for styling
        />
      </div>
      <div ref={mapRef} style={{ height: "700px", width: "100%" }} />
      <div>
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
    </div>
  );
};

export default Map;
