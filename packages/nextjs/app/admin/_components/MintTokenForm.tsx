import * as React from "react";
import { type BaseError, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import deployedContracts from "~~/contracts/deployedContracts";

const contractData = deployedContracts[31337].ERC1400RealEstate;
const contractAddress = contractData.address;
const abi = contractData.abi;

export function MintTokenForm({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = React.useState<string>("");
  const [whitelistedAccount, setWhitelistedAccount] = React.useState<string>("");
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
        args: [whitelistedAccount, BigInt(amount)],
      });
    } catch (err) {
      console.error("Error sending transaction:", err);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center text-blue-500 mb-6">Mint Tokens</h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="whitelistedAccount" className="block text-sm font-medium text-gray-700">
              Whitelisted Account Address
            </label>
            <input
              name="whitelistedAccount"
              id="whitelistedAccount"
              type="text"
              placeholder="0x..."
              value={whitelistedAccount}
              onChange={handleAccountChange}
              className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount to Mint
            </label>
            <input
              name="amount"
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={handleAmountChange}
              className="mt-2 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            disabled={isPending}
            type="submit"
            className={`w-full py-3 mt-4 text-white rounded-md ${isPending ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} transition`}
          >
            {isPending ? "Confirming..." : "Mint"}
          </button>
        </form>

        {isConfirming && <div className="mt-4 text-gray-500">Waiting for confirmation...</div>}
        {isConfirmed && (
          <div className="mt-4 text-green-500">
            ✅ Mint successful!
            <br />
            <a
              href={`http://localhost:3000/blockexplorer/transaction/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500"
            >
              View transaction details
            </a>
          </div>
        )}

        {error && <div className="mt-4 text-red-500">Error: {(error as BaseError).shortMessage || error.message}</div>}

        <button type="button" onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-700 transition">
          Close
        </button>
      </div>
    </div>
  );
}
