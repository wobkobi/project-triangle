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
   * re‐add them (if any), and compute the “most central” location. If no potentials, skip.
   */
  useEffect(() => {
    if (!map) return;

    // If no potential centrals, clear markers and reset
    if (potentialCentrals.length === 0) {
      clearAllMarkers(markersRef.current);
      markersRef.current = [];
      setMostCentralAddress(null);
      return;
    }

    /**
     *
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
      <div className="mx-auto my-6 max-w-2xl">
        <div className="flex flex-col rounded-lg bg-white p-4 shadow-md sm:flex-row sm:items-center sm:space-x-4">
          <input
            ref={inputRef}
            type="text"
            placeholder={isCentral ? "Add Potential Central…" : "Add Address…"}
            className="flex-1 rounded-md border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="mt-3 flex space-x-3 sm:mt-0">
            <button
              onClick={() => setIsCentral((prev) => !prev)}
              className="rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
              {isCentral ? "Switch to Address" : "Switch to Potential"}
            </button>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useRoads}
                onChange={() => setUseRoads((prev) => !prev)}
                className="h-5 w-5"
              />
              <span className="select-none">Use Roads</span>
            </label>
          </div>
        </div>
      </div>

      {/* The map container */}
      <div className="flex justify-center">
        <div
          ref={mapRef}
          id="map"
          className={cn(
            "h-[50vh] min-h-[300px] w-full max-w-2xl",
            "lg:h-[65vh] lg:min-h-[450px]",
            "xl:h-[70vh] xl:min-h-[500px]",
            "overflow-hidden rounded-lg shadow-md"
          )}
        />
      </div>

      {/* Legend showing pins + geographical center coordinates */}
      <KeyLegend geoCenterMarkerRef={geoCenterMarkerRef} />

      {/* Two‐column card layout: “Addresses” and “Potential Centrals” */}
      <div className="mx-auto my-6 grid max-w-4xl gap-6 sm:grid-cols-2">
        {/* Addresses Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">Addresses</h2>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {addresses.map((address) => (
              <label
                key={`${address.lat}-${address.lng}`}
                className="flex cursor-pointer select-none items-center space-x-2">
                <input
                  type="checkbox"
                  checked={false /* controlled by AddressList component */}
                  onChange={() => {}}
                  className="h-5 w-5"
                  aria-label={`Select address: ${address.name}`}
                />
                <span>{address.name}</span>
              </label>
            ))}
          </div>
          {/* Controls moved to AddressList component */}
        </div>

        {/* Potential Centrals Card */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-semibold">
            Potential Central Locations
          </h2>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {potentialCentrals.map((address) => {
              const isMostCentral =
                mostCentralAddress &&
                address.lat === mostCentralAddress.lat &&
                address.lng === mostCentralAddress.lng;

              return (
                <label
                  key={`${address.lat}-${address.lng}`}
                  className={`flex cursor-pointer select-none items-center space-x-2 ${
                    isMostCentral ? "rounded-md bg-green-50 p-1" : ""
                  }`}>
                  <input
                    type="checkbox"
                    checked={false /* controlled by AddressList component */}
                    onChange={() => {}}
                    className="h-5 w-5"
                    aria-label={`Select potential central: ${address.name}`}
                  />
                  <span>{address.name}</span>
                </label>
              );
            })}
          </div>
          {/* Controls moved to AddressList component */}
        </div>
      </div>

      {/* Actual address/potential lists + controls are rendered by AddressList */}
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
