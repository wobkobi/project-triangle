"use client";
import AddressLists from "@/components/HTML/AddressLists";
import Key from "@/components/HTML/Key";
import GoogleMapsAutocomplete from "@/hooks/GoogleMapsAutocomplete";
import Address from "@/types/Address";
import { Map, Marker } from "@/types/MapTypes";
import InitMap from "@/utils/InitMap";
import AddMarker from "@/utils/Markers/AddMarker";
import MoveMarkers from "@/utils/Markers/MoveMarkers";
import RemoveMarkers from "@/utils/Markers/RemoveMarkers";
import CalculateMostCentralLocation from "@/utils/Math/CalulateMostCentralLocation";
import cn from "@/utils/cn";
import { useCallback, useMemo, useRef, useState } from "react";

export function GoogleMaps() {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCentral, setIsCentral] = useState(false); // False for addresses, true for potentialCentrals
  const [map, setMap] = useState<Map>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [potentialCentrals, setPotentialCentrals] = useState<Address[]>([]);
  const markersRef = useRef<Marker[]>([]);
  const geoCenterMarkerRef = useRef<Marker | null>(null); // New ref for the geographical center marker
  const [mostCentralAddress, setMostCentralAddress] = useState<Address | null>(
    null
  );
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useMemo(() => {
    if (typeof window === "undefined") {
      return;
    }
    InitMap(apiKey, mapRef, setMap);
    return () => {};
  }, [apiKey]);

  // Add the autocomplete functionality
  useMemo(() => {
    GoogleMapsAutocomplete(
      map,
      inputRef,
      isCentral,
      addresses,
      potentialCentrals,
      setAddresses,
      setPotentialCentrals
    );
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

  const handleSwitch = (selectedIndexes: number[], isFromCentral: boolean) => {
    if (!map) return;
    // New function to handle batch move operations
    MoveMarkers(
      selectedIndexes,
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
    (selectedIndexes: number[], isFromCentral: boolean) => {
      if (!map) return;
      // New function to handle batch remove operations
      RemoveMarkers(
        selectedIndexes,
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
    <>
      {/* Header section with input and button */}
      <div className={cn(" w-full max-w-[70%] rounded-lg bg-gray-100 p-4")}>
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
        <Key geoCenterMarkerRef={geoCenterMarkerRef} />
      </div>
      <div
        ref={mapRef}
        className={cn(
          "h-[40vh] w-full max-w-[70%] bg-gray-100 sm:h-[50vh] sm:min-h-[300px] md:h-[60vh] md:min-h-[400px] lg:h-[70vh] lg:min-h-[500px] xl:h-[80vh] xl:min-h-[600px] 2xl:min-h-[700px]"
        )}
      />

      <AddressLists
        addresses={addresses}
        potentialCentrals={potentialCentrals}
        handleSwitch={handleSwitch}
        handleRemove={handleRemove}
        mostCentralAddress={mostCentralAddress}
      />
    </>
  );
}
