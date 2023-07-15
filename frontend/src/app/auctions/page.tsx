
'use client'
import { Auction, NftAttribute, NftItem, NftMeta } from "@/types/nft";

import { getAllAuctions } from "../../lib/auctionContract";
import { getNetwork } from '@wagmi/core'
import Countdown from "@/components/countdown";
import React from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";



export default  function Auctions() {

  const [mounted, setMounted] = React.useState(false);
  const [auctions,setAuctions] = React.useState<any>([]);
  const { isDisconnected } = useAccount();
  const router = useRouter();
  const currency = getNetwork().chain?.nativeCurrency.name;
  React.useEffect(() => {
    if( isDisconnected){
      return router.push("/");
    }
    const fetchData = async () => {
      setAuctions(await getAllAuctions());
      setMounted(true);
    }
    fetchData()
  }, []);

  if(!mounted) return <>Empty</>
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2  place-items-center  h-[calc(100vh-5.25rem)]">
    <NftAuction collectionData={auctions} currency={currency||""}></NftAuction>
    </div>
    )
}
function NftAuction (props: {collectionData: {
    tokenId: bigint;
    metaData: any;
    price: string;
    path: string;
    endAt: bigint;
}[], currency: string}) {

  return (
    props.collectionData.map((nft, index)=>{
      return(
      
        <div className="card w-96 bg-base-100 shadow-xl text-base" key={index}>
          <figure><img src={nft.metaData.image} alt={nft.metaData.name}  className='h-48'/></figure>
          <div className="card-body h-96 overflow-auto">
            <div className='input-group'>
              <label className='label text-base font-bold'>Name:</label>
              <h2 className="label">{nft.metaData.name}</h2>
            </div>
            <div className='input-group'>
              <label className='label text-base font-bold'>Description:</label>
              <p className='label'>{nft.metaData.description}</p>
            </div>
            <div className='input-group'>
              <label className='label text-base font-bold'>Price:</label>
              <label className='p-2 input-group'>{nft.price}<span className="ml-2">{props.currency}</span></label>
            </div>
            <div className='input-group'>
            <label className='text-base font-bold'>Attributes</label>
            </div>
            <Attributes rowsData={nft.metaData.attributes}></Attributes>
            <Countdown timestamp={Number(nft.endAt)}></Countdown>
            
            <div className="card-actions justify-end">
                <Link className="btn btn-primary" href={nft.path}>Details</Link>
            </div>
          </div>
        </div>
      )
    }
  ))
  }

  function Attributes({rowsData}:{rowsData: NftAttribute[]}) {
    return(
        
      rowsData.map((data, index)=>{
        
            return(
              <div key={index} className="input-group p-1">
               <label className='w-full flex-1 font-bold'>{data.trait_type}: </label>
               <label className='w-full flex-2 text-left ml-2'>{data.value}</label>
              </div>
            )
        })
   
    )}