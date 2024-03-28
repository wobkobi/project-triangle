import { Address } from "@/types/Address";
import cn from "@/utils/cn";
import React, { useState } from "react";

interface AddressListsProps {
  addresses: Address[];
  potentialCentrals: Address[];
  handleSwitch: (selectedIndexes: number[], isFromCentral: boolean) => void;
  handleRemove: (selectedIndexes: number[], isFromCentral: boolean) => void;
  mostCentralAddress: Address | null;
}

export const AddressLists: React.FC<AddressListsProps> = ({
  addresses,
  potentialCentrals,
  handleSwitch,
  handleRemove,
  mostCentralAddress,
}) => {
  const [selectedAddresses, setSelectedAddresses] = useState<number[]>([]);
  const [selectedCentrals, setSelectedCentrals] = useState<number[]>([]);

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

  return (
    <div className={cn("flex w-full max-w-7xl space-x-8 bg-gray-100 p-8")}>
      {/* Addresses list */}
      <div className={cn("w-full lg:w-1/2")}>
        <h2 className={cn("text-xl font-bold")}>Addresses</h2>
        {addresses.map((address, index) => (
          <div key={index} className={cn("mb-4 flex items-center")}>
            <input
              type="checkbox"
              checked={selectedAddresses.includes(index)}
              onChange={() => toggleSelectedAddress(index)}
            />
            <div className={cn("ml-2")}>{address.name}</div>
          </div>
        ))}
        <div className={cn("mt-4 flex justify-end space-x-4")}>
          <button
            className={cn(
              "text-sm text-green-600 transition-colors duration-200 hover:text-green-800"
            )}
            onClick={() => handleSwitch(selectedAddresses, false)}>
            Move to Potential Centrals
          </button>
          <button
            className={cn(
              "text-sm text-red-600 transition-colors duration-200 hover:text-red-800"
            )}
            onClick={() => handleRemove(selectedAddresses, false)}>
            Remove Selected
          </button>
        </div>
      </div>

      {/* Potential Central Locations list */}
      <div className={cn("w-full lg:w-1/2")}>
        <h2 className={cn("text-xl font-bold")}>Potential Central Locations</h2>
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
            onClick={() => handleSwitch(selectedCentrals, true)}>
            Move to Addresses
          </button>
          <button
            className={cn(
              "text-sm text-red-600 transition-colors duration-200 hover:text-red-800"
            )}
            onClick={() => handleRemove(selectedCentrals, true)}>
            Remove Selected
          </button>
        </div>
      </div>
    </div>
  );
};
