/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from "@mantine/core";
import * as nearApi from "near-api-js";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useUserContext } from "../../context/UserContext";
import { useWalletSelector } from "../../context/WalletSelectorContext";
import { fetchAuthControllerNearLogin } from "../../services/api/dev3Components";

const ConnectAccount = () => {
  const { selector, modal, accounts, accountId } = useWalletSelector();
  const [loading, setLoading] = useState<boolean>(false);
  const userData = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (accountId && !loading) {
      setIsLoading(true);
      signMessage();
    }
  }, [accountId]);

  const signMessage = async () => {
    if (!accountId || loading) return;

    const { connect, keyStores } = nearApi;

    const keystore = new keyStores.BrowserLocalStorageKeyStore();

    const connectionConfig: nearApi.ConnectConfig = {
      networkId: "testnet",
      keyStore: keystore,
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org",
      headers: {},
    };

    const near = await connect(connectionConfig);
    const enc = new TextEncoder();

    const signed = await near.connection.signer.signMessage(
      enc.encode(accountId),
      accountId,
      selector.options.network.networkId
    );

    const jsonString = JSON.stringify(signed);
    onNearUser({ username: accountId, signedJsonString: jsonString });
  };

  const onError = (message: string) => {
    console.log(message);
  };

  const onNearUser = useCallback(
    async (user: { username: string; signedJsonString: string }) => {
      if (localStorage.getItem("token")) return;

      setIsLoading(true);
      console.log(new Date());
      console.log(user);
      const { token } = await fetchAuthControllerNearLogin({
        body: {
          signedJsonString: user.signedJsonString,
          username: user.username,
        },
      });

      console.log(token);
      userData.onLogin(token);
      setIsLoading(false);

      if (router.route.includes("action")) {
        return;
      }

      router.push("/");
    },
    []
  );

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet
      .signOut()
      .then(() => {
        userData.onSignOut();
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("Failed to sign out");
        console.error(err);
        onError(err.message);
      });
  };

  if (accountId) {
    return (
      <Button variant="light" onClick={handleSignOut}>
        Sign out
      </Button>
    );
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <Button
      onClick={() => {
        modal.show();
      }}
    >
      Login with NEAR wallet
    </Button>
  );
};

export default ConnectAccount;
