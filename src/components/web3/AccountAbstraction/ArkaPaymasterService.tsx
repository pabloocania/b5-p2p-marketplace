import { ArkaPaymaster } from "@etherspot/prime-sdk/dist/sdk/paymaster/provider/arka";

export const arka_api_key = process.env.NEXT_PUBLIC_ARKA_KEY;
export const arka_url = "https://arka.etherspot.io";
export const queryString = `?apiKey=${arka_api_key}&chainId=`;

let arkaPaymasterInstance: ArkaPaymaster | null = null;

export const getArkaPaymasterService = (chainId: number): ArkaPaymaster => {
  if (!arkaPaymasterInstance) {
    arkaPaymasterInstance = new ArkaPaymaster(
      chainId,
      arka_api_key + "&useVp=true",
      arka_url
    );
  }
  return arkaPaymasterInstance;
};

export const whitelistPaymaster = async (address: string): Promise<boolean> => {
  if (!arkaPaymasterInstance) {
    throw new Error("Arka instance is not initialized.");
  }
  const isWhitelisted = await arkaPaymasterInstance.checkWhitelist(address);
  if (isWhitelisted !== "Already added") {
    console.log("whitelisting...");
    try {
      const response = await arkaPaymasterInstance.addWhitelist([address]);
      console.log("Got whitelisting response", response);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  return false;
};
