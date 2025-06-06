// File: src/components/Map/AddressList.tsx

import Modal from "@/components/Modal";
import Address from "@/types/address";
import cn from "@/utils/cn";
import { JSX, useMemo, useState } from "react";

interface AddressListProps {
  /** All user-entered locations that are currently in the “Addresses” list */
  addresses: Address[];
  /** All user-entered locations that are currently in the “Potential Central Locations” list */
  potentialCentrals: Address[];
  /**
   * Callback to move items between `addresses` and `potentialCentrals`.
   * @param selectedIndexes - Indexes of the selected items (0-based).
   * @param isFromCentral - When true, move from `potentialCentrals` into `addresses`; otherwise, move from `addresses` into `potentialCentrals`.
   */
  handleSwitch: (selectedIndexes: number[], isFromCentral: boolean) => void;
  /**
   * Callback to remove selected items from either `addresses` or `potentialCentrals`.
   * @param selectedIndexes - Indexes of the selected items (0-based).
   * @param isFromCentral - When true, remove from `potentialCentrals`; otherwise, remove from `addresses`.
   */
  handleRemove: (selectedIndexes: number[], isFromCentral: boolean) => void;
  /**
   * The address among `potentialCentrals` that has been computed as the true “most central.”
   * If there is no central calculated (e.g., the list is empty), this will be null.
   */
  mostCentralAddress: Address | null;
}

/**
 * Renders two panels side-by-side (on large screens): one for “Addresses” and one for “Potential Central Locations.”
 * Each panel:
 * - Displays a scrollable list of items with checkboxes.
 * - Provides buttons to move selected items to the other list or remove selected items entirely.
 * - Highlights the “most central” address in the potential centrals list with a special background.
 * - Shows a modal if the user attempts an action without selecting anything.
 * - Shortens displayed address names if all share the same country suffix.
 * @param params - The props object containing all sub-properties used by this component.
 * @param params.addresses - Array of Address objects representing the current “Addresses” list.
 * @param params.potentialCentrals - Array of Address objects representing the current “Potential Central Locations” list.
 * @param params.handleSwitch - Callback invoked when moving selected items between the two lists. Receives an array of selected indexes and a boolean indicating source list.
 * @param params.handleRemove - Callback invoked when removing selected items from a list. Receives an array of selected indexes and a boolean indicating source list.
 * @param params.mostCentralAddress - The Address object that has been computed as the most central among `potentialCentrals`, or null if none.
 * @returns A styled grid containing two cards (Addresses & Potential Centrals) and a modal when no items are selected for an action.
 */
export default function AddressList({
  addresses,
  potentialCentrals,
  handleSwitch,
  handleRemove,
  mostCentralAddress,
}: AddressListProps): JSX.Element {
  const [selectedAddresses, setSelectedAddresses] = useState<number[]>([]);
  const [selectedCentrals, setSelectedCentrals] = useState<number[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string[]>([]);

  // Determine if all locations share the same country suffix
  const commonCountry = useMemo(() => {
    const allNames = [...addresses, ...potentialCentrals].map((a) => a.name);
    if (allNames.length === 0) return null;

    const extractCountry = (full: string): string | null => {
      const parts = full.split(",").map((p) => p.trim());
      return parts.length > 1 ? parts[parts.length - 1] : null;
    };

    const firstCountry = extractCountry(allNames[0]);
    if (!firstCountry) return null;

    for (const name of allNames) {
      if (extractCountry(name) !== firstCountry) return null;
    }
    return firstCountry;
  }, [addresses, potentialCentrals]);

  const shorten = (full: string): string =>
    commonCountry
      ? full.replace(new RegExp(`,\\s*${commonCountry}$`), "")
      : full;

  /**
   * Toggle whether an address at the given index is selected.
   * @param index - The index (0-based) of the address in the `addresses` array.
   */
  const toggleSelectedAddress = (index: number): void => {
    setSelectedAddresses((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  /**
   * Toggle whether a potential central at the given index is selected.
   * @param index - The index (0-based) of the potential central in the `potentialCentrals` array.
   */
  const toggleSelectedCentral = (index: number): void => {
    setSelectedCentrals((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  /**
   * Called when the user clicks the “Move” button for one of the lists.
   * If no items are selected, shows a modal instructing the user to select at least one item.
   * Otherwise, calls `handleSwitch` to move items between lists and clears selections.
   * @param isFromCentral - True if moving from potentialCentrals → addresses; false if moving from addresses → potentialCentrals.
   */
  const onSwitchClicked = (isFromCentral: boolean): void => {
    const selected = isFromCentral ? selectedCentrals : selectedAddresses;
    if (selected.length === 0) {
      setModalContent([
        "Please select at least one address to move.",
        "Use the checkboxes to make your selection.",
      ]);
      setShowModal(true);
      return;
    }
    handleSwitch(selected, isFromCentral);
    setSelectedAddresses([]);
    setSelectedCentrals([]);
  };

  /**
   * Called when the user clicks the “Remove” button for one of the lists.
   * If no items are selected, shows a modal instructing the user to select at least one item.
   * Otherwise, calls `handleRemove` to delete items and clears selections.
   * @param isFromCentral - True if removing from potentialCentrals; false if removing from addresses.
   */
  const onRemoveClicked = (isFromCentral: boolean): void => {
    const selected = isFromCentral ? selectedCentrals : selectedAddresses;
    if (selected.length === 0) {
      setModalContent([
        "Please select at least one address to remove.",
        "Use the checkboxes to make your selection.",
      ]);
      setShowModal(true);
      return;
    }
    handleRemove(selected, isFromCentral);
    setSelectedAddresses([]);
    setSelectedCentrals([]);
  };

  return (
    <>
      <div
        className={cn(
          "mx-auto my-6 grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2"
        )}>
        {/* Addresses Card */}
        <div className={cn("rounded-lg bg-white p-6 shadow-md")}>
          <h2 className={cn("mb-4 text-xl font-semibold")}>Addresses</h2>
          <div className={cn("max-h-64 space-y-2 overflow-y-auto")}>
            {addresses.map((address, index) => {
              // If address.title exists, show it before the (shortened) address.name
              const fullName = address.title
                ? `${address.title} – ${address.name}`
                : address.name;
              const displayText = shorten(fullName);

              return (
                <label
                  key={`${address.lat}-${address.lng}-${index}`}
                  className={cn(
                    "mb-2 flex cursor-pointer items-center space-x-2 select-none"
                  )}>
                  <input
                    type="checkbox"
                    checked={selectedAddresses.includes(index)}
                    onChange={() => toggleSelectedAddress(index)}
                    className={cn("h-5 w-5")}
                    aria-label={`Select address: ${displayText}`}
                  />
                  <span>{displayText}</span>
                </label>
              );
            })}
          </div>
          <div className={cn("mt-4 flex justify-end space-x-4")}>
            <button
              onClick={() => onSwitchClicked(false)}
              disabled={selectedAddresses.length === 0}
              className={cn(
                "text-sm text-green-600 hover:text-green-800 disabled:cursor-not-allowed disabled:text-gray-400"
              )}>
              Move to Potential Centrals
            </button>
            <button
              onClick={() => onRemoveClicked(false)}
              disabled={selectedAddresses.length === 0}
              className={cn(
                "text-sm text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
              )}>
              Remove Selected
            </button>
          </div>
        </div>

        {/* Potential Central Locations Card */}
        <div className={cn("rounded-lg bg-white p-6 shadow-md")}>
          <h2 className={cn("mb-4 text-xl font-semibold")}>
            Potential Central Locations
          </h2>
          <div className={cn("max-h-64 space-y-2 overflow-y-auto")}>
            {potentialCentrals.map((address, index) => {
              const isMostCentral =
                mostCentralAddress &&
                address.lat === mostCentralAddress.lat &&
                address.lng === mostCentralAddress.lng;

              // If address.title exists, show it before the (shortened) address.name
              const fullName = address.title
                ? `${address.title} – ${address.name}`
                : address.name;
              const displayText = shorten(fullName);

              return (
                <label
                  key={`${address.lat}-${address.lng}-${index}`}
                  className={cn(
                    "mb-2 flex cursor-pointer items-center space-x-2 select-none",
                    isMostCentral ? "rounded bg-green-50 p-1" : ""
                  )}>
                  <input
                    type="checkbox"
                    checked={selectedCentrals.includes(index)}
                    onChange={() => toggleSelectedCentral(index)}
                    className={cn("h-5 w-5")}
                    aria-label={`Select potential central: ${displayText}`}
                  />
                  <span>{displayText}</span>
                </label>
              );
            })}
          </div>
          <div className={cn("mt-4 flex justify-end space-x-4")}>
            <button
              onClick={() => onSwitchClicked(true)}
              disabled={selectedCentrals.length === 0}
              className={cn(
                "text-sm text-green-600 hover:text-green-800 disabled:cursor-not-allowed disabled:text-gray-400"
              )}>
              Move to Addresses
            </button>
            <button
              onClick={() => onRemoveClicked(true)}
              disabled={selectedCentrals.length === 0}
              className={cn(
                "text-sm text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
              )}>
              Remove Selected
            </button>
          </div>
        </div>
      </div>

      {/* Modal displayed when the user tries to move/remove without selecting items */}
      {showModal && (
        <Modal isOpen={true} onClose={() => setShowModal(false)}>
          {modalContent.map((text, idx) => (
            <p key={idx}>{text}</p>
          ))}
        </Modal>
      )}
    </>
  );
}
