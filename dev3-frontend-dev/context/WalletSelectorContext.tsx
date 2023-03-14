import type { AccountState, WalletSelector } from "@near-wallet-selector/core";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupDefaultWallets } from "@near-wallet-selector/default-wallets";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupNightlyConnect } from "@near-wallet-selector/nightly-connect";
import { setupSender } from "@near-wallet-selector/sender";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import * as nearApi from "near-api-js";
import { ContractCodeView } from "near-api-js/lib/providers/provider";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { distinctUntilChanged, map } from "rxjs";

import { DEV3_CONTRACT_ID, NO_DEPOSIT, THIRTY_TGAS } from "../utils/near";

declare global {
  interface Window {
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }
}

interface WalletSelectorContextValue {
  selector: WalletSelector;
  modal: WalletSelectorModal;
  accounts: Array<AccountState>;
  accountId: string | null;
  nearConnection: nearApi.Near | null;
  provider: nearApi.providers.JsonRpcProvider | null;
  viewMethod: (contractId: string, method: string, args: any) => Promise<any>;
  callMethod: (
    contractId: string,
    method: string,
    args?: any,
    deposit?: string,
    gas?: string
  ) => Promise<void | nearApi.providers.FinalExecutionOutcome>;
  getViewCode(contractId: string): Promise<ContractCodeView | undefined>;
}

const WalletSelectorContext =
  React.createContext<WalletSelectorContextValue | null>(null);

export const WalletSelectorContextProvider = ({ children }: any) => {
  const [selector, setSelector] = useState<WalletSelector | null>(null);
  const [modal, setModal] = useState<WalletSelectorModal | null>(null);
  const [accounts, setAccounts] = useState<Array<AccountState>>([]);
  const [nearConnection, setNearConnection] = useState<nearApi.Near | null>(
    null
  );

  const provider = useMemo(() => {
    if (!selector?.options) {
      return null;
    }
    const { network } = selector.options;

    return new nearApi.providers.JsonRpcProvider({ url: network.nodeUrl });
  }, [selector?.options]);

  const viewMethod = useCallback(
    async (contractId: string, method: string, args: any = {}) => {
      if (!provider) return;

      let res = await provider.query({
        request_type: "call_function",
        account_id: contractId,
        method_name: method,
        args_base64: Buffer.from(JSON.stringify(args)).toString("base64"),
        finality: "optimistic",
      });

      return JSON.parse(Buffer.from((res as any).result).toString());
    },
    [provider]
  );

  const getViewCode = useCallback(
    async (contractId: string) => {
      if (!provider) return;

      return await provider.query<ContractCodeView>({
        account_id: contractId,
        finality: "final",
        request_type: "view_code",
      });
    },
    [provider]
  );

  const callMethod = useCallback(
    async (
      contractId: string,
      method: string,
      args: any = {},
      deposit: string = NO_DEPOSIT,
      gas: string = THIRTY_TGAS
    ) => {
      if (!selector) return;
      const wallet = await selector.wallet();

      return await wallet.signAndSendTransaction({
        signerId: accounts[0].accountId,
        receiverId: contractId,
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: method,
              args,
              gas,
              deposit,
            },
          },
        ],
      });
    },
    [selector]
  );

  const init = useCallback(async () => {
    const { connect, keyStores, WalletConnection } = nearApi;

    const connectionConfig = {
      networkId: "testnet",
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org",
      explorerUrl: "https://explorer.testnet.near.org",
    };

    // connect to NEAR
    const nearConnection = await connect(connectionConfig);
    setNearConnection(nearConnection);

    const _selector = await setupWalletSelector({
      network: "testnet",
      debug: true,
      modules: [
        ...(await setupDefaultWallets()),
        setupNearWallet(),
        setupSender(),
        setupMathWallet(),
        setupNightly(),
        setupMeteorWallet(),
        setupWalletConnect({
          projectId: "test...",
          metadata: {
            name: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            url: "https://github.com/near/wallet-selector",
            icons: ["https://avatars.githubusercontent.com/u/37784886"],
          },
        }),
        setupNightlyConnect({
          url: "wss://relay.nightly.app/app",
          appMetadata: {
            additionalInfo: "",
            application: "NEAR Wallet Selector",
            description: "Example dApp used by NEAR Wallet Selector",
            icon: "https://near.org/wp-content/uploads/2020/09/cropped-favicon-192x192.png",
          },
        }),
      ],
    });
    const _modal = setupModal(_selector, {
      contractId: DEV3_CONTRACT_ID as string,
      // theme: "light", // doesn't work, need to open an issue on github
    });
    const state = _selector.store.getState();

    setAccounts(state.accounts);

    window.selector = _selector;
    window.modal = _modal;

    setSelector(_selector);
    setModal(_modal);
  }, []);

  useEffect(() => {
    init().catch((err) => {
      console.error(err);
      alert("Failed to initialise wallet selector");
    });
  }, [init]);

  useEffect(() => {
    if (!selector) {
      return;
    }

    const subscription = selector.store.observable
      .pipe(
        map((state) => state.accounts),
        distinctUntilChanged()
      )
      .subscribe((nextAccounts) => {
        console.log("Accounts Update", nextAccounts);

        setAccounts(nextAccounts);
      });

    return () => subscription.unsubscribe();
  }, [selector]);

  if (!selector || !modal) {
    return null;
  }

  const accountId =
    accounts.find((account) => account.active)?.accountId || null;

  return (
    <WalletSelectorContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
        nearConnection,
        callMethod,
        viewMethod,
        provider,
        getViewCode,
      }}
    >
      {children}
    </WalletSelectorContext.Provider>
  );
};

export function useWalletSelector() {
  const context = useContext(WalletSelectorContext);

  if (!context) {
    throw new Error(
      "useWalletSelector must be used within a WalletSelectorContextProvider"
    );
  }

  return context;
}
