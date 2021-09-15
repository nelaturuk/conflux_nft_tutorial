require('dotenv').config();
const key = process.env.REACT_APP_NFTSTORAGE_KEY;
const FormData = require('form-data');
const axios = require('axios');
const abi = require('./contract-abi.json');
const { Conflux } = require("js-conflux-sdk");

export const pinImageToIPFS = async (file) => {
    const url = `https://api.nft.storage/upload`;
    //making axios POST request to NFT Storage ⬇️
    //we gather a local file for this example, but any valid readStream source will work here.
    let data = new FormData();
    data.append('file', file);

    return axios
        .post(url, data, {
            maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
            headers: {
                'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                'Authorization': 'Bearer ' + key
            }
        })
        .then(function (response) {
            return {
                success: true,
                nftstorageurl: "https://api.nft.storage/" + response.data.value.cid
            };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

        });
};

export const mintNFT = async (url) => {

    //error handling
    if (url.trim() == "") {
        return {
            success: false,
            status: "❗Please make sure all fields are completed before minting.",
        }
    }

    //make nft storage call
    const tokenURI = url;

    const cfx = await Conflux.create({ url: "https://test.confluxrpc.com", logger: console })
    const me = cfx.wallet.addPrivateKey("0xf507bf529f870fff107fee93220a7f0516d90914c3510d53ac08e8b723c64f0a");

    const contract = cfx.Contract({ address: "cfxtest:acaj40uw90hk63ty08ptdz3ragb1bgbwgjwdj4hpry", abi })
    let supply = await contract.totalSupply();

    try {
        const receipt = await contract.mint(me.address, supply + 1, tokenURI).sendTransaction({ from: me.address}).executed();
        return {
            success: true,
            status: "✅ Check out your transaction on Conflux Scan: https://testnet.confluxscan.io/transaction/" + receipt.transactionHash
        }
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }
    }
};