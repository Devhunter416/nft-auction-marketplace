import { ethers, upgrades, network } from "hardhat";
import fs from "fs";
import hre from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await upgrades.deployProxy(NFT, []);
  await nft.waitForDeployment();
  console.log("NFT deployed to:", nft.target);
  const nftImplementationAddress = await upgrades.erc1967.getImplementationAddress(
    nft.target as string
  );
  console.log(`NFT Impl Address: ${nftImplementationAddress}`);
  const NFTAuction = await ethers.getContractFactory("NFTAuction");
  const nftAuction = await upgrades.deployProxy(NFTAuction, [nft.target]);
  await nftAuction.waitForDeployment();
  console.log("NFTAuction deployed to:", nftAuction.target);
  const nftAuctionImplementationAddress = await upgrades.erc1967.getImplementationAddress(
    nftAuction.target as string
  );

  if (fs.existsSync("../frontend/src/contract")) {
    fs.writeFileSync(
      "../frontend/src/contract/contracts-config.js",
      `export const auctionContractAddress = "${nftAuction.target}"
export const nftContractAddress = "${nft.target}"
export const ownerAddress = "${deployer.address}"
export const networkDeployedTo = ${network.config.chainId}`
    );
    let nftAbi = require('../artifacts/contracts/NFT.sol/NFT.json').abi;
    let nftAuctionAbi = require('../artifacts/contracts/NFTAuction.sol/NFTAuction.json').abi;
    fs.writeFileSync(
      "../frontend/src/contract/contract-abis.ts",
      `export const nftAbi = ${JSON.stringify(nftAbi,null, 2)} as const
export const nftAuctionAbi = ${JSON.stringify(nftAuctionAbi,null,2)} as const`) ;
  }

  
  if (!process.env.HARDHAT_NETWORK || process.env.HARDHAT_NETWORK=='localhost') return;
  try {
    await hre.run("verify:verify", {
      address: nftImplementationAddress,
      constructorArguments: [],
    });
    await hre.run("verify:verify", {
      address: nftAuctionImplementationAddress,
      constructorArguments: [nft.target],
    });

  } catch (e) {
    console.error("Error veryfing", e);
  }

}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
