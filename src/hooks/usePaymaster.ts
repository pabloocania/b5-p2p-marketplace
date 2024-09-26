import { PrimeSdk } from "@etherspot/prime-sdk";

export const usePaymaster = async (primeSdk: PrimeSdk) => {
  const arka_api_key =
    "eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6ImE3MDA0NWM5Y2IyNTQ3ODA5ZTgwOTVjNzUwYjAyYzM1IiwiaCI6Im11cm11cjEyOCJ9";
  const arka_url = "https://arka.etherspot.io";
  const queryString = `?apiKey=${arka_api_key}&chainId=1`;

  // const estimateResult = await primeSdk.estimate({
  //     paymasterDetails: {
  //         chainId: 1,
  //         url: arka_url
  //     },
  //     key: arka_api_key
  //     context: { mode: 'sponsor' }
  // });

  const estimateResult = await primeSdk.estimate({
    paymasterDetails: {
      url: `${arka_url}${queryString}`,
      context: { mode: "sponsor" },
    },
  });

  console.log("Estimate result:", estimateResult);
  return estimateResult;
};
