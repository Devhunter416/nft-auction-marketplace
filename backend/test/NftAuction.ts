import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { any } from "hardhat/internal/core/params/argumentTypes";
import { NFT, NFTAuction } from "../typechain-types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("Nft Auction contract", function () {
  async function deployNftAuction() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nftContract = (await upgrades.deployProxy(NFT, [])) as unknown as NFT;
    nftContract.waitForDeployment();
    const NFTAuction = await ethers.getContractFactory("NFTAuction");
    const nftAuctionContract = (await upgrades.deployProxy(NFTAuction, [
      nftContract.target,
    ])) as unknown as NFTAuction;
    nftAuctionContract.waitForDeployment();
    return { nftContract, nftAuctionContract, owner, addr1, addr2 };
  }
  async function deployNftAuctionAndCreateAuction() {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await deployNftAuction();
    await nftContract.mint("url");
    await nftContract.approve(nftAuctionContract.target, 0);
    await nftAuctionContract.createAuction(100, 0, 120);
    return { nftContract, nftAuctionContract, owner, addr1, addr2 };
  }
  it("It should mint an NFT", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuction);

    await expect(nftContract.mint("url"))
      .to.emit(nftContract, "Transfer")
      .withArgs(ZERO_ADDRESS, owner.address, 0);

    expect(owner.address).to.be.equal(await nftContract.ownerOf(0));

    expect((await nftContract.getOwnedNfts()).length).to.be.equals(1);

    expect(
      (await nftContract.connect(owner).getOwnedNfts()).length
    ).to.be.equals(1);


    await expect(nftContract.connect(addr1).mint("url")).to.changeTokenBalance(
      nftContract,
      addr1,
      1
    );
    expect((await nftContract.getAllNfts()).length).to.be.equals(2);
    
  });
  it("It should transfer the NFT when creating an auction", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuction);
    await nftContract.mint("url");
    await nftContract.approve(nftAuctionContract.target, 0);
    expect(
      await nftAuctionContract.createAuction(100, 0, 120)
    ).to.changeTokenBalance(nftContract, owner, -1);
    expect(await nftContract.ownerOf(0)).to.equals(nftAuctionContract.target);
  });
  it("It should emit an event when creating an auction", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuction);
    await nftContract.mint("url");
    await nftContract.approve(nftAuctionContract.target, 0);
    expect(await nftAuctionContract.createAuction(100, 0, 120))
      .to.emit(nftAuctionContract, "AuctionCreated")
      .withArgs(0, owner.address, 100, 0, any, any);
  });
  it("It should get the auction created", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuctionAndCreateAuction);
    expect(
      (await nftAuctionContract.connect(addr1).getAllAuctions()).length
    ).to.be.equals(1);
  });
  it("It should change ether balance when placing a bid", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuctionAndCreateAuction);
    await expect(
      nftAuctionContract.connect(addr1).bid(0, { value: 120 })
    ).to.changeEtherBalance(addr1.address, -120);
  });
  it("Should fail if the owner try to bid his own auction", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuctionAndCreateAuction);
    await expect(
      nftAuctionContract.connect(owner).bid(0, { value: 120 })
    ).to.be.revertedWith("cannot bid on what you own");
  });
  it("It should complete the auction the highest bidder", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuctionAndCreateAuction);
    await nftAuctionContract.connect(addr1).bid(0, { value: 120 });
    await nftAuctionContract.connect(addr2).bid(0, { value: 200 });
    time.increase(120);
    await expect(
      nftAuctionContract.connect(addr2).completeAuction(0)
    ).to.changeTokenBalance(nftContract, addr2, 1);
    expect(await nftContract.ownerOf(0)).to.be.equals(addr2.address);
  });
  it("It should complete the auction the owner", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuctionAndCreateAuction);
    await nftAuctionContract.connect(addr1).bid(0, { value: 120 });
    await nftAuctionContract.connect(addr2).bid(0, { value: 200 });
    time.increase(120);
    await expect(
      nftAuctionContract.connect(owner).completeAuction(0)
    ).to.changeTokenBalance(nftContract, addr2, 1);
    expect(await nftContract.ownerOf(0)).to.be.equals(addr2.address);
  });
  it("It should complete the auction by owner when there are no bids", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuctionAndCreateAuction);
    time.increase(120);
    await expect(
      nftAuctionContract.connect(owner).completeAuction(0)
    ).to.changeTokenBalance(nftContract, owner, 1);
    expect(await nftContract.ownerOf(0)).to.be.equals(owner.address);
  });
  it("It should transfer the higest bid to the owner after complete the auction", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuctionAndCreateAuction);
    await nftAuctionContract.connect(addr1).bid(0, { value: 120 });
    await nftAuctionContract.connect(addr2).bid(0, { value: 200 });
    time.increase(120);
    await expect(
      nftAuctionContract.connect(addr2).completeAuction(0)
    ).to.changeEtherBalance(owner, 200);
  });
  it("It should withdraw the bid after the auction is completed", async function () {
    const { nftContract, nftAuctionContract, owner, addr1, addr2 } =
      await loadFixture(deployNftAuctionAndCreateAuction);
    await nftAuctionContract.connect(addr1).bid(0, { value: 120 });
    await nftAuctionContract.connect(addr2).bid(0, { value: 200 });
    time.increase(120);
    await nftAuctionContract.connect(addr2).completeAuction(0);
    await expect(
      nftAuctionContract.connect(addr1).withdrawBid(0)
    ).to.changeEtherBalance(addr1, 120);
  });
});
