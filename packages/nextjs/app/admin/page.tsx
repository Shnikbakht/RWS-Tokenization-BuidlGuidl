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
              <button className="w-full text-left py-3 px-5 rounded-lg hover:bg-blue-800 text-lg">
                Dashboard
              </button>
            </Link>
            <Link href="/admin/tokenized-properties">
              <button className="w-full text-left py-3 px-5 rounded-lg hover:bg-blue-800 text-lg">
                Tokenized Properties
              </button>
            </Link>
            <Link href="/admin/manage-token-sale">
              <button className="w-full text-left py-3 px-5 rounded-lg hover:bg-blue-800 text-lg">
                Manage Token Sale
              </button>
            </Link>
            <Link href="/blockexplorer">
              <button className="w-full text-left py-3 px-5 rounded-lg hover:bg-blue-800 text-lg">
                Block Explorer
              </button>
            </Link>
          </div>
        </div>
        {/* Optionally add a logout button or settings link here */}
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header with Overview Metrics */}
        <header className="mb-8">
          <h1 className="text-4xl font-semibold text-blue-900 mb-4">Dashboard Overview</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Total Properties</h3>
              <p className="text-gray-700 text-2xl">12</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Total Token Value</h3>
              <p className="text-gray-700 text-2xl">$5,000,000</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Active Transactions</h3>
              <p className="text-gray-700 text-2xl">34</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Minted Tokens</h3>
              <p className="text-gray-700 text-2xl">45,000</p>
            </div>
          </div>
        </header>

        {/* Token Minting Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-semibold text-blue-900">Token Minting</h2>
            <button
              className="bg-yellow-500 text-white text-lg font-semibold py-3 px-8 rounded-lg hover:bg-yellow-600 transition-all"
              onClick={() => setMintingModalOpen(true)}
            >
              Mint New Tokens
            </button>
          </div>
          {/* Minting Modal */}
          {mintingModalOpen && (
            <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h2 className="text-2xl font-bold mb-6">Mint New Tokens</h2>
                <MintTokenForm onClose={() => setMintingModalOpen(false)} />
              </div>
            </div>
          )}
        </section>

        {/* Tokenized Properties Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-blue-900 mb-6">Tokenized Properties</h2>
          <div className="space-y-6">
            {/* Example Property Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-xl mb-2">Property 1</h3>
              <p className="text-gray-700">Token Quantity: 1000</p>
              <p className="text-gray-700">Total Token Value: $1,000,000</p>
              <p className="text-gray-700">Current Sale Status: Active</p>
              <Link href="/admin/tokenized-properties/1">
                <button className="bg-blue-500 text-white py-2 px-5 rounded-lg mt-4 hover:bg-blue-600">
                  View Details
                </button>
              </Link>
            </div>
            {/* Additional property cards could be mapped from data */}
          </div>
        </section>

        {/* Transactions Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-blue-900 mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {/* Example Transaction Card */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="font-semibold">Transaction 1: Minted 1000 Tokens</p>
              <p className="text-gray-700">Status: Success</p>
              <p className="text-gray-700">Time: 2 minutes ago</p>
            </div>
            {/* Additional transactions would be listed here */}
          </div>
        </section>

        {/* Compliance & Legal Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-blue-900 mb-6">Compliance & Legal</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-gray-700">
              Ensure all properties meet regulatory and compliance standards.
            </p>
            <Link href="/admin/compliance">
              <button className="bg-blue-500 text-white py-2 px-5 rounded-lg mt-4 hover:bg-blue-600">
                Review Compliance Documents
              </button>
            </Link>
          </div>
        </section>

        {/* Financial & User Reporting Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-blue-900 mb-6">Financial & User Reporting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">Revenue Report</h3>
              <p className="text-gray-700">Monthly revenue: $250,000</p>
              <Link href="/admin/reports/revenue">
                <button className="bg-blue-500 text-white py-2 px-5 rounded-lg mt-4 hover:bg-blue-600">
                  View Report
                </button>
              </Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold">User Activity</h3>
              <p className="text-gray-700">Active users: 150</p>
              <Link href="/admin/reports/users">
                <button className="bg-blue-500 text-white py-2 px-5 rounded-lg mt-4 hover:bg-blue-600">
                  View Details
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
