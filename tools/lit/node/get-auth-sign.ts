import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AuthSig } from "@lit-protocol/types";
import { ethers } from "ethers-6.12.1";
import * as siwe from "siwe";

export const getAuthSign = async (
  getLitClient: () => Promise<LitNodeClient>,
  getLitMinterWallet: () => Promise<{ wallet: ethers.Wallet; address: string }>,
  getMessageDetails: () => {
    domain: string;
    origin: string;
    statement: string;
  } = () => ({
    domain: "localhost",
    origin: "https://localhost/login",
    statement: "This is a test statement.  You can put anything you want here.",
  }),
  getExpirationTimeMs: () => number = () => 60 * 60 * 1000
): Promise<AuthSig> => {
  const litNodeClient = await getLitClient();
  const nonce = await litNodeClient.getLatestBlockhash();
  // Initialize the signer
  const { wallet, address } = await getLitMinterWallet();
  // Craft the SIWE message
  const { domain, origin, statement } = getMessageDetails();
  const expirationTimeMs = getExpirationTimeMs();
  // expiration time in ISO 8601 format.  This is milliseconds in future.
  const expirationTime = new Date(Date.now() + expirationTimeMs).toISOString();

  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: "1",
    chainId: 1,
    nonce,
    expirationTime,
  });
  const messageToSign = siweMessage.prepareMessage();

  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  const authSig: AuthSig = {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: address,
  };

  return authSig;
};
