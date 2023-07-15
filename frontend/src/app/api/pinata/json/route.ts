import { NextResponse } from 'next/server'
import axios from "axios"
import { FileReq, NftMeta } from '../../../../types/nft';
import { uuid } from 'uuidv4';


 
export  async function POST(
  request: Request
) {
  const nft = await request.json() as NftMeta;
  const jsonRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        pinataMetadata: {
          name: uuid()
        },
        pinataContent: nft
      }, {
        headers: {
          Accept: "text/plain",
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
        }
      });

    return NextResponse.json(jsonRes.data)

 
}