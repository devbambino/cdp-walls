"use client";

import { useEvmAddress, useIsSignedIn, useSolanaAddress } from "@coinbase/cdp-hooks";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from "react";
import {
  createPublicClient,
  http,
  formatEther,
  type PublicClient,
  type Transport,
  type Address,
} from "viem";
import { baseSepolia, base } from "viem/chains";

import FundWallet from "@/components/FundWallet";
import Header from "@/components/Header";
import UserBalance from "@/components/UserBalance";

// Dynamically determine component path for EVM transactions
const getEVMComponentPath = () => {
  const isSmartAccount = process.env.NEXT_PUBLIC_CDP_CREATE_ETHEREUM_ACCOUNT_TYPE === "smart";

  if (isSmartAccount) {
    return "@/components/SmartAccountTransaction";
  } else {
    return "@/components/EOATransaction";
  }
};

const EVMTransactionComponent = lazy(() => import(/* @vite-ignore */ getEVMComponentPath()));
const SolanaTransactionComponent = lazy(() => import("@/components/SolanaTransaction"));

/**
 * Create a viem client to access user's balance on the Base network
 */
const client = createPublicClient({
  chain: base,
  transport: http(),
});

/**
 * Create a viem client to access user's balance on the Base Sepolia network
 */
const sepoliaClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

/**
 * Create a Solana connection to access user's balance on Solana Mainnet
 */
const solanaMainnetConnection = new Connection(clusterApiUrl("mainnet-beta"));

/**
 * Create a Solana connection to access user's balance on Solana Devnet
 */
const solanaDevnetConnection = new Connection(clusterApiUrl("devnet"));

const useEvmBalance = (
  address: Address | null,
  client: PublicClient<Transport, typeof base | typeof baseSepolia, undefined, undefined>,
  poll = false,
) => {
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  const formattedBalance = useMemo(() => {
    if (balance === undefined) return undefined;
    return formatEther(balance);
  }, [balance]);

  const getBalance = useCallback(async () => {
    if (!address) return;
    const balance = await client.getBalance({ address });
    setBalance(balance);
  }, [address, client]);

  useEffect(() => {
    if (!poll) {
      return;
    }
    getBalance();
    const interval = setInterval(getBalance, 500);
    return () => clearInterval(interval);
  }, [getBalance, poll]);

  return { balance, formattedBalance, getBalance };
};

const useSolanaBalance = (address: string | null, connection: Connection, poll = false) => {
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  const formattedBalance = useMemo(() => {
    if (balance === undefined) return undefined;
    // Convert lamports to SOL
    return formatSol(Number(balance));
  }, [balance]);

  const getBalance = useCallback(async () => {
    if (!address) return;
    try {
      const lamports = await connection.getBalance(new PublicKey(address));
      setBalance(BigInt(lamports));
    } catch (error) {
      console.error("Error fetching Solana balance:", error);
      setBalance(BigInt(0));
    }
  }, [address, connection]);

  useEffect(() => {
    if (!poll) {
      return;
    }
    getBalance();
    const interval = setInterval(getBalance, 500);
    return () => clearInterval(interval);
  }, [getBalance, poll]);

  return { balance, formattedBalance, getBalance };
};

/**
 * Format a Solana balance.
 *
 * @param lamports - The balance in lamports.
 * @returns The formatted balance.
 */
function formatSol(lamports: number) {
  const maxDecimalPlaces = 9;
  const roundedStr = (lamports / LAMPORTS_PER_SOL).toFixed(maxDecimalPlaces);
  return roundedStr.replace(/0+$/, "").replace(/\.$/, "");
}

/**
 * The Signed In screen with onramp support for both EVM and Solana
 */
export default function SignedInScreen() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const { solanaAddress } = useSolanaAddress();

  const { formattedBalance, getBalance } = useEvmBalance(evmAddress, client, true);
  const { formattedBalance: formattedBalanceSepolia, getBalance: getBalanceSepolia } =
    useEvmBalance(evmAddress, sepoliaClient, true);

  const { formattedBalance: formattedBalanceSolana, getBalance: getBalanceSolana } =
    useSolanaBalance(solanaAddress, solanaMainnetConnection);
  const { formattedBalance: formattedBalanceSolanaDevnet, getBalance: getBalanceSolanaDevnet } =
    useSolanaBalance(solanaAddress, solanaDevnetConnection, true);

  return (
    <>
      <Header />
      <main className="main flex-col-container flex-grow">
        {evmAddress && (
          <>
            <p className="page-heading">Fund your EVM wallet on Base</p>
            <div className="main-inner flex-col-container">
              <div className="card card--user-balance">
                <UserBalance balance={formattedBalance} />
              </div>
              <div className="card card--transaction">
                {isSignedIn && (
                  <FundWallet
                    onSuccess={getBalance}
                    network="base"
                    cryptoCurrency="eth"
                    destinationAddress={evmAddress}
                  />
                )}
              </div>
            </div>
            <hr className="page-divider" />
            <p className="page-heading">Send an EVM transaction on Base Sepolia</p>
            <div className="main-inner flex-col-container">
              <div className="card card--user-balance">
                <UserBalance
                  balance={formattedBalanceSepolia}
                  faucetName="Base Sepolia Faucet"
                  faucetUrl="https://portal.cdp.coinbase.com/products/faucet"
                />
              </div>
              <div className="card card--transaction">
                {isSignedIn && (
                  <Suspense fallback={<div>Loading transaction component...</div>}>
                    <EVMTransactionComponent
                      balance={formattedBalanceSepolia}
                      onSuccess={getBalanceSepolia}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </>
        )}

        {solanaAddress && (
          <>
            {evmAddress && <hr className="page-divider" />}
            <p className="page-heading">Fund your Solana wallet on Mainnet</p>
            <div className="main-inner flex-col-container">
              <div className="card card--user-balance">
                <UserBalance balance={formattedBalanceSolana} />
              </div>
              <div className="card card--transaction">
                {isSignedIn && (
                  <FundWallet
                    onSuccess={getBalanceSolana}
                    network="solana"
                    cryptoCurrency="sol"
                    destinationAddress={solanaAddress}
                  />
                )}
              </div>
            </div>
            <hr className="page-divider" />
            <p className="page-heading">Send a Solana transaction on Devnet</p>
            <div className="main-inner flex-col-container">
              <div className="card card--user-balance">
                <UserBalance
                  balance={formattedBalanceSolanaDevnet}
                  faucetName="Solana Devnet Faucet"
                  faucetUrl="https://portal.cdp.coinbase.com/products/faucet?network=solana-devnet"
                />
              </div>
              <div className="card card--transaction">
                {isSignedIn && (
                  <Suspense fallback={<div>Loading transaction component...</div>}>
                    <SolanaTransactionComponent onSuccess={getBalanceSolanaDevnet} />
                  </Suspense>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
