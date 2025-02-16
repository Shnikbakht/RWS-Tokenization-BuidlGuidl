"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useState } from "react";
import { MintTokenForm } from "./_components/MintTokenForm"; // Assume you create a component for minting

const AdminDashboard = () => {
  const { address: connectedAddress } = useAccount();
  const [mintingModalOpen, setMintingModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white fixed h-full px-6 py-8 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
          <div className="space-y-6">
            <Link href="/admin">
              <button className="w-full text-left py-3 px-5 rounded-lg hover:bg-blue-800 text-lg">Dashboard</button>
            </Link>
            <Link href="/admin/tokenized-properties">
              <button className="w-full text-left py-3 px-5 rounded-lg hover:bg-blue-800 text-lg">Tokenized Properties</button>
            </Link>
            <Link href="/admin/manage-token-sale">
              <button className="w-full text-left py-3 px-5 rounded-lg hover:bg-blue-800 text-lg">Manage Token Sale</button>
            </Link>
            <Link href="/admin/transactions">
              <button className="w-full text-left py-3 px-5 rounded-lg hover:bg-blue-800 text-lg">Transactions</button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-4xl font-semibold text-blue-900 mb-8">Admin Dashboard</h1>

        <div className="mb-8">
          <button
            className="bg-yellow-500 text-white text-lg font-semibold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-all"
            onClick={() => setMintingModalOpen(true)}
          >
            Mint New Tokens
          </button>
        </div>

        {/* Minting Token Modal (if open) */}
        {mintingModalOpen && (
          <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
              <h2 className="text-2xl font-bold mb-6">Mint New Tokens</h2>
              <MintTokenForm onClose={() => setMintingModalOpen(false)} />
            </div>
          </div>
        )}

        {/* Tokenized Properties Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-semibold text-blue-900 mb-6">Tokenized Properties</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-xl mb-2">Property 1</h3>
              <p className="text-gray-700">Token Quantity: 1000</p>
              <p className="text-gray-700">Total Token Value: $1,000,000</p>
              <p className="text-gray-700">Current Sale Status: Active</p>
              <Link href="/admin/tokenized-properties/1">
                <button className="bg-blue-500 text-white py-2 px-5 rounded-lg mt-4 hover:bg-blue-600">View Details</button>
              </Link>
            </div>
            {/* Repeat for other tokenized properties */}
          </div>
        </div>

        {/* Transactions Section */}
        <div>
          <h2 className="text-3xl font-semibold text-blue-900 mb-6">Recent Transactions</h2>
          <div className="bg-white p-6 rounded-lg shadow-md mb-4">
            <p className="font-semibold">Transaction 1: Minted 1000 Tokens</p>
            <p className="text-gray-700">Status: Success</p>
            <p className="text-gray-700">Time: 2 minutes ago</p>
          </div>
          {/* Repeat for other transactions */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
