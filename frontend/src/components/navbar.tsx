'use client'
import React from "react";
import Link from "next/link";
 
const Navbar = () => {
  return (
    <nav className="navbar sticky top-0 bg-base-100 hero bg-sky-500">
      <div className="flex-1">
        <a className="normal-case text-xl">NFT Marketplace</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/mint">Mint</Link>
          </li>
          <li>
            <Link href="/collection">Collection</Link>
          </li>
          <li>
            <Link href="/auctions">Auctions</Link>
          </li>
          <li>
          <Link href="/profile">Profile</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
export default Navbar;