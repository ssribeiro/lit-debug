import { AuthMethodType } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import BigNumber from "bignumber.js-9.1.2";
import { ethers } from "ethers-6.12.1";
import fs from "fs";
import { CID } from "multiformats/cid";
import path from "path";
import { pinataUpload, assureEnv } from "../dev-src";

const replaceFile = (path: string, content: string) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
  fs.writeFileSync(path, content);
};

const OUTPUTDIR = path.join("scripts", "output", "deploy-lit-action");

const go = async () => {
  console.log("starting..");
  // First get the args and check that one at least is present
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Error: No arguments provided");
    process.exit(1);
  }

  // Now make sure the lit action is built in the lit_actions/out directory

  // Add the '.action.js' extension to the action name
  const actionName = args[0];
  replaceFile(path.join(OUTPUTDIR, "actionName.txt"), actionName);
  const actionPath = `lit_actions/out/${actionName}.action.js`;
  if (!fs.existsSync(actionPath)) {
    console.error(`Error: Action ${actionName} not found in lit_actions/out`);
    process.exit(1);
  }

  //
  console.log("Read the action file");
  const action = fs.readFileSync(actionPath, "utf8");

  console.log("Deploy to ipfs");

  // looks like I can only do this via pinata:
  console.log("Uploading to IPFS & pinning...");

  const cid = await pinataUpload(action);

  console.log(`Action ${actionName} deployed to IPFS with CID: ${cid}`);

  replaceFile(path.join(OUTPUTDIR, "ipfsCid.txt"), cid);
  //

  // const cid = fs.readFileSync(path.join(OUTPUTDIR, "ipfsCid.txt"), "utf8");
  console.log("cid");
  console.log(cid);

  console.log("Now we mint pkp and authorize the action");

  // const PROVIDER_URL = "https://chain-rpc.litprotocol.com/http";
  const LIT_NETWORK = "habanero";
  const LIT_MINTER_PRIVATE_KEY = assureEnv("LIT_MINTER_PRIVATE_KEY");

  // const provider = new ethers.JsonRpcProvider(PROVIDER_URL);
  // console.log("provider");
  // console.log(provider);
  // const wallet = new ethers.Wallet(LIT_MINTER_PRIVATE_KEY, provider);
  // console.log("wallet");
  // console.log(wallet);
  // const signer = wallet.connect(provider);
  // console.log("signer");
  // console.log(signer);
  const contractClient = new LitContracts({
    privateKey: LIT_MINTER_PRIVATE_KEY,
    network: LIT_NETWORK,
  });
  await contractClient.connect();
  console.log("contractClient connected!");
  const mintCost = await contractClient.pkpNftContract.read.mintCost();

  console.log("mintCost:", mintCost);

  const cidParsed = CID.parse(cid);
  const cidBytes = cidParsed.bytes;

  const mintInfo =
    await contractClient.pkpNftContract.write.mintGrantAndBurnNext(
      AuthMethodType.LitAction,
      cidBytes,
      {
        value: mintCost,
        gasLimit: 1000000,
      }
    );
  console.log("mintInfo:", mintInfo);

  const mintTxReceipt = await mintInfo.wait();
  console.log("mintTxReceipt:", mintTxReceipt);

  replaceFile(
    path.join(OUTPUTDIR, "mintTxReceipt.json"),
    JSON.stringify(mintTxReceipt, null, 2)
  );

  const abiForEvent = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bytes",
          name: "pubkey",
          type: "bytes",
        },
      ],
      name: "PKPMinted",
      type: "event",
    },
  ];
  const ifaceForEvent = new ethers.Interface(abiForEvent);

  let parsedLogs: any[] = [];
  for (const logIn of mintTxReceipt.logs) {
    try {
      const parsedLog = ifaceForEvent.parseLog(logIn);
      parsedLogs.push(parsedLog);
    } catch (e) {}
  }
  parsedLogs = parsedLogs.filter((log) => log !== null);
  console.log("nftCommitted logs");
  console.log(parsedLogs);
  if (parsedLogs.length !== 1) {
    throw new Error("event not found");
  }

  console.log("parsedLogs");
  console.log(parsedLogs);

  const publicKey = parsedLogs[0].args[1];
  const pkpId = new BigNumber(parsedLogs[0].args[0]).toString(16);

  // replaceFile(
  //   path.join(OUTPUTDIR, "parsedLogs.json"),
  //   JSON.stringify(parsedLogs, null, 2)
  // );

  const ethAddress = await contractClient.pkpNftContract.read.getEthAddress(
    parsedLogs[0].args[0]
  );

  console.log("ethAddress: ", ethAddress);
  replaceFile(path.join(OUTPUTDIR, "ethAddress.txt"), ethAddress);

  const jsonAction = {
    ipfsId: cid,
    publicKey,
    keyEthAddress: ethAddress,
    pkpId,
  };

  const stringifiedJsonAction = JSON.stringify(jsonAction, null, 2);

  replaceFile(path.join(OUTPUTDIR, "jsonAction.json"), stringifiedJsonAction);

  console.log("jsonAction");
  console.log(jsonAction);

  // write the deployed action json to deployed directory
  const deployedPath = `lit_actions/deployed/${actionName}.action.json`;
  replaceFile(deployedPath, stringifiedJsonAction);

  console.log("done");
};

go();
