import { Alert, AppShell, Center, useMantineTheme } from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AlertCircle } from "tabler-icons-react";

import { useUserContext } from "../../context/UserContext";
import AppFooter from "../Footer";
import AppHeader from "../Header";
import AppNavbar from "../Navbar";

export default function AppLayout({ children }: React.PropsWithChildren<{}>) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const userData = useUserContext();
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setOpened(false);
    };
    router.events.on("routeChangeStart", handleRouteChangeStart);
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [router, setOpened]);

  const loggedOutMessage = () => {
    return (
      <Center>
        <Alert
          sx={{ width: "50%" }}
          icon={<AlertCircle size={16} />}
          title="You are not logged in"
          variant="outline"
        >
          Please log in to use Dev3.
        </Alert>
      </Center>
    );
  };

  if (router.route.includes("action")) {
    return (
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        footer={<AppFooter />}
        header={
          <AppHeader theme={theme} opened={opened} setOpened={setOpened} />
        }
      >
        <div>{children}</div>
      </AppShell>
    );
  }

  if (localStorage.getItem("user") === null) {
    return (
      <AppShell
        styles={{
          main: {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[8]
                : theme.colors.gray[0],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        footer={<AppFooter />}
        header={
          <AppHeader theme={theme} opened={opened} setOpened={setOpened} />
        }
      >
        <div>{loggedOutMessage()}</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        router.route === "/" || router.route === "/new-project" ? undefined : (
          <AppNavbar opened={opened} />
        )
      }
      footer={<AppFooter />}
      header={<AppHeader theme={theme} opened={opened} setOpened={setOpened} />}
    >
      <div>
        {localStorage.getItem("user") === null ? loggedOutMessage() : children}
      </div>
    </AppShell>
  );
}
