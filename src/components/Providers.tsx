"use client";

import { CDPReactProvider, type Config } from "@coinbase/cdp-react/components/CDPReactProvider";

import { theme } from "@/components/theme";

interface ProvidersProps {
  children: React.ReactNode;
}

const ethereumAccountType = process.env.NEXT_PUBLIC_CDP_CREATE_ETHEREUM_ACCOUNT_TYPE
  ? process.env.NEXT_PUBLIC_CDP_CREATE_ETHEREUM_ACCOUNT_TYPE === "smart"
    ? "smart"
    : "eoa"
  : undefined;

const solanaAccountType = process.env.NEXT_PUBLIC_CDP_CREATE_SOLANA_ACCOUNT
  ? process.env.NEXT_PUBLIC_CDP_CREATE_SOLANA_ACCOUNT === "true"
  : undefined;

if (!ethereumAccountType && !solanaAccountType) {
  throw new Error(
    "Either NEXT_PUBLIC_CDP_CREATE_ETHEREUM_ACCOUNT_TYPE or NEXT_PUBLIC_CDP_CREATE_SOLANA_ACCOUNT must be defined",
  );
}

const CDP_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
  ...(ethereumAccountType && {
    ethereum: {
      createOnLogin: ethereumAccountType,
    },
  }),
  ...(solanaAccountType && {
    solana: {
      createOnLogin: solanaAccountType,
    },
  }),
  appName: "CDP Next.js StarterKit",
  appLogoUrl: "http://localhost:3000/logo.svg",
  authMethods: ["email", "sms"],
} as Config;

/**
 * Providers component that wraps the application in all requisite providers
 *
 * @param props - { object } - The props for the Providers component
 * @param props.children - { React.ReactNode } - The children to wrap
 * @returns The wrapped children
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <CDPReactProvider config={CDP_CONFIG} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}
