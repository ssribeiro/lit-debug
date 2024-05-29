import { assureEnv } from "../../dev-src";
import { LitTools } from "../lit";
import path from "path";
import fs from "fs";
import { AuthSig } from "@lit-protocol/types";

const ACTION_PATH = path.join(
  "lit_actions",
  "deployed",
  "dummy-sign.action.json"
);

const CAPACITY_DELEGATION_AUTH_SIG = path.join(
  "scripts",
  "output",
  "delegate-to-action",
  "capacityDelegationAuthSig.json"
);

const main = async () => {
  const action = JSON.parse(fs.readFileSync(ACTION_PATH, "utf8")) as {
    ipfsId: string;
    publicKey: string;
    keyEthAddress: string;
    pkpId: string;
  };
  const capacityDelegationAuthSig = JSON.parse(
    fs.readFileSync(CAPACITY_DELEGATION_AUTH_SIG, "utf8")
  ) as AuthSig;
  const actionPublicKey = action.publicKey;

  const pkpSessionSigs =
    await LitTools.node.getSessionSigsFromCapacityDelegation(
      async () => LitTools.node.getLitClient("habanero"),
      async () =>
        LitTools.node.getAuthSign(
          async () => LitTools.node.getLitClient("habanero"),
          async () =>
            LitTools.node.getLitMinterWallet(() =>
              assureEnv("LIT_ACTION_CALLER_PRIVATE_KEY")
            )
        ),
      () => capacityDelegationAuthSig,
      () => actionPublicKey
    );

  console.log("pkpSessionSigs:", pkpSessionSigs);

  const litNodeClient = await LitTools.node.getLitClient("habanero");

  const res = await litNodeClient.executeJs({
    sessionSigs: pkpSessionSigs,
    ipfsId: action.ipfsId,
    authMethods: [],
    jsParams: {
      publicKey: action.publicKey,
    },
  });

  console.log("signature result ", res);
};

main();
