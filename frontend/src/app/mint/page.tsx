'use client'
import { ChangeEvent, FormEvent, MouseEvent, useEffect, useState } from "react"
import axios from "axios"
import { NftAttribute, NftMeta, PinataRes } from '../../types/nft';
import { mint } from '../../lib/nftContract';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useAccount } from "wagmi";
export default function Mint() 
{
  const router = useRouter();
  const { isDisconnected } = useAccount();
  useEffect(() => {
    if(isDisconnected){
      router.push("/")
    }
  }, []);
  const [isLoading, setIsLoading] = useState(false)
  const [attributes , setAttributes] = useState<NftAttribute[]>([]);
  const [nftMeta, setNftMeta] = useState<NftMeta>({
    name: "",
    description: "",
    image: "",
    attributes: []
  });

  const addAttibute = ()=>{
    const attribute :NftAttribute={
      trait_type:'',
      value:''
    } 
    setAttributes([...attributes, attribute])
  }
  const deleteAttibute = (index: number)=>{
    const currentAttibutes = [...attributes];
    currentAttibutes.splice(index, 1);
    setAttributes(currentAttibutes);
  }
  const handleChangeAttibute = (index: number, e: ChangeEvent<HTMLInputElement>)=>{
    const { name, value } = e.target;
    const attributesInput = [...attributes];
    attributesInput[index][name as keyof NftAttribute] = value;
    setNftMeta((prevState) => ({
      ...prevState,
      attributes: attributes
    }));
  
}

  const mintNFT = async(e: FormEvent) =>{
    e.preventDefault();
    try{
      const res = await axios.post("/api/pinata/json", nftMeta); 
      const pinataRes = res.data as PinataRes;
      const nftUri = `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${pinataRes.IpfsHash}`;
      setIsLoading(true);
      const response =await toast.promise(mint(nftUri), {
        pending: 'Minting an NFT',
        success: 'Nft created 👌',
        error: 'Mint rejected 🤯'
        });
      setIsLoading(false);
      
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }

  }
  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    setNftMeta((prevState) => ({
      ...prevState,
      [fieldName]: fieldValue
    }));
  }
  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length==0) return;
    const file = e.target.files[0];
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    try{
      const res = await axios.post("/api/pinata/image", {
        bytes,
        contentType: file.type,
        fileName: file.name.replace(/\.[^/.]+$/, "")
      });
      const data = res.data as PinataRes;
      setNftMeta({
        ...nftMeta,
        image: `${process.env.NEXT_PUBLIC_PINATA_DOMAIN}/ipfs/${data.IpfsHash}`
      }); 
    } catch (error) {
      console.log(error);
    }
  }
  


    return <div className="relative flex flex-col justify-center h-[calc(100vh-5.25rem)]">
        <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
            <h1 className="text-3xl font-semibold text-center">Mint</h1>
            <form className="space-y-4" onSubmit={mintNFT}>
                <div>
                    <label className="label">
                        <span className="text-base label-text">Name of collection</span>
                    </label>
                    <input type="text" name='name' onChange={handleInput} placeholder="Name" className="w-full input input-bordered input-primary" required/>
                </div>
                <div>
                    <label className="label">
                        <span className="text-base label-text">Description of collection</span>
                    </label>
                    <input type="text" name='description' onChange={handleInput} placeholder="Description" className="w-full input input-bordered input-primary" />
                </div>
                <div>
                <input type="file" name='file' onChange={uploadImage}
                 className="file-input w-full"/>
                </div>
                <div className="form-control max-h-64 overflow-y-auto" >
                  <div className="input-group">
                    <button className="btn" type='button' onClick={addAttibute}>Add attribute</button>
                  </div>
                    <Attributes rowsData={attributes} deleteTableRows={deleteAttibute} handleChange={handleChangeAttibute}></Attributes>
                </div>
                <div>
                  
                  <button disabled={isLoading} className="btn btn-block btn-primary">
                  {isLoading ? 'Minting...' : 'Mint'}
                  </button>
                </div>
            </form>
        </div>
        </div>

  }

  function Attributes({rowsData, deleteTableRows, handleChange}:{rowsData: any[], deleteTableRows: any, handleChange:any}) {
    return(
        
      rowsData.map((data, index)=>{
        
            return(
              <div key={index} className="input-group">
               <input type="text" className='input input-primary w-full' placeholder="trait_type"  onChange={(e)=>(handleChange(index, e))} name="trait_type"/>
                <input type="text" className='input input-primary w-full'  placeholder="value" onChange={(e)=>(handleChange(index, e))} name="value" />
                <button type='button' className="btn" onClick={()=>(deleteTableRows(index))}>x</button>
              </div>
            )
        })
   
    )
    
}