import { NftAttribute } from "@/types/nft"

export default function Attributes({rowsData}:{rowsData: NftAttribute[]}) {
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