// File: src/components/Map/KeyLegend.tsx
import { Marker } from "@/types/map";
import cn from "@/utils/cn";
import Image from "next/image";
import { JSX, useEffect, useState } from "react";

interface KeyLegendProps {
  geoCenterMarkerRef: React.RefObject<Marker | null>;
}

/**
 * KeyLegend component: displays pin icons (colors) for “Addresses”,
 * “Potential Centrals”, “Most Central”, and “Geographical Center”. If the
 * Geo‐Center marker has been placed, it shows its lat/lng—but only on the client.
 * @param params - Props object
 * @param params.geoCenterMarkerRef - Ref to the geo‐center marker
 * @returns The legend JSX element
 */
export default function KeyLegend({
  geoCenterMarkerRef,
}: KeyLegendProps): JSX.Element {
  const [hasMounted, setHasMounted] = useState(false);

  // After the first client render, mark as mounted
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const IMAGE_SIZE = 25;
  const pinUrls = {
    addresses: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    potentials: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    mostCentral: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    geoCenter: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  };

  return (
    <div
      className={cn(
        "mx-auto my-6 flex max-w-2xl flex-wrap justify-between gap-4 rounded-lg bg-white p-4 shadow-md"
      )}>
      {/* Addresses Marker */}
      <div className={cn("flex items-center space-x-2")}>
        <Image
          src={pinUrls.addresses}
          alt="Red pin: Addresses"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
        <span>Addresses</span>
      </div>

      {/* Potential Centrals */}
      <div className={cn("flex items-center space-x-2")}>
        <Image
          src={pinUrls.potentials}
          alt="Blue pin: Potential Centrals"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
        <span>Potential Centrals</span>
      </div>

      {/* Most Central */}
      <div className={cn("flex items-center space-x-2")}>
        <Image
          src={pinUrls.mostCentral}
          alt="Green pin: Most Central"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
        <span>Most Central</span>
      </div>

      {/* Geo Center with coordinates—but only after mount */}
      <div className={cn("flex items-center space-x-2")}>
        <Image
          src={pinUrls.geoCenter}
          alt="Yellow pin: Geo Center"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
        <span>
          Geographical Center
          {hasMounted &&
            geoCenterMarkerRef.current &&
            `: ${geoCenterMarkerRef.current.position?.lat}, ${geoCenterMarkerRef.current.position?.lng}`}
        </span>
      </div>
    </div>
  );
}
