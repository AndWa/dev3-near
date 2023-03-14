import { Avatar, Button, Divider, Group, Title } from "@mantine/core";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { NextPage } from "next";
import { useState } from "react";
import { ArrowRight, Plus } from "tabler-icons-react";
import { NextLink } from "@mantine/next";

import { PageContainer } from "../components/layout/PageContainer";
import { useUserContext } from "../context/UserContext";
import { usePaginationProps } from "../hooks/usePaginationProps";
import { useProjectControllerFindAll } from "../services/api/dev3Components";
import { Project } from "../services/api/dev3Schemas";
import { getLogoPlaceholder, getLogoUrl } from "../utils/logo";
import { useSelectedProject } from "../context/SelectedProjectContext";
import { useRouter } from "next/router";

const PAGE_LIMIT = 20;

const Home: NextPage = () => {
  const { user } = useUserContext();
  const [page, setPage] = useState(1);
  const { isLoading, data } = useProjectControllerFindAll(
    {
      queryParams: {
        offset: (page - 1) * PAGE_LIMIT,
        limit: PAGE_LIMIT,
      },
    },
    {
      enabled: Boolean(user),
    }
  );
  const { setProjectId } = useSelectedProject();
  const router = useRouter();

  const paginationProps = usePaginationProps({
    page,
    onPageChange: setPage,
    limit: PAGE_LIMIT,
    total: data?.total,
  });

  const columns: Array<DataTableColumn<Project>> = [
    {
      accessor: "name",
      render: ({ name, logo }) => {
        return (
          <Group p="md">
            <Avatar
              size="lg"
              radius="sm"
              alt="Project logo"
              src={getLogoUrl(logo)}
              color="blue"
            >
              {getLogoPlaceholder(name)}
            </Avatar>

            <Divider orientation="vertical" />

            <Title order={4}>{name}</Title>
          </Group>
        );
      },
    },
    {
      accessor: "actions",
      render: (project) => {
        const handleClick = () => {
          setProjectId((project as any)._id);
          router.push("/contracts");
        };

        return (
          <Group position="right">
            <Button
              variant="default"
              rightIcon={<ArrowRight size={14} />}
              onClick={handleClick}
            >
              Open
            </Button>
          </Group>
        );
      },
    },
  ];

  return (
    <PageContainer title="My projects">
      <Group position="right">
        <Button
          component={NextLink}
          href="/new-project"
          rightIcon={<Plus size={14} />}
        >
          Add new project
        </Button>
      </Group>

      <DataTable
        highlightOnHover
        minHeight={100}
        sx={{ thead: { display: "none" } }}
        records={data?.results}
        fetching={isLoading}
        emptyState="No projects"
        columns={columns}
        idAccessor="_id"
        {...paginationProps}
      />
    </PageContainer>
  );
};

export default Home;
