import { getAuthSign } from "./node/get-auth-sign";
import { getLitClient } from "./node/get-lit-client";
import { getLitMinterWallet } from "./node/get-lit-minter-wallet";
import { getSessionSigsFromCapacityDelegation } from "./node/get-session-sigs-from-capacity-delegation";
import { getSessionSigsLitAction } from "./node/get-session-sigs-lit-action";

export const LitTools = {
  node: {
    getLitClient,
    getAuthSign,
    getLitMinterWallet,
    getSessionSigsFromCapacityDelegation,
    getSessionSigsLitAction,
  },
};
