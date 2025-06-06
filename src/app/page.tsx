// File: src/app/page.tsx

import { GoogleMap } from "@/components/GoogleMap";
import { JSX } from "react";

/**
 * Page entry point: renders the GoogleMap component.
 * @returns The GoogleMap wrapped component
 */
export default function Page(): JSX.Element {
  return <GoogleMap />;
}
