"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import { 
  FaArrowLeft, 
  FaChartLine, 
  FaCoins, 
  FaUsers, 
  FaFileAlt,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt,
  FaInfoCircle,
  FaLock,
  FaMoneyBillWave
} from "react-icons/fa";

// Mock property data
const propertyData = {
  id: 3,
  name: "Residential Complex",
  location: "789 Ocean Drive, Miami, FL",
  description: "A modern residential complex featuring 120 luxury apartments across three buildings. Located just minutes from Miami Beach, this property offers resort-style amenities including multiple swimming pools, a fitness center, co-working spaces, and 24/7 security. Units feature high-end finishes, smart home technology, and private balconies.",
  highlights: [
    "Prime location near Miami Beach",
    "Resort-style amenities",
    "Smart home technology in all units",
    "High rental demand area",
    "Property managed by top-rated management company",
    "Recent renovations completed (2023)"
  ],
  investment: {
    propertyValue: 12500000,
    tokensAvailable: 250,
    tokenPrice: 250,
    minInvestment: 1000,
    projectedApy: 4.8,
    dividendSchedule: "Quarterly",
    fundingProgress: 42,
    targetClose: "May 30, 2025",
    earlyRedemption: "5 years (with 10% penalty)",
    fullRedemption: "7 years"
  },
  financial: {
    rentalIncome: 1125000,
    operatingExpenses: 450000,
    netOperatingIncome: 675000,
    capRate: 5.4,
    occupancyRate: 94,
    averageLeaseLength: "14 months"
  },
  propertyDetails: {
    yearBuilt: 2015,
    totalUnits: 120,
    squareFeet: 145000,
    propertyType: "Residential - Multi-family",
    propertyManager: "Coastal Property Management",
    lastRenovation: 2023,
    zoning: "R-4 (High-density residential)"
  },
  documents: [
    { name: "Property Prospectus", type: "PDF", size: "4.8 MB" },
    { name: "Financial Projections", type: "PDF", size: "1.5 MB" },
    { name: "Market Analysis", type: "PDF", size: "2.3 MB" },
    { name: "Property Photos", type: "ZIP", size: "8.7 MB" },
    { name: "Management Agreement", type: "PDF", size: "0.9 MB" }
  ],
  marketData: {
    averageRent: 2100,
    rentalGrowthYoY: 3.2,
    marketVacancy: 4.5,
    comparablesSold: [
      { name: "Sunset Towers", price: 10800000, units: 105, pricePerUnit: 102857 },
      { name: "Bayside Residences", price: 14200000, units: 135, pricePerUnit: 105185 }
    ]
  },
  similarProperties: [
    { id: 4, name: "Luxury Waterfront Condo", location: "San Francisco, CA", pricePerToken: 650, availableTokens: 75, apy: 4.2 },
    { id: 5, name: "Mixed-Use Development", location: "Denver, CO", pricePerToken: 325, availableTokens: 180, apy: 5.8 }
  ]
};

export default function PropertyListing() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [investmentAmount, setInvestmentAmount] = useState(propertyData.investment.minInvestment);
  
  // Calculate number of tokens based on investment amount
  const numberOfTokens = Math.floor(investmentAmount / propertyData.investment.tokenPrice);
  const estimatedDividends = (investmentAmount * propertyData.investment.projectedApy) / 100;
  
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
              Back to Marketplace
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
                <button className="btn btn-outline btn-sm border-estate-300 text-estate-100 hover:bg-estate-500 hover:border-estate-400">
                  Download Prospectus
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Property Content */}
        <div className="container mx-auto px-4 -mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Tabs Navigation */}
              <div className="bg-base-200 rounded-t-lg shadow-lg overflow-hidden">
                <div className="flex overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
                      activeTab === "overview" 
                        ? "border-estate-400 text-estate-200" 
                        : "border-transparent text-estate-100 hover:text-estate-50"
                    }`}
                  >
                    <FaBuilding />
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("financials")}
                    className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
                      activeTab === "financials" 
                        ? "border-estate-400 text-estate-200" 
                        : "border-transparent text-estate-100 hover:text-estate-50"
                    }`}
                  >
                    <FaChartLine />
                    Financials
                  </button>
                  <button 
                    onClick={() => setActiveTab("documents")}
                    className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
                      activeTab === "documents" 
                        ? "border-estate-400 text-estate-200" 
                        : "border-transparent text-estate-100 hover:text-estate-50"
                    }`}
                  >
                    <FaFileAlt />
                    Documents
                  </button>
                  <button 
                    onClick={() => setActiveTab("market")}
                    className={`px-4 py-3 flex items-center gap-2 border-b-2 ${
                      activeTab === "market" 
                        ? "border-estate-400 text-estate-200" 
                        : "border-transparent text-estate-100 hover:text-estate-50"
                    }`}
                  >
                    <FaUsers />
                    Market Data
                  </button>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="bg-base-200 rounded-lg shadow-lg overflow-hidden">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div>
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
                      
                      <h3 className="font-semibold mb-3">Highlights</h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                        {propertyData.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start">
                            <div className="text-token-green mr-2 mt-1">•</div>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <h3 className="font-semibold mb-3">Property Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-estate-100">Year Built</p>
                          <p className="font-semibold">{propertyData.propertyDetails.yearBuilt}</p>
                        </div>
                        <div>
                          <p className="text-xs text-estate-100">Total Units</p>
                          <p className="font-semibold">{propertyData.propertyDetails.totalUnits}</p>
                        </div>
                        <div>
                          <p className="text-xs text-estate-100">Square Feet</p>
                          <p className="font-semibold">{propertyData.propertyDetails.squareFeet.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-estate-100">Property Type</p>
                          <p className="font-semibold">{propertyData.propertyDetails.propertyType}</p>
                        </div>
                        <div>
                          <p className="text-xs text-estate-100">Property Manager</p>
                          <p className="font-semibold">{propertyData.propertyDetails.propertyManager}</p>
                        </div>
                        <div>
                          <p className="text-xs text-estate-100">Last Renovation</p>
                          <p className="font-semibold">{propertyData.propertyDetails.lastRenovation}</p>
                        </div>
                        <div>
                          <p className="text-xs text-estate-100">Zoning</p>
                          <p className="font-semibold">{propertyData.propertyDetails.zoning}</p>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold mb-3">Location</h3>
                      <div className="bg-estate-400 h-48 mb-4 rounded-lg flex items-center justify-center">
                        <span className="text-estate-100">Location Map</span>
                      </div>
                      <p className="text-estate-100">
                        Located in a prime area of Miami, just minutes from Miami Beach. The neighborhood features high walkability scores, excellent access to public transportation, and proximity to shopping, dining, and entertainment options.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Financials Tab */}
                {activeTab === "financials" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Financial Information</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-3">Income Statement</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-base-300">
                              <span>Annual Rental Income</span>
                              <span className="font-semibold">${propertyData.financial.rentalIncome.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-base-300">
                              <span>Operating Expenses</span>
                              <span className="font-semibold">${propertyData.financial.operatingExpenses.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-base-300">
                              <span className="font-semibold">Net Operating Income</span>
                              <span className="font-semibold">${propertyData.financial.netOperatingIncome.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold mb-3">Key Financial Metrics</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-estate-100">Cap Rate</p>
                              <p className="font-semibold">{propertyData.financial.capRate}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-estate-100">Current Occupancy</p>
                              <p className="font-semibold">{propertyData.financial.occupancyRate}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-estate-100">Avg. Lease Length</p>
                              <p className="font-semibold">{propertyData.financial.averageLeaseLength}</p>
                            </div>
                            <div>
                              <p className="text-xs text-estate-100">Projected APY</p>
                              <p className="font-semibold text-token-green">{propertyData.investment.projectedApy}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-3">Investment Breakdown</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-base-300">
                              <span>Property Value</span>
                              <span className="font-semibold">${propertyData.investment.propertyValue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-base-300">
                              <span>Total Tokens</span>
                              <span className="font-semibold">50,000</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-base-300">
                              <span>Token Price</span>
                              <span className="font-semibold">${propertyData.investment.tokenPrice}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-base-300">
                              <span>Minimum Investment</span>
                              <span className="font-semibold">${propertyData.investment.minInvestment}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-base-300 p-4 rounded-lg">
                          <h3 className="font-semibold mb-2">Dividend Distribution</h3>
                          <p className="text-sm mb-2">
                            Dividends are distributed {propertyData.investment.dividendSchedule.toLowerCase()} to all token holders based on their ownership percentage.
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <FaInfoCircle className="text-estate-300" />
                            <span>Annual rate: {propertyData.investment.projectedApy}% (projected)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-estate-500/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Investment Example</h3>
                      <p className="text-sm mb-4">
                        A $10,000 investment would purchase 40 tokens (at $250 per token) and generate approximately $480 in annual dividends (4.8% APY).
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-estate-600/20 p-3 rounded-lg text-center">
                          <p className="text-sm text-estate-100">Investment</p>
                          <p className="font-semibold">$10,000</p>
                        </div>
                        <div className="bg-estate-600/20 p-3 rounded-lg text-center">
                          <p className="text-sm text-estate-100">Tokens</p>
                          <p className="font-semibold">40</p>
                        </div>
                        <div className="bg-estate-600/20 p-3 rounded-lg text-center">
                          <p className="text-sm text-estate-100">Annual Dividends</p>
                          <p className="font-semibold">$480</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Documents Tab */}
                {activeTab === "documents" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Property Documents</h2>
                    
                    <div className="grid gap-3">
                      {propertyData.documents.map((doc, index) => (
                        <a 
                          key={index}
                          href="#" 
                          className="flex items-center justify-between p-4 hover:bg-base-300 rounded-lg border border-base-300"
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
                    
                    <div className="mt-8 bg-base-300 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Legal Documentation</h3>
                      <p className="text-sm">
                        These documents contain important legal and financial information about this investment opportunity. We recommend that you review them carefully before making an investment decision. For questions, please contact our investor relations team.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Market Data Tab */}
                {activeTab === "market" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Market Analysis</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="font-semibold mb-3">Local Market Data</h3>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <p className="text-xs text-estate-100">Average Rent</p>
                            <p className="font-semibold">${propertyData.marketData.averageRent}/month</p>
                          </div>
                          <div>
                            <p className="text-xs text-estate-100">Rental Growth YoY</p>
                            <p className="font-semibold">{propertyData.marketData.rentalGrowthYoY}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-estate-100">Market Vacancy</p>
                            <p className="font-semibold">{propertyData.marketData.marketVacancy}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-estate-100">Property Vacancy</p>
                            <p className="font-semibold">{100 - propertyData.financial.occupancyRate}%</p>
                          </div>
                        </div>
                        
                        <div className="bg-estate-400 h-48 rounded-lg flex items-center justify-center mb-4">
                          <span className="text-estate-100">Market Trends Chart</span>
                        </div>
                        
                        <p className="text-sm text-estate-100">
                          The Miami residential market has seen consistent growth over the past 5 years, with average rents increasing 3-4% annually. The subject property is positioned to benefit from continued strong demand in the area.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-3">Comparable Properties</h3>
                        
                        <div className="overflow-x-auto">
                          <table className="table w-full">
                            <thead className="bg-base-300">
                              <tr>
                                <th className="text-estate-50">Property</th>
                                <th className="text-estate-50">Sale Price</th>
                                <th className="text-estate-50">Units</th>
                                <th className="text-estate-50">Price/Unit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {propertyData.marketData.comparablesSold.map((comp, index) => (
                                <tr key={index} className="hover:bg-base-300/50">
                                  <td>{comp.name}</td>
                                  <td>${comp.price.toLocaleString()}</td>
                                  <td>{comp.units}</td>
                                  <td>${comp.pricePerUnit.toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="bg-estate-500/10 font-semibold">
                                <td>{propertyData.name}</td>
                                <td>${propertyData.investment.propertyValue.toLocaleString()}</td>
                                <td>{propertyData.propertyDetails.totalUnits}</td>
                                <td>${Math.round(propertyData.investment.propertyValue / propertyData.propertyDetails.totalUnits).toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="font-semibold mb-3">Neighborhood Trends</h3>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start">
                              <div className="text-token-green mr-2 mt-1">•</div>
                              <span>Population growth: +2.1% annually</span>
                            </li>
                            <li className="flex items-start">
                              <div className="text-token-green mr-2 mt-1">•</div>
                              <span>Median household income: $87,500</span>
                            </li>
                            <li className="flex items-start">
                              <div className="text-token-green mr-2 mt-1">•</div>
                              <span>Employment growth: +3.4% annually</span>
                            </li>
                            <li className="flex items-start">
                              <div className="text-token-green mr-2 mt-1">•</div>
                              <span>New construction limited by zoning restrictions</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-base-300 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Market Outlook</h3>
                      <p className="text-sm">
                        The Miami residential market is projected to remain strong for the foreseeable future, driven by population growth, limited new supply, and the area's desirability. The subject property is well-positioned to capitalize on these trends due to its prime location and high-quality amenities.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Similar Properties */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Similar Properties</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {propertyData.similarProperties.map(property => (
                    <div key={property.id} className="bg-base-300 rounded-lg overflow-hidden">
                      <div className="relative h-40 bg-estate-400">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-estate-100">Property Image</span>
                        </div>
                        <div className="absolute top-4 right-4 px-2 py-1 bg-token-purple bg-opacity-90 text-white text-xs rounded-full">
                          {property.apy}% APY
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
                        <p className="text-estate-100 text-sm mb-4">{property.location}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-estate-100">Price per Token</p>
                            <p className="font-semibold">${property.pricePerToken}</p>
                          </div>
                          <div>
                            <p className="text-xs text-estate-100">Available Tokens</p>
                            <p className="font-semibold">{property.availableTokens}</p>
                          </div>
                        </div>
                        
                        <Link href={`/marketplace/${property.id}`} className="btn btn-primary btn-sm w-full">
                          View Property
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Investment Sidebar */}
            <div className="space-y-8">
              {/* Investment Calculator */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Invest in This Property</h2>
                
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-estate-100">Funding Progress</span>
                    <span className="text-sm text-estate-100">{propertyData.investment.fundingProgress}%</span>
                  </div>
                  <div className="w-full bg-estate-500 bg-opacity-20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-token-purple to-token-red h-2 rounded-full" style={{ width: `${propertyData.investment.fundingProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-estate-100">
                    <span>0%</span>
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      Closes {propertyData.investment.targetClose}
                    </span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Investment Amount</label>
                    <div className="flex">
                      <span className="bg-estate-500 flex items-center justify-center px-3 rounded-l-lg">$</span>
                      <input
                        type="number"
                        className="input input-bordered rounded-l-none w-full"
                        value={investmentAmount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= propertyData.investment.minInvestment) {
                            setInvestmentAmount(value);
                          }
                        }}
                        min={propertyData.investment.minInvestment}
                        step={propertyData.investment.tokenPrice}
                      />
                    </div>
                    <p className="text-xs text-estate-100 mt-1">
                      Minimum: ${propertyData.investment.minInvestment.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-estate-100">Token Price</p>
                      <p className="font-semibold">${propertyData.investment.tokenPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Tokens to Receive</p>
                      <p className="font-semibold">{numberOfTokens}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Projected APY</p>
                      <p className="font-semibold text-token-green">{propertyData.investment.projectedApy}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Est. Annual Dividends</p>
                      <p className="font-semibold">${estimatedDividends.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <button className="btn btn-primary w-full">
                  Invest Now
                </button>
                
                <div className="divider text-xs text-estate-100">INVESTMENT TERMS</div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <FaCoins className="text-estate-300 mt-1 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Dividends</p>
                      <p className="text-xs text-estate-100">{propertyData.investment.dividendSchedule} distributions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaLock className="text-estate-300 mt-1 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Early Redemption</p>
                      <p className="text-xs text-estate-100">{propertyData.investment.earlyRedemption}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaMoneyBillWave className="text-estate-300 mt-1 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Full Redemption</p>
                      <p className="text-xs text-estate-100">Available after {propertyData.investment.fullRedemption}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaExchangeAlt className="text-estate-300 mt-1 mr-2" />
                    <div>
                      <p className="text-sm font-medium">Secondary Market</p>
                      <p className="text-xs text-estate-100">Trade tokens anytime (subject to liquidity)</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* FAQ Section */}
              <div className="bg-base-200 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div className="collapse collapse-arrow bg-base-300">
                    <input type="checkbox" /> 
                    <div className="collapse-title font-medium">
                      How does the investment process work?
                    </div>
                    <div className="collapse-content text-sm"> 
                      <p>When you invest, you're purchasing security tokens representing fractional ownership in this property. Each token entitles you to a proportional share of rental income (paid as dividends) and property appreciation.</p>
                    </div>
                  </div>
                  
                  <div className="collapse collapse-arrow bg-base-300">
                    <input type="checkbox" /> 
                    <div className="collapse-title font-medium">
                      How are dividends calculated and distributed?
                    </div>
                    <div className="collapse-content text-sm"> 
                      <p>Dividends are calculated based on the property's net rental income after expenses. They are distributed quarterly to all token holders proportional to their ownership percentage. Payments are made directly to your account.</p>
                    </div>
                  </div>
                  
                  <div className="collapse collapse-arrow bg-base-300">
                    <input type="checkbox" /> 
                    <div className="collapse-title font-medium">
                      Can I sell my investment before the redemption period?
                    </div>
                    <div className="collapse-content text-sm"> 
                      <p>Yes, you can sell your tokens on our secondary marketplace at any time. However, liquidity may vary depending on buyer demand. Alternatively, you can redeem tokens directly after 5 years (with a 10% penalty) or after 7 years (with no penalty).</p>
                    </div>
                  </div>
                  
                  <div className="collapse collapse-arrow bg-base-300">
                    <input type="checkbox" /> 
                    <div className="collapse-title font-medium">
                      Are there any fees for investing?
                    </div>
                    <div className="collapse-content text-sm"> 
                      <p>There are no upfront fees for investing. The property management fee (5% of rental income) and platform fee (1% annually) are deducted before dividend distribution. Secondary market transactions incur a 0.5% fee.</p>
                    </div>
                  </div>
                  
                  <div className="collapse collapse-arrow bg-base-300">
                    <input type="checkbox" /> 
                    <div className="collapse-title font-medium">
                      What happens if the property is sold?
                    </div>
                    <div className="collapse-content text-sm"> 
                      <p>If the property is sold, token holders will receive their proportional share of the sale proceeds. Any sale requires approval from the majority of token holders through a voting process.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}