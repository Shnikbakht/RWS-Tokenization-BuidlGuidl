import * as React from "react";
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

// Select the contract data for a specific network (e.g., local development network)
const contractData = deployedContracts[31337].ERC1400RealEstate;

// Access the address and ABI
const contractAddress = contractData.address;
const abi = contractData.abi;

export function MintTokenForm({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = React.useState<string>(""); // State for input field
  const [whitelistedAccount, setWhitelistedAccount] = React.useState<string>(""); // State for whitelisted account input
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhitelistedAccount(e.target.value);
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!amount || isNaN(Number(amount))) {
      console.error("Invalid amount");
      return;
    }

    if (!whitelistedAccount) {
      console.error("Whitelisted account is required");
      return;
    }

    try {
      await writeContract({
        address: contractAddress,
        abi,
        functionName: "mint",
        args: [whitelistedAccount, BigInt(amount)], // Pass the whitelisted account and amount
      });

      console.log("Transaction submitted:", hash);
    } catch (err) {
      console.error("Error sending transaction:", err);
    }
  }

  return (
    <form onSubmit={submit}>
      <div>
        <input
          name="whitelistedAccount"
          placeholder="Whitelisted Account Address"
          value={whitelistedAccount}
          onChange={handleAccountChange}
          required
        />
      </div>

      <div>
        <input
          name="amount"
          placeholder="Enter amount to mint"
          value={amount}
          onChange={handleAmountChange}
          required
        />
      </div>

      <button disabled={isPending} type="submit">
        {isPending ? "Confirming..." : "Mint"}
      </button>

      {hash && (
        <div>
          <p>Transaction Hash: <a href={`https://etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer">{hash}</a></p>
        </div>
      )}

      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>✅ Mint successful! {amount} tokens minted to {whitelistedAccount}</div>}

      {error && <div>Error: {(error as BaseError).shortMessage || error.message}</div>}

      <button type="button" onClick={onClose} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">
        Close
      </button>
    </form>
  );
}

// import { useState } from "react";
// import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
// import { parseUnits } from "viem";
// import deployedContracts from "~~/contracts/deployedContracts";

// // Select the contract data for a specific network (e.g., local development network)
// const contractData = deployedContracts[31337].ERC1400RealEstate;

// // Access the address and ABI
// const contractAddress = contractData.address;
// const contractABI = contractData.abi;
// export const MintTokenForm = ({ onClose }: { onClose: () => void }) => {
//   const [propertyId, setPropertyId] = useState("");
//   const [tokenQuantity, setTokenQuantity] = useState("");

//   const { address: account } = useAccount();
//   const { data: hash, writeContract, isPending } = useWriteContract();
//   const { isLoading, isSuccess, error } = useWaitForTransactionReceipt({ hash });

//   const handleMintTokens = async () => {
//     console.log("Button Clicked!"); // Debugging step 1

//     if (!propertyId || !tokenQuantity) {
//       alert("Please fill all fields");
//       return;
//     }

//     if (!account) {
//       alert("Please connect your wallet.");
//       return;
//     }

//     console.log("Preparing contract call..."); // Debugging step 2

//     try {
//       await writeContract({
//         address: contractAddress, // Ensure this is correct
//         abi: contractABI,
//         functionName: "mint",
//         args: [account, parseUnits(tokenQuantity, 18)],
//       });

//       console.log("Transaction Sent! Waiting for confirmation...");
//     } catch (err) {
//       console.error("Error executing transaction:", err);
//       alert("Transaction failed. Check console for details.");
//     }
//   };

//   return (
//     <div>
//       <div className="mb-4">
//         <label htmlFor="propertyId" className="block text-sm font-medium">Property ID</label>
//         <input
//           id="propertyId"
//           type="text"
//           value={propertyId}
//           onChange={(e) => setPropertyId(e.target.value)}
//           className="mt-2 w-full p-3 border rounded-lg"
//         />
//       </div>
//       <div className="mb-4">
//         <label htmlFor="tokenQuantity" className="block text-sm font-medium">Token Quantity</label>
//         <input
//           id="tokenQuantity"
//           type="number"
//           value={tokenQuantity}
//           onChange={(e) => setTokenQuantity(e.target.value)}
//           className="mt-2 w-full p-3 border rounded-lg"
//         />
//       </div>
//       <div className="flex justify-between">
//         <button className="bg-red-500 text-white py-2 px-4 rounded-lg" onClick={onClose}>
//           Cancel
//         </button>
//         <button
//           className={`bg-green-500 text-white py-2 px-4 rounded-lg ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
//           onClick={handleMintTokens}
//           disabled={isLoading || isPending}
//         >
//           {isLoading || isPending ? "Minting..." : "Mint Tokens"}
//         </button>
//       </div>
//       {isSuccess && <p className="text-green-500 mt-2">Minting Successful!</p>}
//       {error && <p className="text-red-500 mt-2">Transaction Failed: {error.message}</p>}
//     </div>
//   );
// };
