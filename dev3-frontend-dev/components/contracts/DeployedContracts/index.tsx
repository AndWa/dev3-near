import { ActionIcon, Badge, Group, Text, Tooltip } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Trash } from "tabler-icons-react";

import { useSelectedProject } from "../../../context/SelectedProjectContext";
import { usePaginationProps } from "../../../hooks/usePaginationProps";
import {
  fetchDeployedContractControllerRemove,
  useDeployedContractControllerFindAll,
} from "../../../services/api/dev3Components";
import { DeployedContract } from "../../../services/api/dev3Schemas";
import { notifications } from "../../../utils/notifications";
import { AddressCell } from "../../table/AddressCell";

const PAGE_LIMIT = 20;

export const DeployedContracts = () => {
  const [page, setPage] = useState(1);
  const { projectId } = useSelectedProject();
  const router = useRouter();

  const { data, isLoading, refetch } = useDeployedContractControllerFindAll({
    queryParams: {
      project_id: projectId,
      status: "Deployed",
      offset: (page - 1) * PAGE_LIMIT,
      limit: PAGE_LIMIT,
    },
  });

  const paginationProps = usePaginationProps({
    page,
    onPageChange: setPage,
    limit: PAGE_LIMIT,
    total: data?.total,
  });

  const handleDelete = (contract: DeployedContract) =>
    openConfirmModal({
      title: `Delete contract '${contract.alias}'?`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete contract &apos;
          {contract.alias}&apos;? This action is destructive and you can&apos;t
          take it back.
        </Text>
      ),
      labels: {
        confirm: `Delete`,
        cancel: "Cancel",
      },
      confirmProps: { color: "red" },
      onCancel: () => {},
      onConfirm: async () => {
        try {
          notifications.create({
            title: "Removing contract",
          });

          await fetchDeployedContractControllerRemove({
            pathParams: {
              uuid: contract.uuid,
            },
          });

          notifications.success({
            title: "Contract deleted!",
          });

          refetch();
        } catch (error) {
          notifications.error({
            title: "Error while deleting the contract",
            message:
              "There was an error deleting the contract. Please try again later.",
          });

          console.error(error);
        }
      },
    });

  const columns: Array<DataTableColumn<DeployedContract>> = [
    {
      accessor: "alias",
      render: ({ alias }) => {
        return <Text fw="700">{alias}</Text>;
      },
    },
    {
      accessor: "tags",
      render: ({ tags }) => {
        return (
          <Group spacing={4}>
            {tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </Group>
        );
      },
    },
    {
      accessor: "address",
      render: ({ alias }) => {
        return <AddressCell alias={alias} />;
      },
    },

    {
      accessor: "actions",
      render: (contract) => {
        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          handleDelete(contract);
        };

        return (
          <Group>
            <Tooltip label="Delete" position="bottom" withArrow>
              <ActionIcon
                color="red"
                radius="xl"
                variant="light"
                onClick={handleClick}
              >
                <Trash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        );
      },
    },
  ];

  const handleRowClick = (contract: DeployedContract) => {
    router.push(`/contracts/${contract.uuid}`);
  };

  return (
    <DataTable
      minHeight={164}
      idAccessor="_id"
      columns={columns}
      noRecordsText="No deployed contracts"
      records={data?.results}
      fetching={isLoading}
      onRowClick={handleRowClick}
      highlightOnHover
      {...paginationProps}
    />
  );
};
