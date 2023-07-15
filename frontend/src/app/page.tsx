"use client";
import { networkDeployedTo } from "@/contract/contracts-config";
import { useEffect, useState } from "react";
import { useAccount, useConfig, useConnect, useSignMessage } from "wagmi";

const AuthPage = () => {
  const [mounted, setMounted] = useState(false);
  const { connectors } = useConfig()

  const { connect } = useConnect({ connector: connectors[0],chainId: networkDeployedTo })
  
  const { isConnected } = useAccount();
  useEffect(() => {
    setMounted(true);
  }, []);
  if(!mounted) return <>Loading</>
  
  if(isConnected){
    return <main className="grid place-items-center h-[calc(100vh-5.25rem)]">
      <div className="text-center text-lg">
        <h2>This is a NFT Marketplace</h2>
        <p>You can use this Marketplace to post NFTs ,buy and visualize other NFT collections</p>
      </div>
    </main>
  }
  return <main className="grid place-items-center h-[calc(100vh-5.25rem)]">
      <div className="text-center text-lg">
        <h2>This is a NFT Marketplace</h2>
        <p>You can use this Marketplace to post NFTs ,buy and visualize other NFT collections</p>
      </div>
      <div className="grid text-lg">
        <p>Connect your metamask wallet</p>
        <button onClick={()=> connect()} className="btn rounded-full bg-indigo-500">Connect</button>
      </div>
    </main>

};

export default AuthPage;
