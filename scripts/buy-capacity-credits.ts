import { LitContracts } from "@lit-protocol/contracts-sdk";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { assureEnv } from "../dev-src";

const LIT_NETWORK = "habanero";
const OUTPUTDIR = path.join("scripts", "output", "buy-capacity-credits");

const replaceFile = (path: string, content: string) => {
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
  fs.writeFileSync(path, content);
};

const program = async () => {
  console.log("Starting.");

  // console.log("walletWithCapacityCredit");
  // console.log(walletWithCapacityCredit);
  let contractClient = new LitContracts({
    privateKey: assureEnv("LIT_MINTER_PRIVATE_KEY"),
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
  process.exit(0);
};

program();
