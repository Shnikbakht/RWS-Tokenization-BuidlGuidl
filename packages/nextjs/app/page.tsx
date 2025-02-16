"use client"; 
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

// Home Page Data
const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      {/* Hero Section */}
      <div className="flex items-center flex-col flex-grow pt-10 bg-gradient-to-r from-blue-500 to-green-500">
        <div className="px-5 text-white text-center">
          <h1 className="text-4xl font-bold mb-4">
            Unlock Real Estate Ownership with Blockchain
          </h1>
          <p className="text-lg mb-6">
            Fractionalize your real estate investment and own property shares securely through blockchain technology.
          </p>

          {/* Wallet Connect Info */}
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          
          {/* CTA Buttons */}
          <div className="flex space-x-4">
            <Link href="/learn-more">
              <button className="bg-yellow-500 px-6 py-2 rounded-lg text-lg font-semibold hover:bg-yellow-600 transition-all">
                Learn More
              </button>
            </Link>
            <Link href="/get-started">
              <button className="bg-white text-blue-800 px-6 py-2 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-4">What We Offer</h2>
          <p className="text-lg text-gray-600">
            Empowering individuals to invest in real estate with fractional ownership and tokenized shares.
          </p>
        </div>
        <div className="flex justify-center gap-12 flex-wrap">
          {/* Fractional Ownership Feature */}
          <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg max-w-sm">
            <img src="/icons/real-estate.svg" alt="Property" className="w-16 h-16 mb-4"/>
            <h3 className="text-2xl font-semibold mb-2">Fractional Ownership</h3>
            <p className="text-gray-600">
              Own a fraction of high-value properties and diversify your investment portfolio.
            </p>
          </div>
          {/* Blockchain Security Feature */}
          <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg max-w-sm">
            <img src="/icons/blockchain.svg" alt="Blockchain" className="w-16 h-16 mb-4"/>
            <h3 className="text-2xl font-semibold mb-2">Blockchain Security</h3>
            <p className="text-gray-600">
              Transactions and ownership verified securely through blockchain technology, ensuring transparency.
            </p>
          </div>
          {/* Tokenized Real Estate Feature */}
          <div className="flex flex-col items-center bg-white p-8 rounded-xl shadow-lg max-w-sm">
            <img src="/icons/token.svg" alt="Tokenization" className="w-16 h-16 mb-4"/>
            <h3 className="text-2xl font-semibold mb-2">Tokenized Real Estate</h3>
            <p className="text-gray-600">
              Convert physical assets into tradable tokens, making real estate investment accessible to anyone.
            </p>
          </div>
        </div>
      </div>

      {/* Minting Dashboard CTA */}
      <div className="bg-blue-900 text-white py-12 text-center">
        <h2 className="text-3xl font-semibold mb-4">Launch Your Own Tokenized Property</h2>
        <p className="text-lg mb-6">
          Mint fractional ownership tokens for your property and open investment opportunities for others.
        </p>
        <Link href="/mint">
          <button className="bg-yellow-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-600 transition-all">
            Start Minting Tokens
          </button>
        </Link>
      </div>

    </>
  );
};

export default Home;
