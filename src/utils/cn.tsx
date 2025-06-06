import clsx from "clsx";
import { ClassNameValue, twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names with deduplication.
 * @param inputs - Any number of clsx-compatible className values (strings, objects, arrays, etc.)
 * @returns A single merged string of class names without duplicates
 */
export default function cn(...inputs: ClassNameValue[]): string {
  return twMerge(clsx(inputs));
}
