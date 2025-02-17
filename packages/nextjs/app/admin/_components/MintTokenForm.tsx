import * as React from "react";
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

const contractData = deployedContracts[31337].ERC1400RealEstate;
const contractAddress = contractData.address;
const abi = contractData.abi;

export function MintTokenForm({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = React.useState("");
  const [whitelistedAccount, setWhitelistedAccount] = React.useState("");
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !whitelistedAccount) return console.error("Invalid input");

    try {
      await writeContract({
        address: contractAddress,
        abi,
        functionName: "mint",
        args: [whitelistedAccount, BigInt(amount)],
      });
    } catch (err) {
      console.error("Transaction error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center text-blue-500 mb-6">Mint Tokens</h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            placeholder="Whitelisted Account Address"
            value={whitelistedAccount}
            onChange={e => setWhitelistedAccount(e.target.value)}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={isPending}
            className={`w-full py-3 mt-4 text-white rounded-md ${isPending ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} transition`}
          >
            {isPending ? "Confirming..." : "Mint"}
          </button>
        </form>

        {isConfirming && <p className="mt-4 text-gray-500">Waiting for confirmation...</p>}
        {isConfirmed && (
          <p className="mt-4 text-green-500">
            ✅ Mint successful!{" "}
            <a
              href={`http://localhost:3000/blockexplorer/transaction/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500"
            >
              View transaction
            </a>
          </p>
        )}
        {error && <p className="mt-4 text-red-500">Error: {(error as BaseError).shortMessage || error.message}</p>}

        <button
          onClick={onClose}
          className="mt-4 text-white bg-gray-600 hover:bg-gray-700 rounded-lg px-4 py-2 text-sm font-semibold transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 inline-block mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Close
        </button>
      </div>
    </div>
  );
}
