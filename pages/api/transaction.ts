import { NextApiRequest, NextApiResponse } from 'next';
import {
  FrameRequest,
  FrameValidationData,
  getFrameMessage,
} from '@coinbase/onchainkit/src/frame';
import token_abi from '../../GovernanceToken.json';
import { ethers } from 'ethers';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Request received:', req.method);

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(400).json({ message: 'Invalid Method' });
  }

  try {
    const getFarcasterAccountAddress = (
      interactor: FrameValidationData['interactor']
    ) => {
      const address =
        interactor.verified_accounts[0] ?? interactor.custody_address;
      console.log('Farcaster Account Address:', address);
      return address;
    };

    try {
      const { isValid, message } = await getFrameMessage(
        req.body as FrameRequest
      );
      console.log('Frame message validation:', isValid);

      if (!isValid) {
        console.error('Message is invalid:', message);
        return res.status(400).json({ message: 'Invalid Frame Message' });
      }

      // Get the account address
      const accountAddress = getFarcasterAccountAddress(message.interactor);
      console.log('Account Address:', accountAddress);

      const encodeData = async (address: string) => {
        const contractInterface = new ethers.Interface(token_abi.abi);
        const encodedData = contractInterface.encodeFunctionData('delegate', [
          address,
        ]);
        console.log('Encoded Data:', encodedData);
        return encodedData;
      };

      const data = await encodeData(accountAddress);
      console.log('Data for transaction:', data);

      // Return the transaction frame
      return res.status(200).json({
        chainId: 'eip155:10',
        method: 'eth_sendTransaction',
        params: {
          abi: token_abi,
          to: '0x4200000000000000000000000000000000000042',
          data: data,
          value: '0',
        },
      });
    } catch (innerError: any) {
      console.error('Error inside processing logic:', innerError.message);
      return res
        .status(500)
        .json({ message: 'Internal Server Error', error: innerError.message });
    }
  } catch (error: any) {
    console.error('Error in handler:', error.message);
    return res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
}
