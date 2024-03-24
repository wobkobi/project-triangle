// components/GoogleMap.tsx
"use client";
import React, { useEffect, useRef } from "react";
import useGoogleMapsLoader from "../hooks/useGoogleMapsLoader";

interface MapProps {
  apiKey: string;
  center: { lat: number; lng: number };
  zoom: number;
}

const GoogleMap: React.FC<MapProps> = ({ apiKey, center, zoom }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const { isLoaded, loadError } = useGoogleMapsLoader(apiKey);

  useEffect(() => {
    if (isLoaded && mapRef.current) {
      // Initialize the map
      new google.maps.Map(mapRef.current, {
        center,
        zoom,
      });
    }
  }, [isLoaded, center, zoom]);

  if (loadError) {
    return <div>Error loading Google Maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return <div ref={mapRef} style={{ height: "400px", width: "100%" }} />;
};

export default GoogleMap;
