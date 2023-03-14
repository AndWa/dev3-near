import {
  ActionIcon,
  CopyButton,
  Group,
  Paper,
  Tooltip,
  Text,
} from "@mantine/core";
import React from "react";
import { Check, Copy, ExternalLink } from "tabler-icons-react";
import * as nearApi from "near-api-js";

import { useUserContext } from "../../context/UserContext";
import WalletConnectButton from "../WalletConnectButton";
import { useAccount } from "../../context/AccountContext";

export const AccountDetails = () => {
  const userContext = useUserContext();
  const { account } = useAccount();

  return (
    <>
      <Paper hidden={!userContext.user} p="xs" withBorder>
        <Group spacing={4}>
          <Text>Account Id: </Text>
          <Text color="dimmed">{userContext.user?.nearWalletAccountId}</Text>
          <CopyButton
            value={userContext.user?.nearWalletAccountId ?? ""}
            timeout={2000}
          >
            {({ copied, copy }) => (
              <Tooltip
                label={copied ? "Copied" : "Copy"}
                withArrow
                position="bottom"
              >
                <ActionIcon
                  radius="xl"
                  variant="light"
                  color={copied ? "teal" : "gray"}
                  onClick={copy}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
          <Tooltip label="View on NEAR Explorer" withArrow position="bottom">
            <ActionIcon
              radius="xl"
              variant="light"
              component="a"
              target="_blank"
              href={`https://explorer.testnet.near.org/accounts/${userContext.user?.nearWalletAccountId}`}
            >
              <ExternalLink size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>

      <Paper p="xs" withBorder hidden={!userContext.user}>
        <Group spacing={4}>
          <Text>Balance: </Text>
          <Text color="dimmed">
            {nearApi.utils.format.formatNearAmount(account?.amount ?? "0", 2)} Ⓝ
          </Text>
          <Tooltip
            label="Get more NEAR using faucet"
            withArrow
            position="bottom"
          >
            <ActionIcon
              radius="xl"
              variant="light"
              component="a"
              target="_blank"
              href="https://near-faucet.io/"
            >
              <ExternalLink size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Paper>

      <WalletConnectButton />
    </>
  );
};
