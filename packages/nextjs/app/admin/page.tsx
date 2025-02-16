"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useState } from "react";
//import { BugAntIcon, DevicePhoneIcon, DocumentTextIcon, UsersIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { MintTokenForm } from "./_components/MintTokenForm"; // Assume you create a component for minting

const AdminDashboard = () => {
  const { address: connectedAddress } = useAccount();
  const [mintingModalOpen, setMintingModalOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-blue-900 text-white h-full flex flex-col items-start p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <div className="space-y-4 w-full">
          <Link href="/admin">
            <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-blue-700 transition-all">Dashboard</button>
          </Link>
          <Link href="/admin/tokenized-properties">
            <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-blue-700 transition-all">Tokenized Properties</button>
          </Link>
          <Link href="/admin/manage-token-sale">
            <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-blue-700 transition-all">Manage Token Sale</button>
          </Link>
          <Link href="/admin/transactions">
            <button className="w-full text-left py-2 px-4 rounded-lg hover:bg-blue-700 transition-all">Transactions</button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 p-8">
        <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>

        <div className="flex justify-between mb-6">
          {/* Token Minting Button */}
          <button 
            className="bg-yellow-500 px-6 py-3 rounded-lg text-white text-lg font-semibold hover:bg-yellow-600 transition-all"
            onClick={() => setMintingModalOpen(true)}
          >
            Mint New Tokens
          </button>
        </div>

        {/* Minting Token Modal (if open) */}
        {mintingModalOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl w-96">
              <h2 className="text-2xl font-bold mb-4">Mint New Tokens</h2>
              <MintTokenForm onClose={() => setMintingModalOpen(false)} />
            </div>
          </div>
        )}

        {/* Tokenized Properties List */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Tokenized Properties</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-xl">Property 1</h3>
              <p className="text-gray-700">Token Quantity: 1000</p>
              <p className="text-gray-700">Total Token Value: $1,000,000</p>
              <p className="text-gray-700">Current Sale Status: Active</p>
              <Link href="/admin/tokenized-properties/1">
                <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">View Details</button>
              </Link>
            </div>
            {/* Repeat for other tokenized properties */}
          </div>
        </div>

        {/* Transactions Section */}
        <div>
          <h2 className="text-3xl font-bold mb-4">Recent Transactions</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
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
