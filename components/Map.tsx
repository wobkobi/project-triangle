import { Loader } from "@googlemaps/js-api-loader";
import React, { useEffect, useRef, useState } from "react";

interface MapProps {
  apiKey: string;
}

interface Address {
  lat: number;
  lng: number;
  name: string;
}

const Map: React.FC<MapProps> = ({ apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
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
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 0, lng: 0 },
          zoom: 8,
        });
        setMap(newMap);

        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef.current
        );
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.geometry || !place.geometry.location) return;

          const { lat, lng } = place.geometry.location;
          const name = place.formatted_address || "";
          setAddresses((prev) => [...prev, { lat: lat(), lng: lng(), name }]);
          inputRef.current.value = "";
        });
      }
    });
  }, [apiKey]);

  useEffect(() => {
    updateMarkersAndCentralPoint();
  }, [map, addresses]);

  const updateMarkersAndCentralPoint = () => {
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
  };

  const removeAddress = (indexToRemove: number) => {
    // First, ensure the marker exists at the specified index
    if (markers[indexToRemove]) {
      // If the marker exists, remove it from the map
      markers[indexToRemove].setMap(null);
    }

    // Create updated arrays for markers and addresses, excluding the one to remove
    const updatedMarkers = markers.filter(
      (_, index) => index !== indexToRemove
    );
    const updatedAddresses = addresses.filter(
      (_, index) => index !== indexToRemove
    );

    // Update state with the filtered arrays
    setMarkers(updatedMarkers);
    setAddresses(updatedAddresses);
  };

  return (
    <div>
      <div>
        <input ref={inputRef} type="text" placeholder="Enter an address" />
      </div>
      <div ref={mapRef} style={{ height: "700px", width: "100%" }} />
      <div>
        <h2>Address List:</h2>
        <ul>
          {addresses.map((address, index) => (
            <li key={index}>
              {address.name}
              <button
                onClick={() => removeAddress(index)}
                style={{ marginLeft: "10px" }}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        {centralAddress && <p>{centralAddress}</p>}
      </div>
    </div>
  );
};

export default Map;
