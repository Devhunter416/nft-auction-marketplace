import { nftAuctionAbi , nftAbi} from '@/contract/contract-abis'
import { getContract,prepareWriteContract, waitForTransaction, writeContract } from '@wagmi/core'
import { parseEther, formatEther } from 'viem'
import { AuctionParams } from '@/types/nft'
import { getAccount } from '@wagmi/core'
import { auctionContractAddress, nftContractAddress }  from '@/contract/contracts-config'
import { getPublicClient } from '@wagmi/core'
import { truncateAddress } from './utils'




export const getAllAuctions = async function () {
    const auctionContract = getContract({
        address: auctionContractAddress,
        abi: nftAuctionAbi
      });
    const nftContract = getContract({
        address: nftContractAddress,
        abi: nftAbi,
      });
    const auctions = await auctionContract.read.getAllAuctions();
    return await Promise.all(
        auctions.map(async(auction, index)=>{
            const nftUri = await nftContract.read.tokenURI([auction.tokenId]);
            const metaRes = await fetch(nftUri);
            const metaData = await metaRes.json();
            const price = formatEther(auction.price);
            return {
                tokenId: auction.tokenId,
                metaData: metaData,
                price: price,
                path: `/auctions/${index}`,
                endAt: auction.endAt
            }
        })
    );  
} 

export const getAuction = async function (auctionId: bigint) {
    const publicClient = getPublicClient();
    const filter = await publicClient.createContractEventFilter({abi: nftAuctionAbi,address: auctionContractAddress,eventName:"BidCreated",
    args: { auctionId : auctionId}, fromBlock: 'earliest'});
    const account = getAccount();
    const auctionContract = getContract({
        address: auctionContractAddress,
        abi: nftAuctionAbi
      });
    const nftContract = getContract({
        address: nftContractAddress,
        abi: nftAbi,
      });
    const auctionData = await Promise.all( [auctionContract.read.auctions([auctionId]), 
    auctionContract.read.highestBidder([auctionId]),
    auctionContract.read.bids([auctionId,account.address!]),
    publicClient.getFilterChanges({ filter })
    ]);
    const nftUri = await nftContract.read.tokenURI([auctionData[0][1]]);
    const metaRes = await fetch(nftUri);
    const metaData = await metaRes.json();
    const price = formatEther(auctionData[0][2]);
    const bids = auctionData[3].map(a=> {
        return {bidder:truncateAddress(a.args.bidder!),
            bid: formatEther(a.args.bid!) 
        }
    });
    return {
        seller: auctionData[0][0],
        tokenId: auctionData[0][1],
        metaData: metaData,
        price: price,
        endAt: auctionData[0][4],
        status: auctionData[0][5],
        highestBidder: auctionData[1],
        currentBid: formatEther(auctionData[2]),
        bids: bids
    }
 
} 
export  const createAuction = async function (params: AuctionParams) {
    let durationInSeconds;
    if(params.unitTime=="days"){
        durationInSeconds = parseInt(params.duration) * 24 * 60 * 60;
    }else if(params.unitTime=="hours"){
        durationInSeconds = parseInt(params.duration) * 60 * 60;
    }else{
        durationInSeconds = parseInt(params.duration) * 60;
    }
    const {request} =await prepareWriteContract({
    address: auctionContractAddress,
    abi: nftAuctionAbi,
    functionName: 'createAuction',
    args: [parseEther(params.startPrice),params.tokenId,BigInt(durationInSeconds)]
    })
    const { hash } = await writeContract(request);
    return await waitForTransaction({hash});
}

export const completeAuction = async (auctionId: bigint) =>{
    const {request} =await prepareWriteContract({
    address: auctionContractAddress,
    abi: nftAuctionAbi,
    functionName: 'completeAuction',
    args: [auctionId]
    })
    const {hash} = await writeContract(request);
    const data = await waitForTransaction({hash});
    return data.status;
}

export const withdrawBid = async (auctionId: bigint) =>{
    const {request} =await prepareWriteContract({
    address: auctionContractAddress,
    abi: nftAuctionAbi,
    functionName: 'withdrawBid',
    args: [auctionId]
    })
    const {hash} = await writeContract(request);
    const data = await waitForTransaction({hash});
    return data.status;
}

export const bid = async (auctionId: bigint, amount: string) =>{
    const {request} =await prepareWriteContract({
    address: auctionContractAddress,
    abi: nftAuctionAbi,
    functionName: 'bid',
    args: [auctionId],
    value: parseEther(amount.toString())
    })
    const {hash} = await writeContract(request);
    const data = await waitForTransaction({hash});
    return data.status;
}