import React from "react";
import Link from "next/link";
import { hardhat } from "viem/chains";
import { 
  CurrencyDollarIcon, 
  MagnifyingGlassIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { Faucet } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Floating utilities and theme switcher for quick access */}
      <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
        <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
          {nativeCurrencyPrice > 0 && (
            <div>
              <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-1">
                <CurrencyDollarIcon className="h-4 w-4" />
                <span>${nativeCurrencyPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
          {isLocalNetwork && (
            <>
              <Faucet />
              <Link href="/blockexplorer" passHref className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md flex items-center gap-1 hover:bg-indigo-700 transition-colors">
                <MagnifyingGlassIcon className="h-4 w-4" />
                <span>Block Explorer</span>
              </Link>
            </>
          )}
        </div>
        <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company info */}
          <div className="col-span-1">
            <h3 className="text-base font-semibold text-gray-900 mb-4">TokenTrust</h3>
            <p className="text-gray-600 text-sm mb-4">
              Revolutionizing real estate investment through blockchain technology and fractional ownership.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation links */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Properties</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/residential" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>Residential</span>
                </Link>
              </li>
              <li>
                <Link href="/commercial" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>Commercial</span>
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>Marketplace</span>
                </Link>
              </li>
              <li>
                <Link href="/new-listings" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span>New Listings</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                  <span>How It Works</span>
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <QuestionMarkCircleIcon className="h-4 w-4" />
                  <span>FAQ</span>
                </Link>
              </li>
              <li>
                <Link href="/documentation" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Documentation</span>
                </Link>
              </li>
              {isLocalNetwork && (
                <li>
                  <Link href="/blockexplorer" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                    <span>Block Explorer</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-4">Legal & Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <a 
                  href="https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>Support</span>
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom footer with copyright and attribution */}
        <div className="pt-8 mt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 text-sm">
            &copy; {currentYear} TokenTrust. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm mt-4 md:mt-0">
            <div className="text-gray-500 flex items-center">
              <a 
                href="https://github.com/scaffold-eth/se-2" 
                target="_blank" 
                rel="noreferrer" 
                className="text-gray-500 hover:text-indigo-600 transition-colors"
              >
                Built with Scaffold-ETH 2
              </a>
            </div>
            
            <span className="text-gray-300">|</span>
            
            <div className="text-gray-500 flex items-center gap-1">
              <span>Powered by</span>
              <a
                className="text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
              >
                BuidlGuidl
              </a>
            </div>
            
            <span className="text-gray-300">|</span>
            
            <div className="text-gray-500">
              <span>Network: {targetNetwork.name}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};