"use client";

import { useWeb3Auth } from "../context/Web3AuthContext";
import { useEffect, useState } from "react";

const Web3AuthComponent = () => {
  const web3auth = useWeb3Auth();
  const [keyDetails, setKeyDetails] = useState(null);

  const generateKeyShares = async () => {
    if (!web3auth) return;
    const key = await web3auth.generateMPCKeyShares({ factorCount: 3 });
    setKeyDetails(key);
  };

  return (
    <div>
      <h2>Web3Auth MPC Core Kit</h2>
      <button onClick={generateKeyShares} disabled={!web3auth}>
        Generate Key Shares
      </button>
      {keyDetails && <pre>{JSON.stringify(keyDetails, null, 2)}</pre>}
    </div>
  );
};

export default Web3AuthComponent;
