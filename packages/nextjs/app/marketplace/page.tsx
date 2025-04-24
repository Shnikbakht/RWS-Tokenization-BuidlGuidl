"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown,
  FaMapMarkerAlt,
  FaBuilding,
  FaCity
} from "react-icons/fa";

// Mock property data for the marketplace
const mockProperties = [
  {
    id: 1,
    name: "Luxury Downtown Apartment",
    location: "New York, NY",
    description: "A prestigious luxury apartment building located in the heart of Manhattan's Financial District.",
    pricePerToken: 115,
    availableTokens: 3500,
    minInvestment: 1000,
    apy: 5.2,
    propertyType: "Residential",
    fundingProgress: 65,
    image: "/images/property1.jpg"
  },
  {
    id: 2,
    name: "Commercial Office Building",
    location: "Austin, TX",
    description: "Prime office space in Austin's growing tech corridor with long-term corporate tenants.",
    pricePerToken: 575,
    availableTokens: 1200,
    minInvestment: 2000,
    apy: 6.5,
    propertyType: "Commercial",
    fundingProgress: 89,
    image: "/images/property2.jpg"
  },
  {
    id: 3,
    name: "Residential Complex",
    location: "Miami, FL",
    description: "A modern residential complex featuring 120 luxury apartments across three buildings.",
    pricePerToken: 250,
    availableTokens: 2800,
    minInvestment: 1000,
    apy: 4.8,
    propertyType: "Residential",
    fundingProgress: 42,
    image: "/images/property3.jpg"
  },
  {
    id: 4,
    name: "Luxury Waterfront Condo",
    location: "San Francisco, CA",
    description: "Exclusive waterfront condominiums with panoramic views of San Francisco Bay.",
    pricePerToken: 650,
    availableTokens: 1500,
    minInvestment: 3000,
    apy: 4.2,
    propertyType: "Residential",
    fundingProgress: 78,
    image: "/images/property4.jpg"
  },
  {
    id: 5,
    name: "Mixed-Use Development",
    location: "Denver, CO",
    description: "Modern mixed-use property with retail on ground floor and residential units above.",
    pricePerToken: 325,
    availableTokens: 2100,
    minInvestment: 1500,
    apy: 5.8,
    propertyType: "Mixed-Use",
    fundingProgress: 51,
    image: "/images/property5.jpg"
  },
  {
    id: 6,
    name: "Retail Plaza",
    location: "Chicago, IL",
    description: "Well-established retail plaza in Chicago's northern suburbs with national tenants.",
    pricePerToken: 415,
    availableTokens: 1800,
    minInvestment: 2000,
    apy: 5.5,
    propertyType: "Retail",
    fundingProgress: 73,
    image: "/images/property6.jpg"
  },
  {
    id: 7,
    name: "Industrial Warehouse",
    location: "Dallas, TX",
    description: "Modern industrial facility in Dallas's logistics hub with excellent transportation access.",
    pricePerToken: 180,
    availableTokens: 5000,
    minInvestment: 900,
    apy: 5.1,
    propertyType: "Industrial",
    fundingProgress: 38,
    image: "/images/property7.jpg"
  },
  {
    id: 8,
    name: "Student Housing Complex",
    location: "Boston, MA",
    description: "Premium student housing near major universities with high occupancy rates.",
    pricePerToken: 210,
    availableTokens: 3200,
    minInvestment: 1000,
    apy: 6.2,
    propertyType: "Residential",
    fundingProgress: 82,
    image: "/images/property8.jpg"
  }
];

// Define filter options
const propertyTypes = ["All Types", "Residential", "Commercial", "Retail", "Industrial", "Mixed-Use"];
const locations = ["All Locations", "New York, NY", "Austin, TX", "Miami, FL", "San Francisco, CA", "Denver, CO", "Chicago, IL", "Dallas, TX", "Boston, MA"];
const minInvestmentOptions = ["Any", "$500+", "$1,000+", "$2,000+", "$5,000+"];
const apyOptions = ["Any", "4%+", "5%+", "6%+"];
const sortOptions = ["Newest", "Highest APY", "Lowest Price", "Highest Price", "Funding Progress"];

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedMinInvestment, setSelectedMinInvestment] = useState("Any");
  const [selectedApy, setSelectedApy] = useState("Any");
  const [sortBy, setSortBy] = useState("Newest");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter properties based on selected criteria
  const filteredProperties = mockProperties.filter(property => {
    // Search term filter
    if (searchTerm && !property.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !property.location.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !property.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Property type filter
    if (selectedType !== "All Types" && property.propertyType !== selectedType) {
      return false;
    }
    
    // Location filter
    if (selectedLocation !== "All Locations" && property.location !== selectedLocation) {
      return false;
    }
    
    // Min investment filter
    if (selectedMinInvestment !== "Any") {
      const minAmount = parseInt(selectedMinInvestment.replace(/\D/g, ""));
      if (property.minInvestment < minAmount) {
        return false;
      }
    }
    
    // APY filter
    if (selectedApy !== "Any") {
      const minApy = parseInt(selectedApy.replace(/\D/g, ""));
      if (property.apy < minApy) {
        return false;
      }
    }
    
    return true;
  });
  
  // Sort properties based on selected sort option
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case "Highest APY":
        return b.apy - a.apy;
      case "Lowest Price":
        return a.pricePerToken - b.pricePerToken;
      case "Highest Price":
        return b.pricePerToken - a.pricePerToken;
      case "Funding Progress":
        return b.fundingProgress - a.fundingProgress;
      default: // "Newest"
        return b.id - a.id;
    }
  });
  
  return (
    <>
      <Header />
      <main className="bg-base-100 min-h-screen">
        {/* Marketplace Header */}
        <div className="bg-estate-600 py-10">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white text-center mb-2">
              Property Marketplace
            </h1>
            <p className="text-estate-100 text-center text-lg mb-8">
              Browse tokenized real estate properties and start investing with as little as $500
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="flex">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className="input input-lg rounded-r-none w-full pl-12"
                    placeholder="Search properties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-estate-300" />
                </div>
                <button 
                  className="btn btn-lg rounded-l-none bg-estate-400 hover:bg-estate-500 border-none"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter className="mr-2" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filter Section */}
        <div className={`bg-base-200 border-y border-base-300 transition-all duration-300 ${
          showFilters ? "py-6 h-auto" : "h-0 py-0 overflow-hidden"
        }`}>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="label font-medium">Property Type</label>
                <select 
                  className="select select-bordered w-full"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {propertyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label font-medium">Location</label>
                <select 
                  className="select select-bordered w-full"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label font-medium">Min Investment</label>
                <select 
                  className="select select-bordered w-full"
                  value={selectedMinInvestment}
                  onChange={(e) => setSelectedMinInvestment(e.target.value)}
                >
                  {minInvestmentOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label font-medium">Min APY</label>
                <select 
                  className="select select-bordered w-full"
                  value={selectedApy}
                  onChange={(e) => setSelectedApy(e.target.value)}
                >
                  {apyOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label font-medium">Sort By</label>
                <select 
                  className="select select-bordered w-full"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button 
                className="btn btn-sm btn-ghost mr-2"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("All Types");
                  setSelectedLocation("All Locations");
                  setSelectedMinInvestment("Any");
                  setSelectedApy("Any");
                  setSortBy("Newest");
                }}
              >
                Reset Filters
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="container mx-auto px-4 py-8">
          {/* Results Stats */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {sortedProperties.length} Properties Available
            </h2>
            <div className="flex items-center mt-2 md:mt-0">
              <FaSortAmountDown className="mr-2 text-estate-300" />
              <select 
                className="select select-bordered select-sm bg-base-200"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.map(property => (
              <Link 
                key={property.id} 
                href={`/marketplace/${property.id}`}
                className="bg-base-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 bg-estate-400">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-estate-100">Property Image</span>
                  </div>
                  <div className="absolute top-4 right-4 px-2 py-1 bg-token-purple bg-opacity-90 text-white text-xs rounded-full">
                    {property.apy}% APY
                  </div>
                  <div className="absolute bottom-4 left-4 flex items-center px-2 py-1 bg-base-100 bg-opacity-80 text-xs rounded-full">
                    {property.propertyType === "Residential" && <FaBuilding className="mr-1" />}
                    {property.propertyType === "Commercial" && <FaCity className="mr-1" />}
                    {property.propertyType !== "Residential" && property.propertyType !== "Commercial" && <FaBuilding className="mr-1" />}
                    {property.propertyType}
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-semibold text-lg mb-1">{property.name}</h3>
                  <p className="text-estate-100 text-sm flex items-center mb-3">
                    <FaMapMarkerAlt className="mr-1 text-estate-300" />
                    {property.location}
                  </p>
                  
                  <div className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-estate-100">Funding Progress</span>
                      <span className="text-sm text-estate-100">{property.fundingProgress}%</span>
                    </div>
                    <div className="w-full bg-estate-500 bg-opacity-20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-token-purple to-token-red h-2 rounded-full" style={{ width: `${property.fundingProgress}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-estate-100">Price per Token</p>
                      <p className="font-semibold">${property.pricePerToken}</p>
                    </div>
                    <div>
                      <p className="text-xs text-estate-100">Min Investment</p>
                      <p className="font-semibold">${property.minInvestment}</p>
                    </div>
                  </div>
                  
                  <button className="btn btn-primary btn-sm w-full">
                    View Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Empty State */}
          {sortedProperties.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-estate-500/10 inline-flex rounded-full p-4 mb-4">
                <FaSearch className="text-estate-300 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Properties Found</h3>
              <p className="text-estate-100 max-w-md mx-auto mb-6">
                No properties match your current search criteria. Try adjusting your filters or search terms.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("All Types");
                  setSelectedLocation("All Locations");
                  setSelectedMinInvestment("Any");
                  setSelectedApy("Any");
                  setSortBy("Newest");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Secondary Market Section */}
        <div className="bg-base-200 py-12 border-t border-base-300">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Secondary Market</h2>
                <p className="text-estate-100">
                  Buy tokens from other investors on our secondary marketplace
                </p>
              </div>
              <Link href="/marketplace/secondary" className="btn btn-primary mt-4 md:mt-0">
                View All Listings
              </Link>
            </div>
            
            <div className="bg-base-100 rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-base-300">
                    <tr>
                      <th className="text-estate-50">Property</th>
                      <th className="text-estate-50">Location</th>
                      <th className="text-estate-50">Seller</th>
                      <th className="text-estate-50">Tokens</th>
                      <th className="text-estate-50">Price per Token</th>
                      <th className="text-estate-50">Total Price</th>
                      <th className="text-estate-50">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-base-300/50">
                      <td>Luxury Downtown Apartment</td>
                      <td>New York, NY</td>
                      <td>0x7ab...f3e5</td>
                      <td>25</td>
                      <td>$120</td>
                      <td>$3,000</td>
                      <td>
                        <button className="btn btn-primary btn-xs">Purchase</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-base-300/50">
                      <td>Commercial Office Building</td>
                      <td>Austin, TX</td>
                      <td>0x3df...8a7c</td>
                      <td>10</td>
                      <td>$590</td>
                      <td>$5,900</td>
                      <td>
                        <button className="btn btn-primary btn-xs">Purchase</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-base-300/50">
                      <td>Residential Complex</td>
                      <td>Miami, FL</td>
                      <td>0x92a...6b4d</td>
                      <td>50</td>
                      <td>$260</td>
                      <td>$13,000</td>
                      <td>
                        <button className="btn btn-primary btn-xs">Purchase</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-base-300/50">
                      <td>Retail Plaza</td>
                      <td>Chicago, IL</td>
                      <td>0x51f...9c2d</td>
                      <td>30</td>
                      <td>$425</td>
                      <td>$12,750</td>
                      <td>
                        <button className="btn btn-primary btn-xs">Purchase</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* How It Works Section */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">How Property Tokenization Works</h2>
              <p className="text-lg text-estate-100 max-w-3xl mx-auto">
                Our platform makes real estate investment accessible, liquid, and transparent through blockchain technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-estate-500/20 w-16 h-16 rounded-full flex items-center justify-center text-token-blue text-2xl mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold mb-3">Choose a Property</h3>
                <p className="text-estate-100">
                  Browse our marketplace of vetted real estate properties and select one that meets your investment criteria.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-estate-500/20 w-16 h-16 rounded-full flex items-center justify-center text-token-purple text-2xl mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold mb-3">Purchase Tokens</h3>
                <p className="text-estate-100">
                  Invest as little as $500 to buy security tokens representing fractional ownership in the property.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-estate-500/20 w-16 h-16 rounded-full flex items-center justify-center text-token-red text-2xl mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-3">Earn Passive Income</h3>
                <p className="text-estate-100">
                  Receive regular dividend payments from rental income and benefit from property value appreciation.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-estate-600 to-estate-700 py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grad1)" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9c27b0" />
                  <stop offset="100%" stopColor="#f44336" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6 text-white">
                Start Your Real Estate Investment Journey Today
              </h2>
              <p className="text-xl text-estate-100 mb-8">
                Join thousands of investors already benefiting from tokenized real estate
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="btn btn-primary btn-lg rounded-lg">
                  Get Started
                </Link>
                <Link href="/contact" className="btn btn-outline btn-lg rounded-lg border-estate-300 text-estate-100 hover:bg-estate-500 hover:border-estate-400">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}