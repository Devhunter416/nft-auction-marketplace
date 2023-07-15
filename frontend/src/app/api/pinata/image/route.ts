import { NextResponse } from 'next/server'
import axios from "axios"
import { FileReq } from '../../../../types/nft';
import FormData from 'form-data';


 
export async function POST(
  request: Request
) {
  const {bytes,contentType,fileName} = await request.json() as FileReq;
  const buffer = Buffer.from(Object.values(bytes));
  const formData = new FormData();
  formData.append(
    "file",
    buffer, {
      contentType,
      filename: fileName
    }
  );
  const fileResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
      }
    });

    return NextResponse.json(fileResponse.data)

 
}