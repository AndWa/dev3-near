import { Divider, MediaQuery, Navbar, Stack } from "@mantine/core";

import { useSelectedProject } from "../../context/SelectedProjectContext";
import { AccountDetails } from "../AccountDetails";
import ProjectSelector from "../ProjectSelector";
import { AppLinks, AppLinksBottom } from "./Links.component";
import { ProjectDetails } from "./ProjectDetails";

export interface AdminNavbarProps {
  opened: boolean;
}

const AppNavbar = ({ opened }: AdminNavbarProps) => {
  const { projectId } = useSelectedProject();

  return (
    <Navbar hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
      <Navbar.Section>
        <ProjectSelector />
      </Navbar.Section>
      <Navbar.Section bg="100" p="sm">
        <ProjectDetails />
      </Navbar.Section>
      <Divider />

      <Navbar.Section p="sm">
        <AppLinks disabled={!projectId} />
      </Navbar.Section>
      <Divider />
      <Navbar.Section grow p="sm">
        <AppLinksBottom disabled={!projectId} />
      </Navbar.Section>
      <Navbar.Section>
        <MediaQuery largerThan="md" styles={{ display: "none" }}>
          <Stack p="xs">
            <AccountDetails />
          </Stack>
        </MediaQuery>
      </Navbar.Section>
    </Navbar>
  );
};

export default AppNavbar;
