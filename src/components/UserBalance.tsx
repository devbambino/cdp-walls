"use client";
import { LoadingSkeleton } from "@coinbase/cdp-react/components/ui/LoadingSkeleton";

interface Props {
  balance?: string;
  faucetUrl?: string;
  faucetName?: string;
}

/**
 * A component that displays the user's balance.
 *
 * @param {Props} props - The props for the UserBalance component.
 * @param {string} [props.balance] - The user's balance.
 * @returns A component that displays the user's balance.
 */
export default function UserBalance(props: Props) {
  const { balance, faucetUrl, faucetName } = props;
  const isSolana = !!process.env.NEXT_PUBLIC_CDP_CREATE_SOLANA_ACCOUNT;

  return (
    <>
      <h2 className="card-title">Available balance</h2>
      <p className="user-balance flex-col-container flex-grow">
        {balance === undefined && <LoadingSkeleton as="span" className="loading--balance" />}
        {balance !== undefined && (
          <span className="flex-row-container">
            <img src={isSolana ? "/sol.svg" : "/eth.svg"} alt="" className="balance-icon" />
            <span>{balance}</span>
            <span className="sr-only">{isSolana ? "Solana" : "Ethereum"}</span>
          </span>
        )}
      </p>
      {faucetUrl && faucetName && (
        <p>
          Get testnet {isSolana ? "SOL" : "ETH"} from{" "}
          <a href={faucetUrl} target="_blank" rel="noopener noreferrer">
            {faucetName}
          </a>
        </p>
      )}
    </>
  );
}
