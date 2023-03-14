import {
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Menu,
  Skeleton,
  Text,
  UnstyledButton,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { Plus, Selector } from "tabler-icons-react";

import { useSelectedProject } from "../../context/SelectedProjectContext";
import { useProjectControllerFindAll } from "../../services/api/dev3Components";
import { Project } from "../../services/api/dev3Schemas";
import { getLogoPlaceholder, getLogoUrl } from "../../utils/logo";

const ProjectSelector = () => {
  const { setProjectId, projectId } = useSelectedProject();

  const { isLoading, error, data } = useProjectControllerFindAll(
    {
      queryParams: { limit: 100 },
    },
    {
      onSuccess: (data) => {
        if (!projectId && data.results.length) {
          handleSelect(data.results[0]);
        }
      },
    }
  );

  const selectedProject = useMemo(() => {
    return data?.results.find((project) => (project as any)._id === projectId);
  }, [projectId, data?.results]);

  const handleSelect = (project: Project) => {
    return () => {
      setProjectId((project as any)._id);
    };
  };

  if (error) {
    return <Text>Error: {error.payload}</Text>;
  }

  if (data?.results?.length === 0) {
    return (
      <Box p="xs">
        <Link href="/new-project" passHref>
          <Button fullWidth leftIcon={<Plus size={14} />}>
            Create new project
          </Button>
        </Link>
      </Box>
    );
  }

  return (
    <Menu transition="fade" position="bottom" width="90%">
      <Menu.Target>
        <UnstyledButton
          sx={(theme) => ({
            display: "block",
            width: "100%",
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            color:
              theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

            "&:hover": {
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[8]
                  : theme.colors.gray[0],
            },
          })}
        >
          <Skeleton visible={isLoading}>
            <Group>
              <Avatar
                size="lg"
                radius="sm"
                alt="Project logo"
                src={selectedProject ? getLogoUrl(selectedProject.logo) : null}
                color="blue"
              >
                {selectedProject
                  ? getLogoPlaceholder(selectedProject?.name)
                  : ""}
              </Avatar>

              <Group position="apart" sx={{ flex: 1 }}>
                <Text size="sm" color="dimmed">
                  {selectedProject?.name ?? ""}
                </Text>
                <Selector size={18} />
              </Group>
            </Group>
          </Skeleton>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Link href="/new-project" passHref>
          <Menu.Item sx={{ height: 60 }} icon={<Plus size={18} />}>
            Create new project
          </Menu.Item>
        </Link>
        <Divider mb={8} />
        {data?.results?.map((project) => {
          return (
            <Menu.Item
              sx={{ width: "100%" }}
              icon={
                <Avatar
                  size="lg"
                  radius="sm"
                  alt={project.name}
                  src={getLogoUrl(project?.logo)}
                  color="blue"
                >
                  {getLogoPlaceholder(project.name)}
                </Avatar>
              }
              rightSection={project.slug === selectedProject?.slug ? "✓" : ""}
              key={project.name}
              onClick={handleSelect(project)}
            >
              {project.name}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};

export default ProjectSelector;
