import { ethers } from "ethers-6.12.1";

const state = {
  walletAddress: undefined as
    | undefined
    | {
        wallet: ethers.Wallet;
        address: string;
      },
};

export const getLitMinterWallet = async (
  getPrivateKey: () => string
): Promise<{
  wallet: ethers.Wallet;
  address: string;
}> => {
  if (state.walletAddress === undefined) {
    const wallet = new ethers.Wallet(getPrivateKey());
    const address = ethers.getAddress(await wallet.getAddress());
    state.walletAddress = { wallet, address };
  }
  return state.walletAddress;
};
