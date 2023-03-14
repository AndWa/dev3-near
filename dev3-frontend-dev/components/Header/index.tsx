import {
  Burger,
  Flex,
  Group,
  Header,
  MantineTheme,
  MediaQuery,
} from "@mantine/core";
import Image from "next/image";
import { SetStateAction } from "react";
import {
  NotificationBell,
  NovuProvider,
  PopoverNotificationCenter,
} from "@novu/notification-center";
import { useRouter } from "next/router";
import { NextLink } from "@mantine/next";

import logoDark from "../../assets/dev3-dark.png";
import logoLight from "../../assets/dev3-light.png";
import { useUserContext } from "../../context/UserContext";
import ThemeTogglerButton from "../ThemeTogglerButton";
import { AccountDetails } from "../AccountDetails";

export interface AdminHeaderProps {
  theme: MantineTheme;
  opened: boolean;
  setOpened: (value: SetStateAction<boolean>) => void;
}

const AppHeader = ({ theme, opened, setOpened }: AdminHeaderProps) => {
  const router = useRouter();

  function onNotificationClick(notification: any) {
    router.push(notification.cta.data.url);
  }

  const userContext = useUserContext();

  return (
    <Header height={70} p="md">
      <Flex align="center" h="100%" justify="space-between">
        <Group noWrap>
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="sm"
              color={theme.colors.gray[6]}
            />
          </MediaQuery>

          <NextLink href="/">
            <Image
              src={theme.colorScheme === "dark" ? logoDark : logoLight}
              alt="Dev3 Logo"
              height={40}
              width={120}
            />
          </NextLink>
        </Group>

        <Group>
          <MediaQuery smallerThan="md" styles={{ display: "none" }}>
            <Group>
              <AccountDetails />
            </Group>
          </MediaQuery>
          {/* 
          {userContext.user && (
            <NovuProvider
              subscriberId={userContext.user.nearWalletAccountId}
              applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID || ""}
            >
              <PopoverNotificationCenter
                colorScheme={theme.colorScheme === "dark" ? "dark" : "light"}
                onNotificationClick={onNotificationClick}
              >
                {({ unseenCount }) => (
                  <NotificationBell unseenCount={unseenCount} />
                )}
              </PopoverNotificationCenter>
            </NovuProvider>
          )} */}

          <ThemeTogglerButton />
        </Group>
      </Flex>
    </Header>
  );
};

export default AppHeader;
