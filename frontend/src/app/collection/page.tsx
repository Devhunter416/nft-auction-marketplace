'use client'

import { NftMeta } from "@/types/nft";
import React, { useEffect } from 'react';
import { getAllNfts } from "../../lib/nftContract";
import Attributes from "@/components/attributes";
import { useAccount } from "wagmi";
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
      const nftMetaList: NftMeta[] = await getAllNfts();
      setNfts(nftMetaList);
      setMounted(true);
    }
    fetchData().catch(error=>console.log(error))
  }, []);

  if (!mounted) return <>Loading</>
  if(nfts.length>0){
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 min-h-[calc(100vh-5.25rem)] place-items-center m-8">
    <NftCollection collectionData={nfts}></NftCollection>
    </div>
    )
  }else{
    return <></>
  }
}
const NftCollection =  (props: {collectionData: NftMeta[]})  =>{

  return <> {props.collectionData.map((nft, index)=>{
      return(
        <div className="card w-96 bg-base-100 shadow-xl text-base m-4" key={index}>
          <figure><img src={nft.image} alt={nft.name}  className='h-48'/></figure>
          <div className="card-body h-96 overflow-auto">
          <div className='input-group'>
              <label className='label text-base font-bold'>Owner:</label>
              <h2 className="label">{nft.owner}</h2>
            </div>
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
          </div>
        </div>
      )
    }
  )}
   
  </>
}


