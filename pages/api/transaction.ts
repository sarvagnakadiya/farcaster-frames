import { NextApiRequest, NextApiResponse } from "next";
import {
  FrameRequest,
  FrameValidationData,
  getFrameMessage,
} from "@coinbase/onchainkit/frame";
import token_abi from "../../GovernanceToken.json";
import { ethers } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Request received:", req.method);

  if (req.method !== "POST") {
    console.log("Invalid method:", req.method);
    return res.status(400).json({ message: "Invalid Method" });
  }

  try {
    const getFarcasterAccountAddress = (
      interactor: FrameValidationData["interactor"]
    ) => {
      const address =
        interactor.verified_accounts[0] ?? interactor.custody_address;
      console.log("Farcaster Account Address:", address);
      return address;
    };

    try {
      const { isValid, message } = await getFrameMessage(
        req.body as FrameRequest
      );

      if (
        !isValid ||
        !message ||
        !message.raw ||
        !message.raw.action ||
        !message.raw.action.url
      ) {
        console.error("Message is invalid:", message);
        console.log("Frame message validation:", isValid);

        // Extract address from the URL if message is defined
        const url = message?.raw?.action?.url ?? "";
        const addressMatch = url.match(/\/([0-9a-fA-F]{40})(?:\?|$)/);
        const delegateAddress = addressMatch ? addressMatch[1] : null;

        console.log("the URL:", url);
        console.log("Extracted Delegate Address:", delegateAddress);

        return res.status(400).json({ message: "Invalid Frame Message" });
      }

      // Get the account address
      const accountAddress = getFarcasterAccountAddress(message?.interactor);
      console.log("Account Address:", accountAddress);

      const encodeData = async (address: string) => {
        const contractInterface = new ethers.Interface(token_abi.abi);
        const encodedData = contractInterface.encodeFunctionData("delegate", [
          address,
        ]);
        console.log("Encoded Data:", encodedData);
        return encodedData;
      };

      const data = await encodeData(accountAddress);
      console.log("Data for transaction:", data);

      // Return the transaction frame
      return res.status(200).json({
        chainId: "eip155:42161",
        method: "eth_sendTransaction",
        params: {
          abi: token_abi,
          to: "0x912ce59144191c1204e64559fe8253a0e49e6548",
          data: data,
          value: "0",
        },
      });
    } catch (innerError: any) {
      console.error("Error inside processing logic:", innerError.message);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: innerError.message });
    }
  } catch (error: any) {
    console.error("Error in handler:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
