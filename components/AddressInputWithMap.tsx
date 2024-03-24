import { Loader } from "@googlemaps/js-api-loader";
import React, { useEffect, useRef, useState } from "react";

interface MapProps {
  apiKey: string;
  addresses: Array<{ lat: number; lng: number }>; // Assuming this is the format of your addresses
}

declare global {
  interface Window {
    google: any;
  }
}

const AddressInputWithMap: React.FC<MapProps> = ({ apiKey, addresses }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [addressList, setAddressList] = useState<Array<string>>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        // Initialize the map
        setMap(
          new window.google.maps.Map(mapRef.current, {
            center: { lat: 0, lng: 0 },
            zoom: 8,
          })
        );
      }
    });
  }, [apiKey]);

  useEffect(() => {
    if (!map) return;

    const bounds = new window.google.maps.LatLngBounds();
    addresses.forEach(({ lat, lng }) => {
      const marker = new window.google.maps.Marker({
        position: { lat, lng },
        map: map,
      });

      bounds.extend(marker.getPosition());
    });

    map.fitBounds(bounds);

    // Adjust zoom level if necessary
    adjustZoomLevel(map, addresses, bounds);

    // Add autocomplete functionality to the input field
    if (inputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          return;
        }

        const location = place.geometry.location;
        const newMarker = new window.google.maps.Marker({
          position: location,
          map: map,
        });

        bounds.extend(newMarker.getPosition());
        map.fitBounds(bounds);

        // Adjust zoom level if necessary
        adjustZoomLevel(map, addresses, bounds);

        // Add the address to the list
        setAddressList([...addressList, inputRef.current.value || ""]);

        // Clear the input field
        inputRef.current.value = "";
      });
    }
  }, [map, addresses]); // Re-run this effect if the map instance or addresses change

  // Function to add a new address to the list
  const handleAddAddress = () => {
    if (inputRef.current) {
      setAddressList([...addressList, inputRef.current.value || ""]);
      inputRef.current.value = ""; // Clear the input field
    }
  };

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="Enter an address" />
      <div ref={mapRef} style={{ height: "400px", width: "100%" }} />
      <div>
        <h2>Address List:</h2>
        <ul>
          {addressList.map((address, index) => (
            <li key={index}>{address}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Function to adjust zoom level if necessary
const adjustZoomLevel = (
  map: google.maps.Map,
  addresses: Array<{ lat: number; lng: number }>,
  bounds: google.maps.LatLngBounds
) => {
  if (addresses.length === 1) {
    const listener = window.google.maps.event.addListener(
      map,
      "idle",
      function () {
        if (map.getZoom() > 15) map.setZoom(15);
        window.google.maps.event.removeListener(listener);
      }
    );
  }
};

export default AddressInputWithMap;
