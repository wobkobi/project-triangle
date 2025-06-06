/**
 * Marker type alias: AdvancedMarkerElement from the Google Maps JS API.
 */
export type Marker = google.maps.marker.AdvancedMarkerElement;

/**
 * Pin type alias: PinElement from the Google Maps JS API.
 */
export type Pin = google.maps.marker.PinElement;

/**
 * Map type alias: google.maps.Map instance.
 */
export type Map = google.maps.Map;

/**
 * LatLng type alias: google.maps.LatLng object.
 */
export type LatLng = google.maps.LatLng;

/**
 * Creates a new AdvancedMarkerElement with the given options.
 * @param options - Options for the AdvancedMarkerElement
 * @returns A new Marker instance
 */
export function createMarker(
  options: google.maps.marker.AdvancedMarkerElementOptions
): Marker {
  return new google.maps.marker.AdvancedMarkerElement(options);
}

/**
 * Creates a new PinElement with the given options.
 * @param options - Options for the PinElement
 * @returns A new Pin instance
 */
export function createPin(options: google.maps.marker.PinElementOptions): Pin {
  return new google.maps.marker.PinElement(options);
}

/**
 * Creates a new google.maps.Map attached to the given HTML element.
 * @param html - The HTML container element for the map
 * @param options - The Google Maps MapOptions
 * @returns A new Map instance
 */
export function createMap(
  html: HTMLElement,
  options: google.maps.MapOptions
): Map {
  return new google.maps.Map(html, options);
}

/**
 * Creates a new google.maps.LatLng object from latitude and longitude.
 * @param lat - Latitude in decimal degrees
 * @param lng - Longitude in decimal degrees
 * @returns A new LatLng instance
 */
export function createLatLng(lat: number, lng: number): LatLng {
  return new google.maps.LatLng(lat, lng);
}

/**
 * Creates or returns a google.maps.LatLngBounds object.
 * If passed an existing LatLngBounds, returns it; otherwise builds a new one from two corners.
 * @param swOrBounds - Either an existing LatLngBounds or a LatLng/LatLngLiteral representing southwest corner
 * @param ne - The LatLng/LatLngLiteral representing the northeast corner (if swOrBounds is a literal)
 * @returns A google.maps.LatLngBounds instance
 */
export function createLatLngBounds(
  swOrBounds?:
    | LatLng
    | google.maps.LatLngLiteral
    | google.maps.LatLngBounds
    | google.maps.LatLngBoundsLiteral
    | null,
  ne?: LatLng | google.maps.LatLngLiteral | null
): google.maps.LatLngBounds {
  if (!swOrBounds && !ne) {
    return new google.maps.LatLngBounds();
  }
  if (swOrBounds instanceof google.maps.LatLngBounds) {
    return swOrBounds;
  }
  return new google.maps.LatLngBounds(
    swOrBounds as google.maps.LatLngLiteral,
    ne as google.maps.LatLngLiteral
  );
}
