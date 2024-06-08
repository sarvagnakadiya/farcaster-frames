import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers'; // Import ethers library
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import abi from '../GovernanceToken.json';
import { FrameValidationData } from '@coinbase/onchainkit';
import { FrameRequest, getFrameMessage } from '@coinbase/onchainkit/frame';

const Home: NextPage = () => {
  const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL;

  const contractAddress = '0x4200000000000000000000000000000000000042'; // Replace with your contract address

  // Handle delegate function
  const handleDelegate = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi.abi, signer);
    try {
      const tx = await contract.delegate(
        '0x97861976283e6901b407D1e217B72c4007D9F64D'
      );
      await tx.wait();
      console.log('Delegate successful');
    } catch (error) {
      console.error('Contract write failed', error);
    }
  };

  const getFarcasterAccountAddress = (
    interactor: FrameValidationData['interactor']
  ) => {
    // Get the first verified account or the custody address
    console.log(interactor.verified_accounts[0] ?? interactor.custody_address);
    return interactor.verified_accounts[0] ?? interactor.custody_address;
  };

  async function getResponse(frameRequest: FrameRequest) {
    const { isValid, message } = await getFrameMessage(frameRequest);

    isValid
      ? console.log('Message is valid:', message)
      : console.error('Message is invalid:', message);

    return { isValid, message };
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>JAY AMBE BLOCKCHAIN WORKS</title>
        <meta
          name="description"
          content="A DEMO PROJECT FOR FARCASTER FRAMES"
        />
        <meta property="og:title" content="THE OG TITLE" />
        <meta property="og:description" content="THE OG DESC" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${HOST_URL}/GTR.jpg`} />
        <meta
          property="fc:frame:image"
          content="https://www.example.com/path-to-open-source-image.jpg"
        />
        <meta property="fc:frame:button:1" content="Delegate" />
        <meta property="fc:frame:button:1:action" content="tx" />
        <meta
          property="fc:frame:button:1:target"
          content={`${HOST_URL}/api/transactions`}
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <ConnectButton />
        <h1>JAY AMBE BLOCKCHAIN WORKS...</h1>
        <h1>{HOST_URL}</h1>
        <button onClick={handleDelegate}>delegate</button>
      </main>

      <footer className={styles.footer}>
        <a href="https://rainbow.me" rel="noopener noreferrer" target="_blank">
          Made with ❤️
        </a>
      </footer>
    </div>
  );
};

export default Home;
