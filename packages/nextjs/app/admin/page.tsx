"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useState } from "react";
import { MintTokenForm } from "./_components/MintTokenForm";

const AdminDashboard = () => {
  const { address: connectedAddress } = useAccount();
  const [mintingModalOpen, setMintingModalOpen] = useState(false);
  
  // Define sidebar width as a constant for consistency
  const SIDEBAR_WIDTH = "280px";

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div 
        className="bg-indigo-900 text-white fixed top-0 left-0 h-full flex flex-col justify-between z-50 shadow-xl"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex flex-col h-full">
          <div className="px-6 py-8 border-b border-indigo-800">
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          </div>
          
          <div className="px-4 py-6 flex-grow">
            <nav className="space-y-1">
              <Link href="/admin">
                <div className="flex items-center px-4 py-3 text-white bg-indigo-800 rounded-md text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Dashboard
                </div>
              </Link>
              <Link href="/admin/tokenized-properties">
                <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-indigo-800 hover:text-white rounded-md text-sm font-medium transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Tokenized Properties
                </div>
              </Link>
              <Link href="/admin/manage-token-sale">
                <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-indigo-800 hover:text-white rounded-md text-sm font-medium transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Manage Token Sale
                </div>
              </Link>
              <Link href="/blockexplorer">
                <div className="flex items-center px-4 py-3 text-gray-300 hover:bg-indigo-800 hover:text-white rounded-md text-sm font-medium transition-colors duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Block Explorer
                </div>
              </Link>
            </nav>
          </div>
          
          <div className="px-6 py-4 border-t border-indigo-800">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Admin User</p>
                <p className="text-xs text-indigo-300 truncate">{connectedAddress ? `${connectedAddress.slice(0,6)}...${connectedAddress.slice(-4)}` : "Not connected"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 p-8"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Properties</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">12</p>
              <div className="mt-1 flex items-center text-sm font-medium text-green-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>8.2%</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Token Value</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">$5,000,000</p>
              <div className="mt-1 flex items-center text-sm font-medium text-green-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>12.5%</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Transactions</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">34</p>
              <div className="mt-1 flex items-center text-sm font-medium text-yellow-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                <span>0.0%</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Minted Tokens</h3>
              <p className="mt-2 text-3xl font-semibold text-gray-900">45,000</p>
              <div className="mt-1 flex items-center text-sm font-medium text-green-600">
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>22.3%</span>
              </div>
            </div>
          </div>
        </header>

        {/* Token Minting Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Token Minting</h2>
            <button
              className="bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setMintingModalOpen(true)}
            >
              Mint New Tokens
            </button>
          </div>
          
          {/* Minting Modal */}
          {mintingModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Mint New Tokens</h3>
                  <button 
                    onClick={() => setMintingModalOpen(false)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <MintTokenForm onClose={() => setMintingModalOpen(false)} />
              </div>
            </div>
          )}
          
          {/* Recent Minting Activity */}
          <div className="bg-white shadow-sm rounded-lg border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-700">Recent Minting Activity</h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Property #8 Tokens</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
                <span className="text-sm font-medium text-gray-900">5,000 tokens</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Property #11 Tokens</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
                <span className="text-sm font-medium text-gray-900">10,000 tokens</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">Property #5 Tokens</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
                <span className="text-sm font-medium text-gray-900">8,000 tokens</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tokenized Properties Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tokenized Properties</h2>
            <Link href="/admin/tokenized-properties">
              <span className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All Properties</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Property Card 1 */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <div className="h-36 bg-gray-200 rounded-md mb-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Active
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Luxury Apartment Building</h3>
              <p className="text-sm text-gray-500 mb-4">New York, NY</p>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500">Token Quantity</p>
                  <p className="text-sm font-medium text-gray-900">10,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Token Value</p>
                  <p className="text-sm font-medium text-gray-900">$1,000,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sold</p>
                  <p className="text-sm font-medium text-gray-900">68%</p>
                </div>
              </div>
              
              <Link href="/admin/tokenized-properties/1">
                <button className="w-full text-center bg-indigo-50 text-indigo-600 text-sm font-medium py-2 rounded-md hover:bg-indigo-100 transition-colors duration-200">
                  View Details
                </button>
              </Link>
            </div>
            
            {/* Property Card 2 */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <div className="h-36 bg-gray-200 rounded-md mb-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                  Pending
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Commercial Office Space</h3>
              <p className="text-sm text-gray-500 mb-4">Chicago, IL</p>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500">Token Quantity</p>
                  <p className="text-sm font-medium text-gray-900">15,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Token Value</p>
                  <p className="text-sm font-medium text-gray-900">$2,250,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sold</p>
                  <p className="text-sm font-medium text-gray-900">42%</p>
                </div>
              </div>
              
              <Link href="/admin/tokenized-properties/2">
                <button className="w-full text-center bg-indigo-50 text-indigo-600 text-sm font-medium py-2 rounded-md hover:bg-indigo-100 transition-colors duration-200">
                  View Details
                </button>
              </Link>
            </div>
            
            {/* Property Card 3 */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <div className="h-36 bg-gray-200 rounded-md mb-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                  New
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Residential Complex</h3>
              <p className="text-sm text-gray-500 mb-4">Miami, FL</p>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500">Token Quantity</p>
                  <p className="text-sm font-medium text-gray-900">8,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Token Value</p>
                  <p className="text-sm font-medium text-gray-900">$1,750,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sold</p>
                  <p className="text-sm font-medium text-gray-900">0%</p>
                </div>
              </div>
              
              <Link href="/admin/tokenized-properties/3">
                <button className="w-full text-center bg-indigo-50 text-indigo-600 text-sm font-medium py-2 rounded-md hover:bg-indigo-100 transition-colors duration-200">
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