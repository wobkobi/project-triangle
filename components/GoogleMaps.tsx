"use client";
import { Address } from "@/types/Address";
import { AddMarker } from "@/utils/Markers/AddMarker";
import { MoveMarker } from "@/utils/Markers/MoveMarker";
import { RemoveMarker } from "@/utils/Markers/RemoveMarker";
import { CalculateMostCentralLocation } from "@/utils/Math/CalulateMostCentralLocation";
import cn from "@/utils/cn";
import { Loader } from "@googlemaps/js-api-loader";
import Image from "next/image";
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
  const [mostCentralAddress, setMostCentralAddress] = useState<Address | null>(
    null
  );
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

      const newMostCentral = CalculateMostCentralLocation(
        addresses,
        potentialCentrals
      );
      setMostCentralAddress(newMostCentral);
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

  const IMAGE_SIZE = 25;
  return (
    <div
      className={cn("flex min-h-screen flex-col items-center justify-center")}>
      {/* Header section with input and button */}
      <div className={cn(" w-full max-w-7xl rounded-lg bg-gray-100 p-4")}>
        <div className={cn("flex items-center space-x-4")}>
          {/* Input */}
          <input
            type="text"
            ref={inputRef}
            placeholder={
              isCentral ? "Enter Central Locations" : "Enter Addresses"
            }
            className={cn("flex-grow rounded border p-2")}
          />
          {/* Button */}
          <button
            onClick={() => setIsCentral(!isCentral)}
            className={cn("ml-2 rounded bg-blue-500 px-4 py-2 text-white")}>
            {isCentral ? "Switch to Addresses" : "Switch to Central Locations"}
          </button>
        </div>
        <div className={cn("mt-2 flex justify-between")}>
          {/* Addresses Marker */}
          <div className={cn("flex items-center space-x-2")}>
            <Image
              src="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
              alt="Red Marker"
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
            />
            <span>Addresses</span>
          </div>

          {/* Potential Central Locations Marker */}
          <div className={cn("flex items-center space-x-2")}>
            <Image
              src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              alt="Blue Marker"
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
            />
            <span>Potential Central Locations</span>
          </div>

          {/* Most Central Address Marker */}
          <div className={cn("flex items-center space-x-2")}>
            <Image
              src="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
              alt="Green Marker"
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
            />
            <span>Most Central Address</span>
          </div>
          {/* Geographical Center with coordinates */}
          <div className={cn("mt-2 flex items-center space-x-2")}>
            <Image
              src="http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
              alt="Yellow Marker"
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
            />
            <span>
              Geographical Center
              {geoCenterMarkerRef.current &&
                `: ${geoCenterMarkerRef.current.getPosition()?.lat().toFixed(7)},  ${geoCenterMarkerRef.current.getPosition()?.lng().toFixed(7)}`}
            </span>
          </div>
        </div>
      </div>
      <div
        ref={mapRef}
        className={cn("h-[600px] w-full max-w-7xl  bg-gray-100")}></div>
      {/* Addresses and Potential Central Locations sections */}
      <div className={cn("flex w-full max-w-7xl space-x-8 bg-gray-100 p-8")}>
        {/* Addresses list */}
        <div className={cn("w-full lg:w-1/2")}>
          <h2 className={cn("text-xl font-bold")}>Addresses</h2>
          {addresses.map((address, index) => (
            <div key={index} className={cn("mb-4")}>
              <div>{address.name}</div>
              <div className={cn("flex space-x-2")}>
                <a
                  href="#"
                  onClick={() => handleSwitch(index, false)}
                  className={cn(
                    "text-sm text-green-600 transition-colors duration-200 hover:text-green-800"
                  )}>
                  Move to Potential Centrals
                </a>
                <a
                  href="#"
                  onClick={() => handleRemove(index, false)}
                  className={cn(
                    "text-sm text-red-600 transition-colors duration-200 hover:text-red-800"
                  )}>
                  Remove
                </a>
              </div>
            </div>
          ))}
        </div>
        {/* Potential Central Locations list */}
        <div className={cn("w-full lg:w-1/2 ")}>
          <h2 className={cn("text-xl font-bold")}>
            Potential Central Locations
          </h2>
          {potentialCentrals.map((address, index) => (
            <div
              key={index}
              className={`mb-4 ${mostCentralAddress && address.lat === mostCentralAddress.lat && address.lng === mostCentralAddress.lng ? "bg-green-200" : ""}`}>
              <div>{address.name}</div>
              <div className={cn("flex space-x-2")}>
                <a
                  href="#"
                  onClick={() => handleSwitch(index, true)}
                  className={cn(
                    "text-sm text-green-600 transition-colors duration-200 hover:text-green-800"
                  )}>
                  Move to Addresses
                </a>
                <a
                  href="#"
                  onClick={() => handleRemove(index, true)}
                  className={cn(
                    "text-sm text-red-600 transition-colors duration-200 hover:text-red-800"
                  )}>
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
