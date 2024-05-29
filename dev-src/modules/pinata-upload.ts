import pinataSDK from "@pinata/sdk";
import { Readable } from "stream";
import { assureEnv } from "../";

export const pinataUpload = async (data: string): Promise<string> => {
  const API = assureEnv("PINATA_API");
  const SECRET = assureEnv("PINATA_SECRET");
  const pinata = new pinataSDK(API, SECRET);

  const buffer = Buffer.from(data, "utf8");
  const stream = Readable.from(buffer);

  // @ts-ignore
  stream.path = "string.txt";

  const res = await pinata
    .pinFileToIPFS(stream, {
      pinataMetadata: { name: "AlphaCapture Pin Software" },
    })
    .catch((e) => {
      console.log(e);
      throw new Error("Failed to upload to pinata");
    });

  return res.IpfsHash;
};
