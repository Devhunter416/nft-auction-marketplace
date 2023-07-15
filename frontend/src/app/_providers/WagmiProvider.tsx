import React from "react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { bscTestnet, localhost } from "viem/chains";
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

type WagmiProviderType = {
  children: React.ReactNode;
};

const { chains, publicClient } = configureChains(
    [localhost,bscTestnet],
    [publicProvider()],
  )
  
const config = createConfig({
    autoConnect: true,
    connectors: [ new MetaMaskConnector({chains: chains, options: {shimDisconnect: true}}), ],
    publicClient,
})

const WagmiProvider = ({ children }: WagmiProviderType) => {
  return (
    <>
      <WagmiConfig  config={config}>{children}</WagmiConfig>
    </>
  );
};

export default WagmiProvider;