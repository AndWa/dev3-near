import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useColorScheme, useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { NotificationsProvider } from "@mantine/notifications";
import "@near-wallet-selector/modal-ui/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppProps } from "next/app";
import Head from "next/head";

import AppLayout from "../components/layout/app.layout";
import { AccountProvider } from "../context/AccountContext";
import { SelectedProjectProvider } from "../context/SelectedProjectContext";
import { UserContextProvider } from "../context/UserContext";
import { WalletSelectorContextProvider } from "../context/WalletSelectorContext";

const queryClient = new QueryClient();

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  const preferredColorScheme = useColorScheme();

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <>
      <Head>
        <title>Dev3</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" type="image/x-icon" href="./dev3-favicon.png"></link>
      </Head>

      <QueryClientProvider client={queryClient}>
        <UserContextProvider>
          <WalletSelectorContextProvider>
            <SelectedProjectProvider>
              <AccountProvider>
                <ColorSchemeProvider
                  colorScheme={colorScheme}
                  toggleColorScheme={toggleColorScheme}
                >
                  <MantineProvider
                    withGlobalStyles
                    withNormalizeCSS
                    theme={{
                      colorScheme,
                    }}
                  >
                    <ModalsProvider>
                      <NotificationsProvider>
                        <AppLayout>
                          <Component {...pageProps} />
                        </AppLayout>
                      </NotificationsProvider>
                    </ModalsProvider>
                  </MantineProvider>
                </ColorSchemeProvider>
              </AccountProvider>
            </SelectedProjectProvider>
          </WalletSelectorContextProvider>
        </UserContextProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  );
}
