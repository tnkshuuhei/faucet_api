import * as functions from "firebase-functions/v2";
import * as Express from "express";
import { ethers } from "ethers";
import { usdcContract } from "../usdc";
import { check, validationResult } from "express-validator";
import * as dotenv from "dotenv";

const app = Express();

async function checkBalance(
  address: string,
  contract: ethers.Contract
): Promise<boolean> {
  const balance = await contract.balanceOf(address);
  return balance < BigInt(10000 * 1e6);
}

async function sendEther(address: string, wallet: ethers.Wallet) {
  const tx = await wallet.sendTransaction({
    to: address,
    value: ethers.utils.parseEther("0.001"),
  });

  return tx;
}

async function claimFaucet(address: string) {
  dotenv.config();
  const amount = ethers.utils.parseUnits("10000", 6); // 10000 USDC (6 decimals)

  const apiKey = process.env.INFURA_API_KEY!;
  const provider = new ethers.providers.JsonRpcProvider(
    `https://optimism-sepolia.infura.io/v3/${apiKey}`
  );
  const privateKey = process.env.PRIVATE_KEY!;

  const wallet = new ethers.Wallet(privateKey, provider);
  const walletSigner = wallet.connect(provider);

  const contract = new ethers.Contract(
    usdcContract.address,
    usdcContract.abi,
    walletSigner
  );

  const isClaimable = await checkBalance(address, contract);

  if (!isClaimable) {
    return "User already has enough USDC";
  }

  const responsse = await contract
    .mint(address, amount)
    .then(async (tx: any) => {
      await tx.wait();

      await sendEther(address, wallet);
      return tx;
    })
    .catch((error: any) => {
      return error;
    });

  return responsse;
}

app.get(
  "/api/usdc",
  check("address").custom((value) => {
    return ethers.utils.isAddress(value);
  }),
  async (req: Express.Request, res: Express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const response = await claimFaucet(req.query.address as string);
      return res.status(200).json({ response });
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

exports.app = functions.https.onRequest(app);
