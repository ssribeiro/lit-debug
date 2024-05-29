import "dotenv/config";

export const assureEnv = (key: string): string => {
  if (process.env[key] === undefined) {
    console.error(`Error: Missing environment variable ${key}`);
    process.exit(1);
  }
  return process.env[key]!;
};

export const maybeEnv = (key: string): string | undefined => {
  return process.env[key];
};
