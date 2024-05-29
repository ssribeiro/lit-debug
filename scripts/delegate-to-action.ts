import { ethers } from "ethers-6.12.1";
import { assureEnv } from "../dev-src";
import path from "path";
import fs from "fs";
import { LitNodeClient } from "@lit-protocol/lit-node-client";

const CREDITS_FILE = path.join(
  "scripts",
  "output",
  "buy-capacity-credits",
  "capacityTokenId.txt"
);

const CAPACITY_DELEGATION_AUTH_SIG = path.join(
  "scripts",
  "output",
  "delegate-to-action",
  "capacityDelegationAuthSig.json"
);

const replaceFile = (path: string, content: string) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
  fs.writeFileSync(path, content);
};
/*
import { LitContracts } from "@lit-protocol/contracts-sdk";
import "dotenv/config";
import { assureEnv } from "../dev-src";

const LIT_NETWORK = "habanero";


*/
const program = async () => {
  console.log("Starting.");

  const litNodeClient = new LitNodeClient({
    litNetwork: "habanero",
    checkNodeAttestation: true,
  });

  await litNodeClient.connect();

  const walletWithCapacityCredit = new ethers.Wallet(
    assureEnv("LIT_MINTER_PRIVATE_KEY")
  );
  const capacityTokenIdStr = fs.readFileSync(CREDITS_FILE, "utf8");

  console.log("capacityTokenIdStr:", capacityTokenIdStr);

  const ACTION_PATH = path.join(
    "lit_actions",
    "deployed",
    "dummy-sign.action.json"
  );
  const action = JSON.parse(fs.readFileSync(ACTION_PATH, "utf8")) as {
    ipfsId: string;
    publicKey: string;
    keyEthAddress: string;
    pkpId: string;
  };

  const domain = "localhost";
  const statement =
    "This is a test statement.  You can put anything you want here.";
  const expiration = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: "1000",
      dAppOwnerWallet: walletWithCapacityCredit as unknown as any,
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [action.keyEthAddress],
      domain,
      expiration,
      statement,
    });

  console.log("capacityDelegationAuthSig:");
  console.log(capacityDelegationAuthSig);

  replaceFile(
    CAPACITY_DELEGATION_AUTH_SIG,
    JSON.stringify(capacityDelegationAuthSig)
  );

  litNodeClient.disconnect();
  process.exit(0);

  /*

  // console.log("walletWithCapacityCredit");
  // console.log(walletWithCapacityCredit);
  let contractClient = new LitContracts({
    privateKey: assureEnv("LIT_CREDITS_OWNER_PRIVATE_KEY"),
    network: LIT_NETWORK,
  });
  // console.log("contractClient");
  // console.log(contractClient);

  await contractClient.connect();
  console.log("Connected to LitContracts.");
  // console.log("contractClient");
  // console.log(contractClient);
  // this identifier will be used in delegation requests.
  const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
    requestsPerDay: 14400, // 10 request per minute
    daysUntilUTCMidnightExpiration: 2,
  });

  console.log("capacityTokenIdStr:", capacityTokenIdStr);
  replaceFile(path.join(OUTPUTDIR, "capacityTokenId.txt"), capacityTokenIdStr);
  console.log("Done.");

  */
};

program();
