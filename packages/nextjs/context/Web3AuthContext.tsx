"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Web3AuthMPCCoreKit } from "@web3auth/mpc-core-kit";

// Define the type for the provider props
interface Web3AuthProviderProps {
  children: ReactNode;
}

const Web3AuthContext = createContext<Web3AuthMPCCoreKit | null>(null);

export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({ children }) => {
  const [web3auth, setWeb3auth] = useState<Web3AuthMPCCoreKit | null>(null);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3authInstance = new Web3AuthMPCCoreKit({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
        });

        await web3authInstance.init();
        setWeb3auth(web3authInstance);
      } catch (error) {
        console.error("Web3Auth Initialization Error:", error);
      }
    };

    initWeb3Auth();
  }, []);

  return (
    <Web3AuthContext.Provider value={web3auth}>
      {children}
    </Web3AuthContext.Provider>
  );
};

export const useWeb3Auth = () => useContext(Web3AuthContext);
