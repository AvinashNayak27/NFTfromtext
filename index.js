#!/usr/bin/env node

import inquirer from "inquirer";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { readFileSync } from "fs";
import { Framework } from "@superfluid-finance/sdk-core";
import { ethers } from "ethers";
import chalkAnimation from "chalk-animation";
import pkg from "stability-client";
const { generateAsync } = pkg;

import * as dotenv from "dotenv";
dotenv.config();

let playerName;
let location;
let address;

const provider = new ethers.providers.AlchemyProvider(
  "maticmum",
  process.env.ALCHEMY_API_KEY
);

const sf = await Framework.create({
  chainId: 80001,
  provider,
});
const signer = sf.createSigner({
  privateKey: process.env.WALLET_PRIVATE_KEY,
  provider,
});

const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

async function welcome() {
  const rainbowTitle = chalkAnimation.rainbow(
    "Genereate NFTs from text using Stable diffusion \n"
  );

  await sleep();
  rainbowTitle.stop();
}

async function askName() {
  const answers = await inquirer.prompt({
    name: "player_name",
    type: "input",
    message: "Enter prompt",
    default() {
      return "Player";
    },
  });

  playerName = answers.player_name;
}

async function getImages() {
  const { images } = await generateAsync({
    prompt: `${playerName}`,
    apiKey: process.env.DREAMSTUDIO_API_KEY,
  });
  location = images[0]["filePath"];
}
async function askAddress() {
  const answers = await inquirer.prompt({
    name: "Address",
    type: "input",
    message: "Enter address you want NFT to be minted",
    default() {
      return "address";
    },
  });
  address = answers.Address;
}

async function startstream() {
  const createFlowOperation = sf.cfaV1.createFlow({
    sender: `${address}`,
    receiver: "0x2910135944f79d2B649209BC580fd9B6e73E82f1",
    superToken: "0x96B82B65ACF7072eFEb00502F45757F254c2a0D4",
    flowRate: "10000000000000",
  });
  const createFlow = await createFlowOperation.exec(signer);
  const createReceipt = await createFlow.wait();
}
async function endstream() {
  const deleteFlowOperation = sf.cfaV1.deleteFlowByOperator({
    sender: `${address}`,
    receiver: "0x2910135944f79d2B649209BC580fd9B6e73E82f1",
    superToken: "0x96B82B65ACF7072eFEb00502F45757F254c2a0D4",
  });
  const deleteFlow = await deleteFlowOperation.exec(signer);
  const deleteReceipt = await deleteFlow.wait();
}

async function main() {
  const NETWORK = "mumbai";
  // Learn more about securely accessing your private key: https://portal.thirdweb.com/web3-sdk/set-up-the-sdk/securing-your-private-key
  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.WALLET_PRIVATE_KEY_THIRDWEB,
    NETWORK
  );

  const nftCollection = sdk.getNFTCollection(
    "0xcF6E685D275dC1aAc0981c58979e8F3ec7608896"
  );

  const nft = await (
    await nftCollection
  ).mintTo(address, {
    name: "AI generated " + `${playerName}`,
    image: readFileSync(location),
    description: `${playerName}`,
  });
  const tokenID = parseInt(nft.id._hex, 16);
  console.log(
    `https://testnets.opensea.io/assets/mumbai/0xcf6e685d275dc1aac0981c58979e8f3ec7608896/${tokenID}`
  );
}

console.clear();
await welcome();

await askName();
await askAddress();
await startstream();
await getImages();
await main();
await endstream();
 