"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import Image from "next/image";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle navbar transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Navigation Bar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md text-gray-800' : 'bg-transparent text-white'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="text-xl font-bold mr-10">PropToken</div>
              <div className="hidden md:flex space-x-8">
                <Link href="/properties">
                  <span className="hover:text-indigo-400 transition-colors">Properties</span>
                </Link>
                <Link href="/marketplace">
                  <span className="hover:text-indigo-400 transition-colors">Marketplace</span>
                </Link>
                <Link href="/how-it-works">
                  <span className="hover:text-indigo-400 transition-colors">How It Works</span>
                </Link>
                <Link href="/about">
                  <span className="hover:text-indigo-400 transition-colors">About Us</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {connectedAddress ? (
                <div className="flex items-center bg-opacity-20 bg-white backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Address address={connectedAddress} />
                </div>
              ) : (
                <button className="px-5 py-2 border border-indigo-500 bg-transparent hover:bg-indigo-500 hover:text-white transition-all duration-300 rounded-md">
                  Connect Wallet
                </button>
              )}
              <Link href="/dashboard">
                <button className={`px-5 py-2 rounded-md ${isScrolled ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-800'} hover:bg-indigo-700 hover:text-white transition-all duration-300`}>
                  Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-blue-700 opacity-90 z-10"></div>
          <div className="absolute inset-0 bg-[url('/images/cityscape.jpg')] bg-cover bg-center z-0"></div>
        </div>
        
        {/* Hero content */}
        <div className="container mx-auto px-6 relative z-20 text-white text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Real Estate Investing <br />
            <span className="text-indigo-300">Reimagined</span> Through Blockchain
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-10 text-gray-200">
            Access premium properties with fractional ownership, transparent transactions, and global liquidity—all secured by blockchain technology.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <Link href="/properties">
              <button className="w-48 bg-indigo-500 px-6 py-3 rounded-lg text-lg font-medium hover:bg-indigo-600 transition-all shadow-lg">
                View Properties
              </button>
            </Link>
            <Link href="/learn-more">
              <button className="w-48 bg-transparent border-2 border-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-indigo-800 transition-all">
                Learn More
              </button>
            </Link>
          </div>
          
          {/* Stats counter */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 max-w-4xl mx-auto">
            {[
              { value: "$24M+", label: "Property Value Tokenized" },
              { value: "5,200+", label: "Active Investors" },
              { value: "32", label: "Premium Properties" },
              { value: "12%", label: "Avg. Annual Returns" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h6 className="text-indigo-600 font-medium mb-2 uppercase tracking-wider">Process</h6>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Property Tokenization Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've simplified real estate investing through blockchain technology to make it accessible for everyone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
            {[
              {
                title: "Property Selection & Valuation",
                description: "Our experts carefully select and evaluate premium real estate assets using a proprietary due diligence process.",
                icon: "🏢",
                number: "01"
              },
              {
                title: "Tokenization & Smart Contracts",
                description: "Properties are divided into digital tokens backed by smart contracts that represent fractional ownership.",
                icon: "🔗",
                number: "02"
              },
              {
                title: "Invest & Manage",
                description: "Purchase tokens representing property shares and manage your portfolio through our intuitive dashboard.",
                icon: "📊",
                number: "03"
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className="absolute -top-6 left-0 text-8xl font-bold text-gray-100 group-hover:text-indigo-50 transition-colors duration-300 z-0">
                  {step.number}
                </div>
                <div className="relative z-10">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link href="/how-it-works">
              <button className="px-8 py-3 bg-gray-100 text-indigo-600 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Learn More About Our Process
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Properties */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h6 className="text-indigo-600 font-medium mb-2 uppercase tracking-wider">Opportunities</h6>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Properties</h2>
            </div>
            <Link href="/properties">
              <button className="px-5 py-2 border border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-500 hover:text-white transition-all duration-300">
                View All Properties
              </button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Skyline Tower",
                location: "New York, NY",
                price: "$250",
                total: "$2.5M",
                ownership: "72%",
                yield: "8.2%",
                image: "/images/property1.jpg", 
                status: "Active"
              },
              {
                name: "Oceanfront Residences",
                location: "Miami, FL",
                price: "$175",
                total: "$4.2M",
                ownership: "45%",
                yield: "10.5%",
                image: "/images/property2.jpg",
                status: "New"
              },
              {
                name: "Tech Hub Campus",
                location: "Austin, TX",
                price: "$320",
                total: "$6.8M",
                ownership: "88%",
                yield: "7.5%",
                image: "/images/property3.jpg",
                status: "Last Units"
              }
            ].map((property, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-60 bg-gray-300">
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      property.status === "Active" ? "bg-green-500" : 
                      property.status === "New" ? "bg-blue-500" : 
                      "bg-orange-500"
                    } text-white`}>
                      {property.status}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gray-800 opacity-10"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-1">{property.name}</h3>
                  <p className="text-gray-600 mb-4">{property.location}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-gray-500 text-sm">Token Price</p>
                      <p className="font-semibold">{property.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Property Value</p>
                      <p className="font-semibold">{property.total}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Tokenized</p>
                      <p className="font-semibold">{property.ownership}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Est. Yield</p>
                      <p className="font-semibold">{property.yield}</p>
                    </div>
                  </div>
                  
                  <Link href={`/property/${index + 1}`}>
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-indigo-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h6 className="text-indigo-300 font-medium mb-2 uppercase tracking-wider">Advantages</h6>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose PropToken</h2>
            <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
              We're revolutionizing real estate investment with blockchain technology and a user-centric approach.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Fractional Ownership",
                description: "Invest in premium properties with as little as $100, enabling portfolio diversification.",
                icon: "📊"
              },
              {
                title: "Blockchain Security",
                description: "Ownership records and transactions secured by immutable blockchain technology.",
                icon: "🔒"
              },
              {
                title: "Liquidity",
                description: "Trade your property tokens on our marketplace without traditional real estate friction.",
                icon: "💱"
              },
              {
                title: "Transparent Returns",
                description: "Automated distribution of rental income and property appreciation through smart contracts.",
                icon: "💰"
              }
            ].map((benefit, index) => (
              <div key={index} className="p-6 bg-indigo-800 rounded-xl hover:bg-indigo-700 transition-colors duration-300">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-indigo-200">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h6 className="text-indigo-600 font-medium mb-2 uppercase tracking-wider">Testimonials</h6>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Investors Say</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied investors who have transformed their real estate investment experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "PropToken has transformed how I invest in real estate. I now own shares in three premium properties that would have been unattainable for me otherwise.",
                author: "Michael Chen",
                role: "Tech Entrepreneur",
                image: "/images/testimonial1.jpg"
              },
              {
                quote: "The transparency and ease of use are remarkable. I can monitor my property investments in real-time and trade tokens whenever I need liquidity.",
                author: "Sarah Johnson",
                role: "Financial Advisor",
                image: "/images/testimonial2.jpg"
              },
              {
                quote: "As a first-time investor, I was hesitant about real estate. PropToken made it simple and accessible with excellent customer support throughout.",
                author: "David Rodriguez",
                role: "Marketing Director",
                image: "/images/testimonial3.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl relative">
                <div className="text-indigo-500 text-5xl absolute -top-4 left-6">"</div>
                <p className="text-gray-700 mb-6 pt-4 relative z-10">
                  {testimonial.quote}
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 bg-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-indigo-900 opacity-90 z-10"></div>
          <div className="absolute inset-0 bg-[url('/images/city-night.jpg')] bg-cover bg-center z-0"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Investment Strategy?</h2>
          <p className="text-xl text-indigo-200 max-w-2xl mx-auto mb-10">
            Join thousands of investors unlocking the benefits of tokenized real estate today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/register">
              <button className="w-48 bg-white text-indigo-900 px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all shadow-lg">
                Create Account
              </button>
            </Link>
            <Link href="/demo">
              <button className="w-48 bg-transparent border-2 border-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-white hover:text-indigo-900 transition-all">
                Request Demo
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">PropToken</h3>
              <p className="mb-4">
                Revolutionizing real estate investment through blockchain technology and fractional ownership.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white text-md font-medium mb-4">Properties</h4>
              <ul className="space-y-2">
                <li><Link href="/residential"><span className="hover:text-white transition-colors">Residential</span></Link></li>
                <li><Link href="/commercial"><span className="hover:text-white transition-colors">Commercial</span></Link></li>
                <li><Link href="/mixed-use"><span className="hover:text-white transition-colors">Mixed-Use</span></Link></li>
                <li><Link href="/new-listings"><span className="hover:text-white transition-colors">New Listings</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-md font-medium mb-4">Learn</h4>
              <ul className="space-y-2">
                <li><Link href="/how-it-works"><span className="hover:text-white transition-colors">How It Works</span></Link></li>
                <li><Link href="/faqs"><span className="hover:text-white transition-colors">FAQs</span></Link></li>
                <li><Link href="/resources"><span className="hover:text-white transition-colors">Resources</span></Link></li>
                <li><Link href="/blog"><span className="hover:text-white transition-colors">Blog</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-md font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about"><span className="hover:text-white transition-colors">About Us</span></Link></li>
                <li><Link href="/careers"><span className="hover:text-white transition-colors">Careers</span></Link></li>
                <li><Link href="/contact"><span className="hover:text-white transition-colors">Contact</span></Link></li>
                <li><Link href="/legal"><span className="hover:text-white transition-colors">Legal</span></Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-gray-800 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} PropToken. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-4">
              <Link href="/privacy"><span className="hover:text-white transition-colors">Privacy Policy</span></Link>
              <Link href="/terms"><span className="hover:text-white transition-colors">Terms of Service</span></Link>
              <Link href="/cookies"><span className="hover:text-white transition-colors">Cookie Policy</span></Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Home;