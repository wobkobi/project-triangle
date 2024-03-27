"use client";
import { Address } from "@/types/Address";
import { AddMarker } from "@/utils/Markers/AddMarker";
import { MoveMarker } from "@/utils/Markers/MoveMarker";
import { RemoveMarker } from "@/utils/Markers/RemoveMarker";
import { Loader } from "@googlemaps/js-api-loader";
import { useCallback, useMemo, useRef, useState } from "react";

export default function GoogleMaps() {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCentral, setIsCentral] = useState(false); // False for addresses, true for potentialCentrals
  const [map, setMap] = useState<google.maps.Map>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [potentialCentrals, setPotentialCentrals] = useState<Address[]>([]);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const geoCenterMarkerRef = useRef<google.maps.Marker | null>(null); // New ref for the geographical center marker
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const initMap = () => {
    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "geometry"],
    });

    loader.load().then(() => {
      if (mapRef.current) {
        // Set the initial map properties
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.006 },
          zoom: 10,
        });

        setMap(map);
      }
    });
  };

  useMemo(initMap, [apiKey]);
  // Add the autocomplete functionality
  useMemo(() => {
    if (!map || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current);
    autocomplete.bindTo("bounds", map);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      const newAddress = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        name: place.formatted_address || "",
      };

      // duplicate address check
      const addressExists = (addressArray: Address[], address: Address) =>
        addressArray.some(
          (a) => a.lat === address.lat && a.lng === address.lng
        );

      if (isCentral) {
        if (!addressExists(potentialCentrals, newAddress))
          setPotentialCentrals((prev) => [...prev, newAddress]);
      } else {
        if (!addressExists(addresses, newAddress))
          setAddresses((prev) => [...prev, newAddress]);
      }
      if (inputRef.current) inputRef.current.value = "";
    });
  }, [map, isCentral, addresses, potentialCentrals]);

  useMemo(() => {
    if (map) {
      AddMarker(
        map,
        addresses,
        potentialCentrals,
        markersRef,
        geoCenterMarkerRef
      );
    }
  }, [map, addresses, potentialCentrals]);

  const handleSwitch = (index: number, isFromCentral: boolean) => {
    if (!map) return;
    MoveMarker(
      index,
      isFromCentral,
      addresses,
      potentialCentrals,
      setAddresses,
      setPotentialCentrals,
      map,
      markersRef,
      geoCenterMarkerRef
    );
  };

  const handleRemove = useCallback(
    (index: number, isFromCentral: boolean) => {
      if (!map) return;
      RemoveMarker(
        index,
        isFromCentral,
        addresses,
        potentialCentrals,
        setAddresses,
        setPotentialCentrals,
        map,
        markersRef,
        geoCenterMarkerRef
      );
    },
    [
      addresses,
      potentialCentrals,
      markersRef,
      geoCenterMarkerRef,
      setAddresses,
      setPotentialCentrals,
      map,
    ]
  );

  return (
    <div className="container mx-auto my-8">
      <input
        ref={inputRef}
        placeholder={isCentral ? "Enter Central Locations" : "Enter Addresses"}
        className="input focus:shadow-outline mb-4 w-full rounded border px-4 py-2 leading-tight text-gray-700 focus:outline-none"
      />
      <div ref={mapRef} className="mb-4 h-96 w-full"></div>{" "}
      <button
        onClick={() => setIsCentral(!isCentral)}
        className="btn focus:shadow-outline mb-4 rounded bg-blue-500 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none">
        {isCentral ? "Switch to Addresses" : "Switch to Central Locations"}
      </button>
      <div className="mt-8 flex justify-between space-x-4">
        <div className="w-1/2">
          <h2 className="mb-4 text-xl font-bold">Addresses</h2>
          {addresses.map((address, index) => (
            <div key={index} className="mb-4">
              <div>{address.name}</div>
              <div className="flex space-x-2">
                <a
                  href="#"
                  onClick={() => handleSwitch(index, false)}
                  className="text-sm text-green-600 transition-colors duration-200 hover:text-green-800">
                  Move to Potential Centrals
                </a>
                <a
                  href="#"
                  onClick={() => handleRemove(index, false)}
                  className="text-sm text-red-600 transition-colors duration-200 hover:text-red-800">
                  Remove
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="w-1/2">
          <h2 className="mb-4 text-xl font-bold">
            Potential Central Locations
          </h2>
          {potentialCentrals.map((address, index) => (
            <div key={index} className="mb-4">
              <div>{address.name}</div>
              <div className="flex space-x-2">
                <a
                  href="#"
                  onClick={() => handleSwitch(index, true)}
                  className="text-sm text-green-600 transition-colors duration-200 hover:text-green-800">
                  Move to Addresses
                </a>
                <a
                  href="#"
                  onClick={() => handleRemove(index, true)}
                  className="text-sm text-red-600 transition-colors duration-200 hover:text-red-800">
                  Remove
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
