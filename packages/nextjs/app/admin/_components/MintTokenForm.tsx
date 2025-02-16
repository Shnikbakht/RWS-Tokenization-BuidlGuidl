import { useState } from "react";

export const MintTokenForm = ({ onClose }: { onClose: () => void }) => {
  const [propertyId, setPropertyId] = useState("");
  const [tokenQuantity, setTokenQuantity] = useState("");
  const [totalValue, setTotalValue] = useState("");

  const handleMintTokens = () => {
    // Add logic to trigger minting function via contract
    console.log("Minting", { propertyId, tokenQuantity, totalValue });
    // On success or error, close the modal
    onClose();
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="propertyId" className="block text-sm font-medium">Property ID</label>
        <input
          id="propertyId"
          type="text"
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="mt-2 w-full p-3 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tokenQuantity" className="block text-sm font-medium">Token Quantity</label>
        <input
          id="tokenQuantity"
          type="number"
          value={tokenQuantity}
          onChange={(e) => setTokenQuantity(e.target.value)}
          className="mt-2 w-full p-3 border rounded-lg"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="totalValue" className="block text-sm font-medium">Total Token Value ($)</label>
        <input
          id="totalValue"
          type="number"
          value={totalValue}
          onChange={(e) => setTotalValue(e.target.value)}
          className="mt-2 w-full p-3 border rounded-lg"
        />
      </div>
      <div className="flex justify-between">
        <button
          className="bg-red-500 text-white py-2 px-4 rounded-lg"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="bg-green-500 text-white py-2 px-4 rounded-lg"
          onClick={handleMintTokens}
        >
          Mint Tokens
        </button>
      </div>
    </div>
  );
};
