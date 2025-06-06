import { Marker } from "@/types/map";
import cn from "@/utils/cn";
import Image from "next/image";

interface KeyLegendProps {
  geoCenterMarkerRef: React.MutableRefObject<Marker | null>;
}

/**
 * KeyLegend component: displays pin icons (colors) and labels them for “Addresses”,
 * “Potential Central Locations”, “Most Central Address”, and “Geographical Center”.
 * Also shows current lat/lng of the geo-center marker if available.
 * @param root0 - Props object
 * @param root0.geoCenterMarkerRef - Ref to the geo-center marker (to extract its coordinates)
 * @returns The legend JSX element
 */
export default function KeyLegend({
  geoCenterMarkerRef,
}: KeyLegendProps): JSX.Element {
  const IMAGE_SIZE = 25;
  const pinUrls = {
    addresses: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    potentials: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    mostCentral: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    geoCenter: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  };

  return (
    <div className={cn("mt-2 flex justify-between space-x-4")}>
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

      {/* Potential Central Locations Marker */}
      <div className={cn("flex items-center space-x-2")}>
        <Image
          src={pinUrls.potentials}
          alt="Blue pin: Potential Central Locations"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
        <span>Potential Central Locations</span>
      </div>

      {/* Most Central Address Marker */}
      <div className={cn("flex items-center space-x-2")}>
        <Image
          src={pinUrls.mostCentral}
          alt="Green pin: Most Central Address"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
        <span>Most Central Address</span>
      </div>

      {/* Geographical Center with coordinates */}
      <div className={cn("flex items-center space-x-2")}>
        <Image
          src={pinUrls.geoCenter}
          alt="Yellow pin: Geographical Center"
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
        />
        <span>
          Geographical Center
          {geoCenterMarkerRef.current &&
            `: ${geoCenterMarkerRef.current.position?.lat}, ${geoCenterMarkerRef.current.position?.lng}`}
        </span>
      </div>
    </div>
  );
}
