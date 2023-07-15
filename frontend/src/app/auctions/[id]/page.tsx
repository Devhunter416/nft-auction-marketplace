'use client'
import { bid, completeAuction, getAuction, withdrawBid } from "@/lib/auctionContract";
import Attributes from "@/components/attributes";
import Countdown from "@/components/countdown";
import Modal from "@/components/modal";
import React, { useState } from "react";
import { getAccount, getNetwork } from '@wagmi/core'
import { zeroAddress } from "viem";
import { truncateAddress } from '@/lib/utils'
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function Page({ params }: { params: { id: bigint } }) {
  const account = getAccount();
  const currency = getNetwork().chain?.nativeCurrency.name;
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("0");
  const [auction, setAuction] = useState<{
    seller: `0x${string}`;
    tokenId: bigint;
    metaData: any;
    price: string;
    endAt: bigint;
    status: number;
    currentBid: string
    highestBidder: `0x${string}`;
    bids: {
      bidder: string;
      bid: string;
    }[]
  }>();
  const router = useRouter()
  React.useEffect(() => {
    const fetchData = async () => {
      setAuction(await getAuction(params.id));
    }
    fetchData().catch(e=>console.log(e));
  }, []);
  if (!auction) return <></>
  const canCompleteAuction = Date.now() / 1000 > auction.endAt && auction.status == 1 &&
    (account.address == auction.highestBidder || (auction.highestBidder == zeroAddress && account.address == auction.seller));
  const canBid = Date.now() / 1000 < auction.endAt && auction.status == 1 && auction.seller != account.address;
  const canWithdraw = auction.status == 2 && parseInt(auction.currentBid) > 0;

  const handleCompleteAuction = async () => {
    const response = await toast.promise(completeAuction(params.id), {
      pending: 'Complete an auction in progress',
      success: 'Auction completed 👌',
      error: 'Complete an auction rejected 🤯'
    });
    if (response === "success") {
      setTimeout(() => router.push("/profile"), 3000);
    }
  }
  const handleWithdraw = () => {
    toast.promise(withdrawBid(params.id), {
      pending: 'Withdraw in progress',
      success: 'Successful withdrawal 👌',
      error: 'Withdraw rejected 🤯'
    });
  }
  const handleBid = () => {
    toast.promise(bid(params.id, amount), {
      pending: 'Placing a bid',
      success: 'Successful bid 👌',
      error: 'Bid rejected 🤯'
    });
    setOpen(false);
  }
  const handleClose = () => setOpen(false);

  return <div className="grid place-items-center  h-[calc(100vh-5.25rem)]">
    <div className="card w-96 bg-base-100 shadow-xl text-base">
      <figure><img src={auction.metaData.image} alt={auction.metaData.name} className='h-48' /></figure>
      <div className="card-body overflow-auto">
        <div className='input-group'>
          <label className='label text-base font-bold'>Seller:</label>
          <h2 className="label">{truncateAddress(auction.seller)}</h2>
        </div>
        <div className='input-group'>
          <label className='label text-base font-bold'>Name:</label>
          <h2 className="label">{auction.metaData.name}</h2>
        </div>
        <div className='input-group'>
          <label className='label text-base font-bold'>Description:</label>
          <p className='label'>{auction.metaData.description}</p>
        </div>
        <div className='input-group'>
          <label className='label text-base font-bold'>Price:</label>
          <label className='p-2 input-group'>{auction.price}<span className="ml-2">{currency}</span></label>
        </div>
        <div className='input-group'>
          <label className='text-base font-bold'>Attributes</label>
        </div>
        <Attributes rowsData={auction.metaData.attributes}></Attributes>
        <Countdown timestamp={Number(auction.endAt)}></Countdown>
        {auction.seller != account.address &&
        <div className='input-group'>
          <label className='label text-base font-bold whitespace-nowrap'>Your bid:</label>
          <label className='p-2 input-group'>{auction.currentBid.toString()}<span className="ml-2">{currency}</span></label>
        </div>
        }
        {canCompleteAuction ?
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={handleCompleteAuction}>Complete Auction</button>
          </div>
          : canBid ?
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={() => setOpen(true)}>Bid</button>
            </div>
            : canWithdraw ?
              <div className="card-actions justify-end">
                <button className="btn btn-primary" onClick={handleWithdraw}>Withdraw bid</button>
              </div> : null
        }
        <Bids bids={auction.bids} symbol={currency!}  />
      </div>
      <Modal open={open}>

        <h3 className="font-bold text-lg text-center">Place a bid</h3>
        <div className="form-control">
          <label className="input-group p-4 w-full">
            <span>Bidding price</span>
            <input type="number" name="startPrice" placeholder="0" className="input input-bordered " onChange={(e) => setAmount(e.target.value)} />
            <span>{currency}</span>
          </label>
        </div>
        <div className="modal-action">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={handleClose}>✕</button>
          <button className='btn' onClick={handleBid}>OK</button>
        </div>
      </Modal>
    </div>
  </div>
}

function Bids({ bids , symbol}: {
  bids: {
    bidder: string;
    bid: string;
  }[], symbol: string
}) {
  return <table className="table table-xs">
    <caption>Bids:</caption>
    <thead>
      <tr>
        <th>#</th>
        <th>Address</th>
        <th>Bid</th>
      </tr>
    </thead>
    <tbody>
    {
      bids.reverse().map((data, index) => {
        return (
          <tr key={index}>
            <th>{index + 1}</th>
            <th>{data.bidder} </th>
            <th>{data.bid} <strong className="badge">{symbol}</strong></th>
          </tr>
        )
      })
    }
    </tbody>
  </table>



}