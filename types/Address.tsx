import { Marker } from "@/types/MapTypes";

export default interface Address {
  lat: number;
  lng: number;
  name: string;
  marker?: Marker;
}
