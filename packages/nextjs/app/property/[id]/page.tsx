"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { 
  FaArrowLeft, 
  FaChartLine, 
  FaCoins, 
  FaExchangeAlt, 
  FaFileAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
  FaHistory
} from "react-icons/fa";

// Mock property data - in a real app, this would be fetched based on the ID
const propertyData = {
  id: 1,
  name: "Luxury Downtown Apartment",
  location: "123 Financial District, New York, NY",
  description: "A prestigious luxury apartment building located in the heart of Manhattan's Financial District. This Class A building features 24/7 concierge, state-of-the-art fitness center, rooftop garden, and high-end finishes throughout all units.",
  investment: 15000,
  currentValue: 17250,
  tokens: 150,
  tokenPrice: 115,
  apy: 5.2,
  unrealizedGain: 2250,
  gainPercentage: 15,
  dividendsPaid: 780,
  nextDividend: "May 15, 2025",
  yearBuilt: 2018,
  totalUnits: 200,
  squareFeet: 180000,
  occupancyRate: 96,
  propertyType: "Residential - Multi-family",
  propertyManager: "Urban Living Management",
  dividendSchedule: "Quarterly",
  lockupPeriod: "5 years (early redemption available with 10% penalty)",
  fullRedemption: "7 years",
  pastPerformance: [
    { period: "Q1 2024", dividendAmount: 195, tokenValue: 108 },
    { period: "Q4 2023", dividendAmount: 195, tokenValue: 105 },
    { period: "Q3 2023", dividendAmount: 187.5, tokenValue: 102 },
    { period: "Q2 2023", dividendAmount: 187.5, tokenValue: 100 },
    { period: "Q1 2023", dividendAmount: 180, tokenValue: 98 }
  ],
  documents: [
    { name: "Property Prospectus", type: "PDF", size: "3.2 MB" },
    { name: "Financial Report 2023", type: "PDF", size: "1.8 MB" },
    { name: "Property Assessment", type: "PDF", size: "2.5 MB" },
    { name: "Title Deed", type: "PDF", size: "1.2 MB" },
    { name: "Management Agreement", type: "PDF", size: "0.9 MB" }
  ],
  newsUpdates: [
    { date: "Mar 12, 2025", title: "Rental rates increased by 3% across all units", isImportant: true },
    { date: "Feb 28, 2025", title: "Building lobby renovation completed", isImportant: false },
    { date: "Jan 15, 2025", title: "Q1 dividends distributed to all token holders", isImportant: true },
    { date: "Dec 10, 2024", title: "New retail tenant signed for ground floor space", isImportant: false }
  ]
};

export default function PropertyDetails() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  
  // Simulate loading the property data based on the ID
  // In a real app, you would fetch this data from your API
  
  return (
    <>
      <Header />
      <main className="bg-base-100 min-h-screen pb-16">
        {/* Property Header */}
        <div className="bg-estate-600 pt-6 pb-12">
          <div className="container mx-auto px-4">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-estate-100 hover:text-white mb-4"
            >
              <FaArrowLeft className="mr-2" />
              Back to Dashboard
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                  {propertyData.name}
                </h1>
                <p className="text-estate-100 flex items-center mt-1">
                  <FaMapMarkerAlt className="mr-2" />
                  {propertyData.location}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Link href={`/property/${propertyData.id}/sell`} className="btn btn-outline btn-sm border-estate-300 text-estate-100 hover:bg-estate-500 hover:border-estate-400">
                  Sell Tokens
                </Link>
                <Link href={`/property/${propertyData.id}/buy`} className="btn btn-primary btn-sm">
                  Buy More
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Content */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Property Image and Overview */}
              <div className="bg-base-200 rounded-lg shadow-lg overflow-hidden">
                <div className="h-64 bg-estate-400 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-estate-100">Property Image</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Property Overview</h2>
                  <p className="text-estate-100 mb-6">
                    {propertyData.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-estate-100">Year Built</p>
                      <p className="font-semibold">{propertyData.yearBuilt}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Total Units</p>
                      <p className="font-semibold">{propertyData.totalUnits}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Square Feet</p>
                      <p className="font-semibold">{propertyData.squareFeet.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Occupancy Rate</p>
                      <p className="font-semibold">{propertyData.occupancyRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Property Type</p>
                      <p className="font-semibold">{propertyData.propertyType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Property Manager</p>
                      <p className="font-semibold">{propertyData.propertyManager}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Dividend Schedule</p>
                      <p className="font-semibold">{propertyData.dividendSchedule}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">APY</p>
                      <p className="font-semibold text-token-green">{propertyData.apy}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Past Performance */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Performance History</h2>
                
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead className="bg-base-300">
                      <tr>
                        <th className="text-estate-50">Period</th>
                        <th className="text-estate-50">Dividend</th>
                        <th className="text-estate-50">Token Value</th>
                        <th className="text-estate-50">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyData.pastPerformance.map((period, index) => {
                        const previousValue = index < propertyData.pastPerformance.length - 1 
                          ? propertyData.pastPerformance[index + 1].tokenValue 
                          : period.tokenValue;
                        const change = ((period.tokenValue - previousValue) / previousValue) * 100;
                        const isPositive = change >= 0;
                        
                        return (
                          <tr key={period.period} className="hover:bg-base-300/50">
                            <td>{period.period}</td>
                            <td>${period.dividendAmount}</td>
                            <td>${period.tokenValue}</td>
                            <td className={isPositive ? "text-token-green" : "text-token-red"}>
                              {isPositive ? "+" : ""}{change.toFixed(2)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* News & Updates */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">News & Updates</h2>
                
                <div className="space-y-4">
                  {propertyData.newsUpdates.map((news, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg ${news.isImportant ? "bg-token-red bg-opacity-10 border border-token-red border-opacity-20" : "bg-base-300"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{news.title}</h3>
                          <p className="text-sm text-estate-100 mt-1">
                            <FaCalendarAlt className="inline-block mr-1" />
                            {news.date}
                          </p>
                        </div>
                        {news.isImportant && (
                          <span className="px-2 py-1 bg-token-red bg-opacity-20 text-token-red text-xs rounded-full">
                            Important
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Documents */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Documents</h2>
                
                <div className="grid gap-2">
                  {propertyData.documents.map((doc, index) => (
                    <a 
                      key={index}
                      href="#" 
                      className="flex items-center justify-between p-3 hover:bg-base-300 rounded-lg border border-base-300"
                    >
                      <div className="flex items-center gap-3">
                        <FaFileAlt className="text-token-blue text-lg" />
                        <span className="font-medium">{doc.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-estate-100">{doc.type} • {doc.size}</span>
                        <button className="btn btn-sm btn-ghost">
                          Download
                        </button>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* Investment Summary */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Your Investment</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-estate-100">Performance</span>
                      <span className="text-sm text-token-green">+{propertyData.gainPercentage}%</span>
                    </div>
                    <div className="w-full bg-estate-500 bg-opacity-20 rounded-full h-2">
                      <div className="bg-token-green h-2 rounded-full" style={{ width: `${propertyData.gainPercentage}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-estate-100">Investment</p>
                      <p className="font-semibold">${propertyData.investment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Current Value</p>
                      <p className="font-semibold">${propertyData.currentValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Unrealized Gain</p>
                      <p className="font-semibold text-token-green">+${propertyData.unrealizedGain}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Dividends Paid</p>
                      <p className="font-semibold">${propertyData.dividendsPaid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Tokens Owned</p>
                      <p className="font-semibold">{propertyData.tokens}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Token Price</p>
                      <p className="font-semibold">${propertyData.tokenPrice}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm mb-1">Next Dividend Payment</p>
                    <p className="font-semibold flex items-center">
                      <FaCalendarAlt className="mr-2 text-estate-300" />
                      {propertyData.nextDividend}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Redemption Info */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Redemption Info</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-estate-100 mb-1">Early Redemption</p>
                    <p className="font-medium">{propertyData.lockupPeriod}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-estate-100 mb-1">Full Redemption</p>
                    <p className="font-medium">Available after {propertyData.fullRedemption}</p>
                  </div>
                  
                  <div className="bg-base-300 p-4 rounded-lg">
                    <p className="text-sm">
                      Early redemption comes with a 10% penalty on the token value. Full redemption without penalty is available after 7 years from investment date.
                    </p>
                  </div>
                  
                  <Link href={`/property/${propertyData.id}/redeem`} className="btn btn-outline border-estate-300 text-estate-100 hover:bg-estate-500 hover:border-estate-400 w-full">
                    Redeem Tokens
                  </Link>
                </div>
              </div>
              
              {/* Secondary Market */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Secondary Market</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-estate-100">Current Ask</p>
                      <p className="font-semibold">$118</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Current Bid</p>
                      <p className="font-semibold">$112</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">24h Volume</p>
                      <p className="font-semibold">325 Tokens</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Recent Trades</p>
                      <p className="font-semibold">12</p>
                    </div>
                  </div>
                  
                  <p className="text-sm">
                    You can buy or sell tokens on the secondary market without redemption penalties, subject to available liquidity.
                  </p>
                  
                  <div className="flex gap-2">
                    <Link href={`/property/${propertyData.id}/sell`} className="btn btn-outline border-estate-300 text-estate-100 hover:bg-estate-500 hover:border-estate-400 flex-1">
                      Sell
                    </Link>
                    <Link href={`/property/${propertyData.id}/buy`} className="btn btn-primary flex-1">
                      Buy
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Transaction History */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Your Transaction History</h2>
                
                <div className="space-y-3">
                  <div className="flex items-start p-3 bg-base-300 rounded-lg">
                    <div className="rounded-full bg-token-purple bg-opacity-20 p-2 mr-3">
                      <FaHistory className="text-token-purple" />
                    </div>
                    <div>
                      <p className="font-medium">Initial Investment</p>
                      <p className="text-sm text-estate-100">Nov 5, 2023</p>
                      <p className="font-semibold mt-1">$15,000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-base-300 rounded-lg">
                    <div className="rounded-full bg-token-green bg-opacity-20 p-2 mr-3">
                      <FaCoins className="text-token-green" />
                    </div>
                    <div>
                      <p className="font-medium">Dividend Payment</p>
                      <p className="text-sm text-estate-100">Jan 15, 2025</p>
                      <p className="font-semibold mt-1">$195</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-3 bg-base-300 rounded-lg">
                    <div className="rounded-full bg-token-green bg-opacity-20 p-2 mr-3">
                      <FaCoins className="text-token-green" />
                    </div>
                    <div>
                      <p className="font-medium">Dividend Payment</p>
                      <p className="text-sm text-estate-100">Oct 15, 2024</p>
                      <p className="font-semibold mt-1">$195</p>
                    </div>
                  </div>
                </div>
                
                <button className="btn btn-ghost btn-sm w-full mt-4">
                  View All Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}