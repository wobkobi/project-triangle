// File: src/components/Map/AddressList.tsx

import Modal from "@/components/Modal";
import Address from "@/types/address";
import cn from "@/utils/cn";
import { useState } from "react";

interface AddressListProps {
  addresses: Address[];
  potentialCentrals: Address[];
  handleSwitch: (selectedIndexes: number[], isFromCentral: boolean) => void;
  handleRemove: (selectedIndexes: number[], isFromCentral: boolean) => void;
  mostCentralAddress: Address | null;
}

/**
 * AddressList component: renders two panels ("Addresses" and "Potential Central Locations"),
 * each with checkboxes for selecting items. Provides buttons to move or remove selected items.
 * @param root0 - Props object
 * @param root0.addresses - Array of current addresses
 * @param root0.potentialCentrals - Array of potential central addresses
 * @param root0.handleSwitch - Callback to move items between lists
 * @param root0.handleRemove - Callback to remove items
 * @param root0.mostCentralAddress - The address marked as most central
 * @returns The address‐list JSX element
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

  /**
   * Toggle selection of an address in the "Addresses" panel.
   * @param index - Index of the address to toggle
   */
  const toggleSelectedAddress = (index: number): void => {
    setSelectedAddresses((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  /**
   * Toggle selection of a central in the "Potential Central Locations" panel.
   * @param index - Index of the potential central to toggle
   */
  const toggleSelectedCentral = (index: number): void => {
    setSelectedCentrals((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  /**
   * Handle the "Move" button click for either list.
   * @param isFromCentral - If true, move from potentialCentrals to addresses; otherwise from addresses to potentials
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
   * Handle the "Remove" button click for either list.
   * @param isFromCentral - If true, remove from potentialCentrals; otherwise from addresses
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
      <div className={cn("flex w-full max-w-[70%] space-x-8 bg-gray-100 p-8")}>
        {/* Addresses List */}
        <div className={cn("w-full lg:w-1/2")}>
          <h2 className={cn("text-xl font-bold")}>Addresses</h2>
          <div className={cn("mt-2 max-h-64 overflow-y-auto")}>
            {addresses.map((address, index) => (
              <label
                key={`${address.lat}-${address.lng}`}
                className={cn(
                  "mb-2 flex cursor-pointer select-none items-center"
                )}>
                <input
                  type="checkbox"
                  checked={selectedAddresses.includes(index)}
                  onChange={() => toggleSelectedAddress(index)}
                  className={cn("h-5 w-5")}
                  aria-label={`Select address: ${address.name}`}
                />
                <span className={cn("ml-2")}>{address.name}</span>
              </label>
            ))}
          </div>
          <div className={cn("mt-4 flex justify-end space-x-4")}>
            <button
              onClick={() => onSwitchClicked(false)}
              disabled={selectedAddresses.length === 0}
              className={cn(
                "text-sm text-green-600 transition-colors duration-200 hover:text-green-800 disabled:cursor-not-allowed disabled:text-gray-400"
              )}
              aria-label="Move selected addresses to potential centrals">
              Move to Potential Centrals
            </button>
            <button
              onClick={() => onRemoveClicked(false)}
              disabled={selectedAddresses.length === 0}
              className={cn(
                "text-sm text-red-600 transition-colors duration-200 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
              )}
              aria-label="Remove selected addresses">
              Remove Selected
            </button>
          </div>
        </div>

        {/* Potential Central Locations List */}
        <div className={cn("w-full lg:w-1/2")}>
          <h2 className={cn("text-xl font-bold")}>
            Potential Central Locations
          </h2>
          <div className={cn("mt-2 max-h-64 overflow-y-auto")}>
            {potentialCentrals.map((address, index) => {
              const isMostCentral =
                mostCentralAddress &&
                address.lat === mostCentralAddress.lat &&
                address.lng === mostCentralAddress.lng;

              return (
                <label
                  key={`${address.lat}-${address.lng}`}
                  className={cn(
                    "mb-2 flex cursor-pointer select-none items-center",
                    isMostCentral ? "rounded bg-green-200 p-1" : ""
                  )}>
                  <input
                    type="checkbox"
                    checked={selectedCentrals.includes(index)}
                    onChange={() => toggleSelectedCentral(index)}
                    className={cn("h-5 w-5")}
                    aria-label={`Select potential central: ${address.name}`}
                  />
                  <span className={cn("ml-2")}>{address.name}</span>
                </label>
              );
            })}
          </div>
          <div className={cn("mt-4 flex justify-end space-x-4")}>
            <button
              onClick={() => onSwitchClicked(true)}
              disabled={selectedCentrals.length === 0}
              className={cn(
                "text-sm text-green-600 transition-colors duration-200 hover:text-green-800 disabled:cursor-not-allowed disabled:text-gray-400"
              )}
              aria-label="Move selected potential centrals to addresses">
              Move to Addresses
            </button>
            <button
              onClick={() => onRemoveClicked(true)}
              disabled={selectedCentrals.length === 0}
              className={cn(
                "text-sm text-red-600 transition-colors duration-200 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
              )}
              aria-label="Remove selected potential centrals">
              Remove Selected
            </button>
          </div>
        </div>
      </div>

      {/* Render our Modal here */}
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
