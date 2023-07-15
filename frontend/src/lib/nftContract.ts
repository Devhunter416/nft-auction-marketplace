import { auctionContractAddress, networkDeployedTo, nftContractAddress } from '@/contract/contracts-config';
import { nftAbi } from '@/contract/contract-abis'
import { prepareWriteContract, waitForTransaction, writeContract, getAccount, getContract } from '@wagmi/core'
import { truncateAddress } from './utils';

export  const approve = async function (  tokenId: bigint) {
    const {request} =await prepareWriteContract({
    address: nftContractAddress,
    abi: nftAbi,
    functionName: 'approve',
    args: [auctionContractAddress,tokenId]
    })
    const {hash} = await writeContract(request);
    const data = await waitForTransaction({hash});
    return data.status;
}

export  const mint = async function (  tokenURI: string) {
    const {request} =await prepareWriteContract({
    address: nftContractAddress,
    abi: nftAbi,
    functionName: 'mint',
    args: [tokenURI]
    })
    const {hash} = await writeContract(request);
    const data = await waitForTransaction({hash});
    return data.status;
}

export const getMyNfts = async function () {
    const account = getAccount();
    const nftContract = getContract({
        address: nftContractAddress,
        abi: nftAbi
      });
    const nfts = await nftContract.read.getOwnedNfts({account: account.address});
    return await Promise.all(
        nfts.map(async(nft)=>{
            const metaRes = await fetch(nft.tokenURI);
            const metaData = await metaRes.json();
            metaData.tokenId=nft.tokenId;
            return metaData
        })
    );
    
}

export const getAllNfts = async function () {
    const account = getAccount();
    const nftContract = getContract({
        address: nftContractAddress,
        abi: nftAbi
      });
    const nfts = await nftContract.read.getAllNfts();
    return await Promise.all(
        nfts.map(async(nft)=>{
            const metaRes = await fetch(nft.tokenURI);
            const metaData = await metaRes.json();
            metaData.tokenId=nft.tokenId;
            metaData.owner= truncateAddress(nft.owner);
            return metaData
        })
    );
    
}