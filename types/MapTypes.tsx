export type Marker = google.maps.marker.AdvancedMarkerElement;

export type PinElement = google.maps.marker.PinElement;

export type Map = google.maps.Map;

export type LatLng = google.maps.LatLng;

export function Marker(
  options: google.maps.marker.AdvancedMarkerElementOptions
): Marker {
  return new google.maps.marker.AdvancedMarkerElement(options);
}

export function PinElement(
  options: google.maps.marker.PinElementOptions
): PinElement {
  return new google.maps.marker.PinElement(options);
}

export function Map(html: HTMLElement, options: google.maps.MapOptions): Map {
  return new google.maps.Map(html, options);
}

export function LatLng(lat: number, lng: number): LatLng {
  return new google.maps.LatLng(lat, lng);
}

export function LatLngBounds(
  swOrLatLngBounds?:
    | LatLng
    | null
    | google.maps.LatLngLiteral
    | google.maps.LatLngBounds
    | google.maps.LatLngBoundsLiteral,
  ne?: LatLng | null | google.maps.LatLngLiteral
): google.maps.LatLngBounds {
  if (!swOrLatLngBounds && !ne) {
    return new google.maps.LatLngBounds();
  }

  if (swOrLatLngBounds instanceof google.maps.LatLngBounds) {
    return swOrLatLngBounds;
  }

  return new google.maps.LatLngBounds(swOrLatLngBounds, ne);
}
