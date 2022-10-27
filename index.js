#!/usr/bin/env node

import inquirer from "inquirer";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { readFileSync } from 'fs';
import chalkAnimation from "chalk-animation";
import pkg from "stability-client";
const { generateAsync } = pkg;

import * as dotenv from "dotenv";
dotenv.config();

let playerName;
let location;
let address;



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
   location=images[0]["filePath"];
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
async function main() {

  const NETWORK = "mumbai";
  // Learn more about securely accessing your private key: https://portal.thirdweb.com/web3-sdk/set-up-the-sdk/securing-your-private-key
  const sdk = ThirdwebSDK.fromPrivateKey(process.env.WALLET_PRIVATE_KEY, NETWORK);

  const nftCollection = sdk.getNFTCollection('0xcF6E685D275dC1aAc0981c58979e8F3ec7608896');

  const nft = await (await nftCollection).mintTo(address, {
    name: "AI generated "+`${playerName}`,
    image: readFileSync(location),
    description:`${playerName}`,
  });
    const tokenID=parseInt(nft.id._hex,16);
    console.log(`https://testnets.opensea.io/assets/mumbai/0xcf6e685d275dc1aac0981c58979e8f3ec7608896/${tokenID}`)
  }

console.clear();
await welcome();

await askName();
await getImages();
await askAddress();
await main();
