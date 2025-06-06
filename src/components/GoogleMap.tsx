"use client";

import AddressList from "@/components/Map/AddressList";
import KeyLegend from "@/components/Map/KeyLegend";
import useGoogleMapsAutocomplete from "@/hooks/useGoogleMapsAutocomplete";
import Address from "@/types/address";
import { Map as GoogleMapType, Marker as GoogleMarkerType } from "@/types/map";
import cn from "@/utils/cn";
import initMap from "@/utils/googleMaps/initMap";
import addMarker from "@/utils/googleMaps/markers/addMarker";
import clearAllMarkers from "@/utils/googleMaps/markers/clearAllMarkers";
import removeAddressItems from "@/utils/googleMaps/markers/removeAddressItems";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * GoogleMap component: renders the Google Maps canvas, input controls, and address lists.
 * @returns The complete map‐and‐controls JSX element
 */
export function GoogleMap(): JSX.Element {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [map, setMap] = useState<GoogleMapType>();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [potentialCentrals, setPotentialCentrals] = useState<Address[]>([]);
  const [mostCentralAddress, setMostCentralAddress] = useState<Address | null>(
    null
  );

  const [isCentral, setIsCentral] = useState<boolean>(false);
  const [useRoads, setUseRoads] = useState<boolean>(false);

  // Keep track of all markers and the “geographical center” marker
  const markersRef = useRef<GoogleMarkerType[]>([]);
  const geoCenterMarkerRef = useRef<GoogleMarkerType | null>(null);

  /**
   * Initialize the Google Map once after component mounts.
   */
  useEffect(() => {
    if (!map && mapRef.current) {
      initMap(
        process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        mapRef,
        setMap
      );
    }
  }, [map]);

  /**
   * Set up Places Autocomplete whenever the map is ready or “isCentral” toggles.
   */
  useEffect(() => {
    if (!map || !inputRef.current) return;

    useGoogleMapsAutocomplete(
      map,
      inputRef,
      isCentral,
      addresses,
      potentialCentrals,
      setAddresses,
      setPotentialCentrals
    );
  }, [map, isCentral, addresses, potentialCentrals]);

  /**
   * Whenever addresses, potentialCentrals, or useRoads change, clear existing markers,
   * re‐add them (if any), and compute the “most central” location. If both arrays
   * are empty, skip addMarker to avoid a runtime error.
   */
  useEffect(() => {
    if (!map) return;

    // Guard: if both lists are empty, clear markers and reset central
    if (addresses.length === 0 && potentialCentrals.length === 0) {
      clearAllMarkers(markersRef.current);
      markersRef.current = [];
      setMostCentralAddress(null);
      return;
    }

    /**
     * Clears all existing markers, re-adds markers for the current addresses and potential centrals,
     * and updates the most central address state accordingly.
     * @returns A promise that resolves once the markers have been updated and
     *  the most central address has been computed and set.
     */
    async function updateMarkers(): Promise<void> {
      clearAllMarkers(markersRef.current);
      markersRef.current = [];

      const central = await addMarker(
        map!,
        addresses,
        potentialCentrals,
        markersRef,
        geoCenterMarkerRef,
        useRoads
      );
      setMostCentralAddress(central);
    }

    updateMarkers();
  }, [map, addresses, potentialCentrals, useRoads]);

  /**
   * Move selected addresses between “addresses” and “potentialCentrals”.
   * @param selectedIndexes - Array of indexes to move
   * @param isFromCentral - True if moving from potentialCentrals to addresses; false otherwise
   */
  const handleSwitch = useCallback(
    (selectedIndexes: number[], isFromCentral: boolean): void => {
      if (!map) return;

      if (isFromCentral) {
        const toMove = selectedIndexes.map((i) => potentialCentrals[i]);
        setPotentialCentrals((prev) =>
          prev.filter((_, idx) => !selectedIndexes.includes(idx))
        );
        setAddresses((prev) => [...prev, ...toMove]);
      } else {
        const toMove = selectedIndexes.map((i) => addresses[i]);
        setAddresses((prev) =>
          prev.filter((_, idx) => !selectedIndexes.includes(idx))
        );
        setPotentialCentrals((prev) => [...prev, ...toMove]);
      }
    },
    [map, addresses, potentialCentrals]
  );

  /**
   * Remove selected addresses from either the “addresses” or the “potentialCentrals” list.
   * @param selectedIndexes - Array of indexes to remove
   * @param isFromCentral - True if removing from potentialCentrals; false if from addresses
   */
  const handleRemove = useCallback(
    async (
      selectedIndexes: number[],
      isFromCentral: boolean
    ): Promise<void> => {
      if (!map) return;

      await removeAddressItems(
        selectedIndexes,
        isFromCentral,
        addresses,
        potentialCentrals,
        setAddresses,
        setPotentialCentrals,
        map!,
        markersRef,
        geoCenterMarkerRef,
        useRoads
      );
    },
    [map, addresses, potentialCentrals, useRoads]
  );

  return (
    <>
      {/* Input + Mode Toggle + “Use Roads” Checkbox */}
      <div className={cn("mb-4 flex items-center space-x-4")}>
        <input
          ref={inputRef}
          type="text"
          placeholder={isCentral ? "Add Potential Central…" : "Add Address…"}
          className={cn(
            "w-full max-w-xs rounded border px-3 py-2",
            "focus:outline-none focus:ring-2 focus:ring-blue-400"
          )}
        />
        <button
          onClick={() => setIsCentral((prev) => !prev)}
          className={cn(
            "rounded bg-blue-500 px-4 py-2 text-white",
            "transition-colors hover:bg-blue-600 disabled:bg-gray-400"
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

      {/* The map container */}
      <div
        ref={mapRef}
        id="map"
        className={cn(
          "mx-auto my-4 h-[50vh] min-h-[300px] w-full max-w-2xl",
          "lg:h-[65vh] lg:min-h-[450px]",
          "xl:h-[70vh] xl:min-h-[500px]",
          "overflow-hidden rounded-lg shadow-md"
        )}
      />

      {/* Legend showing pins + geographical center coordinates */}
      <KeyLegend geoCenterMarkerRef={geoCenterMarkerRef} />

      {/* Lists of addresses and potentials, with move/remove controls */}
      <AddressList
        addresses={addresses}
        potentialCentrals={potentialCentrals}
        handleSwitch={handleSwitch}
        handleRemove={handleRemove}
        mostCentralAddress={mostCentralAddress}
      />
    </>
  );
}
