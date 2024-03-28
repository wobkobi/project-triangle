import Modal from "@/components/Modal";
import Address from "@/types/Address";
import cn from "@/utils/cn";
import { useState } from "react";

interface AddressListsProps {
  addresses: Address[];
  potentialCentrals: Address[];
  handleSwitch: (selectedIndexes: number[], isFromCentral: boolean) => void;
  handleRemove: (selectedIndexes: number[], isFromCentral: boolean) => void;
  mostCentralAddress: Address | null;
}

export default function AddressLists({
  addresses,
  potentialCentrals,
  handleSwitch,
  handleRemove,
  mostCentralAddress,
}: AddressListsProps) {
  const [selectedAddresses, setSelectedAddresses] = useState<number[]>([]);
  const [selectedCentrals, setSelectedCentrals] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<string[]>([]);
  // Toggle selection for an address
  const toggleSelectedAddress = (index: number) => {
    setSelectedAddresses((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Toggle selection for a potential central
  const toggleSelectedCentral = (index: number) => {
    setSelectedCentrals((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const onSwitchClicked = (isFromCentral: boolean) => {
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
    setSelectedCentrals([]);
    setSelectedAddresses([]);
  };

  const onRemoveClicked = (isFromCentral: boolean) => {
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
    setSelectedCentrals([]);
    setSelectedAddresses([]);
  };

  return (
    <>
      <div className={cn("flex w-full max-w-[70%] space-x-8 bg-gray-100 p-8")}>
        {/* Addresses list */}
        <div className={cn("w-full lg:w-1/2")}>
          <h2 className={cn("text-xl font-bold")}>Addresses</h2>
          {addresses.map((address, index) => (
            <div key={index} className={cn("mb-4 flex items-center")}>
              <input
                type="checkbox"
                checked={selectedAddresses.includes(index)}
                onChange={() => toggleSelectedAddress(index)}
                className={cn("h-5 w-5")}
              />
              <div className={cn("ml-2")}>{address.name}</div>
            </div>
          ))}
          <div className={cn("mt-4 flex justify-end space-x-4")}>
            <button
              className={cn(
                "text-sm text-green-600 transition-colors duration-200 hover:text-green-800"
              )}
              onClick={() => onSwitchClicked(false)}>
              Move to Potential Centrals
            </button>
            <button
              className={cn(
                "text-sm text-red-600 transition-colors duration-200 hover:text-red-800"
              )}
              onClick={() => onRemoveClicked(false)}>
              Remove Selected
            </button>
          </div>
        </div>

        {/* Potential Central Locations list */}
        <div className={cn("w-full lg:w-1/2")}>
          <h2 className={cn("text-xl font-bold")}>
            Potential Central Locations
          </h2>
          {potentialCentrals.map((address, index) => (
            <div
              key={index}
              className={cn(
                "mb-4 flex items-center",
                mostCentralAddress &&
                  address.lat === mostCentralAddress.lat &&
                  address.lng === mostCentralAddress.lng
                  ? "bg-green-200"
                  : ""
              )}>
              <input
                type="checkbox"
                checked={selectedCentrals.includes(index)}
                onChange={() => toggleSelectedCentral(index)}
                className={cn("h-5 w-5")}
              />
              <div className={cn("ml-2")}>{address.name}</div>
              {/* Additional rendering and interaction elements */}
            </div>
          ))}
          <div className={cn("mt-4 flex justify-end space-x-4")}>
            <button
              className={cn(
                "text-sm text-green-600 transition-colors duration-200 hover:text-green-800"
              )}
              onClick={() => onSwitchClicked(true)}>
              Move to Addresses
            </button>
            <button
              className={cn(
                "text-sm text-red-600 transition-colors duration-200 hover:text-red-800"
              )}
              onClick={() => onRemoveClicked(true)}>
              Remove Selected
            </button>
          </div>
        </div>
      </div>
      {showModal && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
          {modalContent.map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </Modal>
      )}
    </>
  );
}
