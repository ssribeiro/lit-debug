import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";

const state = {
  client: undefined as LitNodeClient | undefined,
  got: false as boolean,
  getting: false as boolean,
};

export const getLitClient = async (
  litNetwork: LIT_NETWORKS_KEYS = "habanero",
  debug: boolean = true
): Promise<LitNodeClient> => {
  while (state.getting) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (!state.got) {
    state.getting = true;
    state.client = new LitNodeClient({
      litNetwork,
      checkNodeAttestation: true,
      debug,
    });
    await state.client.connect();
    state.got = true;
    state.getting = false;
  }
  return state.client!;
};

export const disconnectLitClient = async () => {
  while (state.getting) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  if (state.got) {
    await state.client!.disconnect();
    state.got = false;
    state.client = undefined;
  }
};
