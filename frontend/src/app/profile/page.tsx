'use client'

import { AuctionParams, NftAttribute, NftMeta } from "@/types/nft";
import React, { ChangeEvent, useEffect } from 'react';
import Modal from '@/components/modal';
import { createAuction } from '../../lib/auctionContract';
import { approve, getMyNfts } from "../../lib/nftContract";
import Attributes from "@/components/attributes";
import { toast } from "react-toastify";
import { getNetwork } from '@wagmi/core'
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { useRouter } from 'next/navigation';



export default  function Profile() {
  const [mounted, setMounted] = React.useState(false);
  const [nfts,setNfts] = React.useState<NftMeta[]>([]);
  const { isDisconnected } = useAccount();
  const router = useRouter();
  
    useEffect(() => {
      if(isDisconnected){
        return router.push("/")
      }
    const fetchData = async () => {
      const nftMetaList: NftMeta[] = await getMyNfts();
      setNfts(nftMetaList);
      setMounted(true);
    }
    fetchData().catch(error=>console.log(error))
  }, []);

  if (!mounted) return <>Loading</>
    return (
      <section className="divide-y-4">
      <h2 className="text-xl text-center">My NFTs</h2>
      {nfts.length>0?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1  place-items-center  min-h-[calc(100vh-6.25rem)]">
      <NftCollection collectionData={nfts}></NftCollection>
    </div>
    :null}
    </section>
    )
}
const NftCollection =  (props: {collectionData: NftMeta[]})  =>{
  const currency = getNetwork().chain?.nativeCurrency.name;
  const [open, setOpen] = React.useState(false);
  const[auctionParams, setAuctionParams] =  React.useState<AuctionParams>({
    tokenId: BigInt(0),
    startPrice: '0',
    duration:'0',
    unitTime:"minutes"
  });
  const handleClose= () => {
    setOpen(false);
  }
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setAuctionParams((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));
  }
  const handleSelect =(e: ChangeEvent<HTMLSelectElement>) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setAuctionParams((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));
  }

  const handleCreateAuction = async() => {
    const statusApprove = await approve(auctionParams.tokenId);
    if(statusApprove == "success"){
    await toast.promise(createAuction(auctionParams), {
      pending: 'Creating an auction',
      success: 'Auction created 👌',
      error: 'Auction rejected 🤯'
    });
    setOpen(false);
    }
  }
  const openModal = async(tokenId: bigint) => {
    setOpen(true);
    setAuctionParams({...auctionParams, tokenId: tokenId});
    }
  return <> {props.collectionData.map((nft, index)=>{
      return(
        <div className="card w-96 bg-base-100 shadow-xl text-base" key={index}>
          <figure><img src={nft.image} alt={nft.name}  className='h-48'/></figure>
          <div className="card-body h-96 overflow-auto">
            <div className='input-group'>
              <label className='label text-base font-bold'>Name:</label>
              <h2 className="label">{nft.name}</h2>
            </div>
            <div className='input-group'>
              <label className='label text-base font-bold'>Description:</label>
            <p className='label'>{nft.description}</p>
            </div>
            <div className='input-group'>
            <label className='text-base font-bold'>Attributes</label>
            </div>
            <Attributes rowsData={nft.attributes}></Attributes>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={()=> openModal(nft.tokenId!)}>Create Auction</button>
            </div>
          </div>
        </div>
      )
    }
  )}
   <Modal open={open}>
  <h3 className="font-bold text-lg text-center">Create an auction</h3>
  <div className="form-control">
    <label className="input-group p-4 w-full flex justify-center">
      <span className="whitespace-nowrap">Start price</span>
      <input type="number" name="startPrice" placeholder="0" className="input input-bordered " onChange={handleInput} />
      <span className="w-full">{currency}</span>
    </label>
    <label className="input-group p-4 w-full">
      <span>Duration</span>
      <input type="number" name="duration" placeholder="0" className="input input-bordered" onChange={handleInput}/>
      <select name="unitTime"className="select text-center w-full bg-neutral-200" onChange={handleSelect} >
        <option>minutes</option>
        <option>hours</option>
        <option>days</option>
      </select>
    </label>
  </div>
  
  <div className="modal-action">
    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"  onClick={handleClose}>✕</button>
    <button className='btn' onClick={()=>handleCreateAuction()}>OK</button>
  </div>
  </Modal> 
  </>
}


