import { Marker } from "@/types/MapTypes";
import cn from "@/utils/cn";
import Image from "next/image";
interface KeyProps {
  geoCenterMarkerRef: React.MutableRefObject<Marker | null>;
}

export default function Key({ geoCenterMarkerRef }: KeyProps) {
  const IMAGE_SIZE = 25;

  return (
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
            `: ${geoCenterMarkerRef.current.position?.lat},  ${geoCenterMarkerRef.current.position?.lng}`}
        </span>
      </div>
    </div>
  );
}
