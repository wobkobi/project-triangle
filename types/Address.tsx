import { Marker } from "@/types/MapTypes";

export interface Address {
  lat: number;
  lng: number;
  name: string;
  marker?: Marker;
}
