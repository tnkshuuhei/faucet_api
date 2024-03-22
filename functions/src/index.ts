import * as functions from "firebase-functions/v2";
import * as Express from "express";
import { ethers } from "ethers";
require("dotenv").config();
import { usdcContract } from "../usdc";

const app = Express();

const networks = {
  opSepolia: "https://optimism-sepolia.infura.io/v3/",
};

const apiKey = process.env.INFURA_API_KEY!;
const network = networks.opSepolia;

const configureProvider = () => {
  return new ethers.providers.JsonRpcProvider(`${network}${apiKey}`);
};

app.get("/:address", async (req: Express.Request, res: Express.Response) => {
  try {
    const provider = configureProvider();
    const toAddress = req.params.address;
    const privateKey = process.env.PRIVATE_KEY!;
    const amount = ethers.utils.parseUnits("10000", 6); // 10000 USDC (6 decimals)

    const wallet = new ethers.Wallet(privateKey, provider);
    let walletSigner = wallet.connect(provider);

    const contract = new ethers.Contract(
      usdcContract.address,
      usdcContract.abi,
      walletSigner
    );

    await contract.mint(toAddress, amount).then((tx: any) => {
      res.send(`Transaction hash: ${tx.hash}\n`);
    });
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}\n`);
  }
});

exports.app = functions.https.onRequest(app);

// https://console.firebase.google.com/project/faucet-test-usdc/app/0xd4dB78F13Bc28c84211f2D8795B1aAd6c24e56bB
// curl https://us-central1-faucet-test-usdc.cloudfunctions.net/0xd4dB78F13Bc28c84211f2D8795B1aAd6c24e56bB
