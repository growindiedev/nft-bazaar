import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";

import { marketplaceAddress } from "../config";
import NFTBazaar from "../artifacts/contracts/NFTBazaar.sol/NFTBazaar.json";

export default function Home() {
  const [nfts, setNFTs] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    // how does this generic jsonRpcProvider work, hmmm?
    const provider = new ethers.providers.JsonRpcProvider();
    //the address needs to be changed
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTBazaar.abi,
      provider
    );
    const data = await contract.fetchMarketItems();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );

    setNfts(items);
    setLoadingState("loaded");
  };

  const buyNft = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTBazaar.abi,
      signer
    );

    const price = ethers.utils.parseUints(nft.price.toString(), "ether");
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });

    await transaction.wait();
    loadNFTs();
  };

  return <>whoop</>;
}
