import { useEffect, useState } from "react";
import { connectWallet, getCurrentWalletConnected } from "./interact.js";
import { pinImageToIPFS, mintNFT } from "./nftstorage.js";

const Minter = (props) => {

  //State variables
  const [walletAddress, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setURL] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [file, setFile] = useState();

  useEffect(async () => {
    const { address, status } = await getCurrentWalletConnected();
    setWallet(address)
    setStatus(status);

    addWalletListener();
  }, []);

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  const onMintPressed = async () => {
    setWaiting(true);
    const nftStorageResponse = await pinImageToIPFS(file);
    if (!nftStorageResponse.success) {
      return {
        success: false,
        status: "😢 Something went wrong while uploading your tokenURI.",
      }
    }
    
    const { status } = await mintNFT(nftStorageResponse.nftstorageurl);
    setWaiting(false);
    setStatus(status);
  };

  const onChange = async (e) => {
    console.log(e.target.files[0]);
    setFile(e.target.files[0]);
  };

  function addWalletListener() {
    if (window.conflux) {
      window.conflux.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus("👆🏽 Write a message in the text-field above.");
        } else {
          setWallet("");
          setStatus("🦊 Connect to Conflux Portal using the top right button.");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Conflux Portal, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  return (
    <div className="Minter">
      <button id="walletButton" onClick={connectWalletPressed}>
        {walletAddress.length > 0 ? (
          "Connected: " +
          String(walletAddress).substring(0, 6) +
          "..." +
          String(walletAddress).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </button>

      <br></br>
      <h1 id="title">Conflux NFT Minter</h1>
      <p>
        Simply add your asset's link, name, and description, then press "Mint."
      </p>
      <form>
        <h2>🖼 Link to asset: </h2>
        <input
          type="text"
          placeholder="Upload the image"
          onChange={(event) => setURL(event.target.value)}
        />
        <input type="file" onChange={onChange} />
        {/* <h2>🤔 Name: </h2>
        <input
          type="text"
          placeholder="e.g. My first NFT!"
          onChange={onChangeName}
        /> */}
        {/* <h2>✍️ Description: </h2>
        <input
          type="text"
          placeholder="e.g. Even cooler than cryptokitties ;)"
          onChange={(event) => setDescription(event.target.value)}
        /> */}


      </form>
      <button id="mintButton" onClick={onMintPressed}>
        { !waiting ? "Mint NFT" : "Minting.. Please wait"}
      </button>
      <p id="status">
        {status}
      </p>
    </div>
  );
};

export default Minter;
