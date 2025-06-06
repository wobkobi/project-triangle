// File: src/components/GoogleMap.tsx
"use client";

import AddressList from "@/components/Map/AddressList";
import KeyLegend from "@/components/Map/KeyLegend";
import useGoogleMapsAutocomplete from "@/hooks/useGoogleMapsAutocomplete";
import Address from "@/types/address";
import type { GoogleMapType } from "@/types/map";
import cn from "@/utils/cn";
import CalculateMostCentralLocation from "@/utils/googleMaps/calculations/calculateMostCentral";
import initMap from "@/utils/googleMaps/initMap";
import addMarker from "@/utils/googleMaps/markers/addMarker";
import clearAllMarkers from "@/utils/googleMaps/markers/clearAllMarkers";
import moveMarkers from "@/utils/googleMaps/markers/moveMarkers";
import removeAddressItems from "@/utils/googleMaps/markers/removeAddressItems";
import React, { useCallback, useEffect, useRef, useState } from "react";

/**
 * GoogleMap component:
 * - Initializes a Google Map centered on New Zealand (with a valid mapId).
 * - Attaches an Autocomplete input that adds places into either `addresses` or `potentialCentrals`.
 * - Renders AdvancedMarkerElements (red/blue/green/yellow) based on those lists.
 * @returns A JSX element containing the input, the map, legend, and address list.
 */
export function GoogleMap(): React.JSX.Element {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [map, setMap] = useState<GoogleMapType>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [potentialCentrals, setPotentialCentrals] = useState<Address[]>([]);
  const [mostCentralAddress, setMostCentralAddress] = useState<Address | null>(
    null
  );

  const [isCentral, setIsCentral] = useState<boolean>(false);
  const [useRoads, setUseRoads] = useState<boolean>(false);

  // Refs for AdvancedMarkerElement instances
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const geoCenterMarkerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // 1) Initialize the map once
  useEffect(() => {
    if (!map && mapRef.current) {
      initMap(
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        mapRef,
        setMap
      );
    }
  }, [map]);

  // 2) Call the Autocomplete hook at the top level
  useGoogleMapsAutocomplete({
    map: map!,
    inputRef,
    isCentral,
    addresses,
    potentialCentrals,
    setAddresses,
    setPotentialCentrals,
  });

  // 3) Whenever addresses or potentialCentrals change, remove old geo‐center, clear & re-add markers,
  //    then compute and set mostCentralAddress using CalculateMostCentralLocation.
  useEffect(() => {
    if (!map) return;

    // 3a) Remove any existing geo‐center marker from the map
    if (geoCenterMarkerRef.current) {
      geoCenterMarkerRef.current.map = null;
      geoCenterMarkerRef.current = null;
    }

    // 3b) Remove all other AdvancedMarkerElements
    clearAllMarkers(markersRef.current);
    markersRef.current = [];

    (async () => {
      await addMarker(
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
    })();
  }, [map, addresses, potentialCentrals, useRoads]);

  /**
   * Moves selected items from one list to the other.
   * @param selected - Array of selected item indexes.
   * @param fromCentral - If true, move from `potentialCentrals` → `addresses`; otherwise, vice versa.
   */
  const handleSwitch = useCallback(
    (selected: number[], fromCentral: boolean) => {
      if (!map) return;
      moveMarkers(
        selected,
        fromCentral,
        addresses,
        potentialCentrals,
        setAddresses,
        setPotentialCentrals,
        map,
        markersRef,
        geoCenterMarkerRef
      );
    },
    [map, addresses, potentialCentrals]
  );

  /**
   * Removes the selected items from either `addresses` or `potentialCentrals`,
   * then updates markers accordingly.
   * @param selected - Array of selected item indexes.
   * @param fromCentral - If true, remove from `potentialCentrals`; otherwise, from `addresses`.
   */
  const handleRemove = useCallback(
    (selected: number[], fromCentral: boolean) => {
      if (!map) return;
      removeAddressItems(
        selected,
        fromCentral,
        addresses,
        potentialCentrals,
        setAddresses,
        setPotentialCentrals,
        map,
        markersRef,
        geoCenterMarkerRef
      );
    },
    [map, addresses, potentialCentrals]
  );

  return (
    <div className={cn("flex h-full flex-col lg:flex-row")}>
      {/* Left column: map + input + legend */}
      <div className={cn("flex w-full flex-col lg:w-3/5")}>
        {/* Input + toggle + “Use Roads” */}
        <div className={cn("mx-auto my-6 w-full max-w-2xl")}>
          <div
            className={cn(
              "flex flex-col rounded-lg bg-white p-4 shadow-md sm:flex-row sm:items-center sm:space-x-4"
            )}>
            <input
              ref={inputRef}
              type="text"
              placeholder={
                isCentral ? "Add Potential Central…" : "Add Address…"
              }
              className={cn(
                "flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              )}
            />
            <div className={cn("mt-3 flex space-x-3 sm:mt-0")}>
              <button
                onClick={() => setIsCentral((prev) => !prev)}
                className={cn(
                  "rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                )}>
                {isCentral ? "Switch to Address" : "Switch to Potential"}
              </button>
              <label className={cn("flex items-center space-x-2")}>
                <input
                  type="checkbox"
                  checked={useRoads}
                  onChange={() => setUseRoads((prev) => !prev)}
                  className={cn("h-5 w-5")}
                />
                <span className={cn("select-none")}>Use Roads</span>
              </label>
            </div>
          </div>
        </div>

        {/* Map container */}
        <div className={cn("flex flex-grow justify-center px-4")}>
          <div
            ref={mapRef}
            id="map"
            className={cn(
              "aspect-video h-[63vh] w-full max-w-full overflow-hidden rounded-lg shadow-md lg:h-full"
            )}
          />
        </div>

        {/* Legend */}
        <div className={cn("px-4 py-2")}>
          <KeyLegend geoCenterMarkerRef={geoCenterMarkerRef} />
        </div>
      </div>

      {/* Right column: Address lists */}
      <div className={cn("w-full overflow-auto bg-gray-50 p-4 lg:w-2/5")}>
        <AddressList
          addresses={addresses}
          potentialCentrals={potentialCentrals}
          handleSwitch={handleSwitch}
          handleRemove={handleRemove}
          mostCentralAddress={mostCentralAddress}
        />
      </div>
    </div>
  );
}
