import { Footer, Group, Text, useMantineTheme } from "@mantine/core";
import Image from "next/image";
import nearDark from "../../assets/near-built-dark.svg";
import nearLight from "../../assets/near-built-light.svg";

const AppFooter = () => {
  const theme = useMantineTheme();

  return (
    <Footer height={60} p="md">
      <Group position="apart">
        <Image
          src={theme.colorScheme === "dark" ? nearDark : nearLight}
          alt="Built with NEAR Logo"
          height={30}
          width={100}
        />

        <Text>Dev3 - Blockchain Low-Code App Development and Automation</Text>

        <Text size="sm" color="dimmed">
          1.0.0
        </Text>
      </Group>
    </Footer>
  );
};

export default AppFooter;
