"use client";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-600 to-green-500 text-white text-center px-6 py-12">
        <h1 className="text-5xl font-extrabold mb-6">Unlock Real Estate Ownership with Blockchain</h1>
        <p className="text-xl max-w-2xl mb-8">
          Fractionalize your real estate investment and own property shares securely through blockchain technology.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-x-4 mb-6">
          <span className="font-medium text-lg">Connected Address:</span>
          <Address address={connectedAddress} />
        </div>
        <div className="flex space-x-4">
          <Link href="/learn-more">
            <button className="bg-yellow-500 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-600 transition-all">Learn More</button>
          </Link>
          <Link href="/get-started">
            <button className="bg-white text-blue-800 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all">Get Started</button>
          </Link>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="py-20 bg-gray-100">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">What We Offer</h2>
          <p className="text-lg text-gray-700 max-w-xl mx-auto">
            Empowering individuals to invest in real estate with fractional ownership and tokenized shares.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8 px-6">
          {[
            { title: "Fractional Ownership", description: "Own a fraction of high-value properties and diversify your investment portfolio.", icon: "/icons/real-estate.svg" },
            { title: "Blockchain Security", description: "Transactions and ownership verified securely through blockchain technology, ensuring transparency.", icon: "/icons/blockchain.svg" },
            { title: "Tokenized Real Estate", description: "Convert physical assets into tradable tokens, making real estate investment accessible to anyone.", icon: "/icons/token.svg" },
          ].map((feature, index) => (
            <div key={index} className="flex flex-col items-center bg-white p-8 rounded-xl shadow-md max-w-sm text-center">
              <img src={feature.icon} alt={feature.title} className="w-16 h-16 mb-4" />
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Minting Dashboard CTA */}
      <div className="bg-blue-900 text-white py-16 text-center px-6">
        <h2 className="text-3xl font-semibold mb-4">Launch Your Own Tokenized Property</h2>
        <p className="text-lg max-w-xl mx-auto mb-6">
          Mint fractional ownership tokens for your property and open investment opportunities for others.
        </p>
        <Link href="/mint">
          <button className="bg-yellow-500 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-600 transition-all">Start Minting Tokens</button>
        </Link>
      </div>
    </>
  );
};

export default Home;
