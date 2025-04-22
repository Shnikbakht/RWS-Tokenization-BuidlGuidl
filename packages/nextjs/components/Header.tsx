"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hardhat } from "viem/chains";
import { 
  Bars3Icon, 
  BugAntIcon, 
  ShieldCheckIcon, 
  HomeIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick, useTargetNetwork } from "~~/hooks/scaffold-eth";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon className="h-4 w-4" />,
  },
  {
    label: "Properties",
    href: "/properties",
    icon: <BuildingOfficeIcon className="h-4 w-4" />,
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: <ChartBarIcon className="h-4 w-4" />,
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-4 w-4" />,
  },
  {
    label: "Admin Dashboard",
    href: "/admin",
    icon: <ShieldCheckIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive 
                  ? "bg-indigo-100 text-indigo-800 font-medium shadow-sm" 
                  : "text-gray-700 hover:text-indigo-600"
              } hover:bg-indigo-50 transition-all duration-200 py-2 px-4 text-sm rounded-lg flex items-center gap-2`}
            >
              <span className={`${isActive ? "text-indigo-600" : "text-gray-500"}`}>{icon}</span>
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const pathname = usePathname();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );
  
  // Handle scroll for transparent/solid header transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine if we're on the home page
  const isHomePage = pathname === "/";
  
  // Set header style based on page and scroll position
  const headerStyle = isHomePage && !isScrolled
    ? "bg-transparent text-white" 
    : "bg-white shadow-md text-gray-800";

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${headerStyle}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link href="/" passHref className="flex items-center gap-3 shrink-0">
              <div className="relative w-9 h-9">
                <Image 
                  alt="TokenTrust logo" 
                  className="cursor-pointer" 
                  fill 
                  src="/logo.svg" 
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">TokenTrust</span>
                <span className="text-xs opacity-80">Trust. Tokenized. Real Assets.</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:ml-10 lg:flex lg:space-x-2">
              <HeaderMenuLinks />
            </nav>
          </div>
          
          {/* Connect Wallet & Faucet Buttons */}
          <div className="flex items-center gap-2">
            <RainbowKitCustomConnectButton />
            {isLocalNetwork && <FaucetButton />}
            
            {/* Mobile menu button */}
            <div className="lg:hidden" ref={burgerMenuRef}>
              <button
                type="button"
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  isHomePage && !isScrolled 
                    ? "text-white hover:bg-indigo-800 hover:bg-opacity-20" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsDrawerOpen(prev => !prev)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              </button>
              
              {/* Mobile menu dropdown */}
              {isDrawerOpen && (
                <div className="absolute top-full right-0 w-56 mt-2 origin-top-right bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-2">
                    <ul
                      className="space-y-1 p-2"
                      onClick={() => setIsDrawerOpen(false)}
                    >
                      <HeaderMenuLinks />
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};