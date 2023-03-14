import { ActionIcon, Badge, Group, Text, Tooltip } from "@mantine/core";
import { DataTable, DataTableColumn } from "mantine-datatable";
import React, { useState } from "react";
import { ExternalLink, Share } from "tabler-icons-react";

import { useSelectedProject } from "../../../context/SelectedProjectContext";
import { usePaginationProps } from "../../../hooks/usePaginationProps";
import { useDeployedContractControllerFindAll } from "../../../services/api/dev3Components";
import { DeployedContract } from "../../../services/api/dev3Schemas";
import { getNearBlockTxnUrl } from "../../../utils/near";
import showShareModal from "../../ShareModal";
import { CopyCell } from "../../table/CopyCell";

const PAGE_LIMIT = 20;

export const DeployRequests = () => {
  const [page, setPage] = useState(1);
  const { projectId } = useSelectedProject();

  const { data, isLoading } = useDeployedContractControllerFindAll({
    queryParams: {
      project_id: projectId,
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

  const columns: Array<DataTableColumn<DeployedContract>> = [
    {
      accessor: "alias",
      render: ({ alias }) => {
        return <Text fw={700}>{alias}</Text>;
      },
    },
    {
      accessor: "template",
      render: ({ contract_template }) => {
        return <Text>{contract_template?.name}</Text>;
      },
    },

    {
      accessor: "createdAt",
      title: "Created At",
      render: ({ createdAt }) => {
        const formatedDate = new Intl.DateTimeFormat("en-GB", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(createdAt));

        return <Text>{formatedDate}</Text>;
      },
    },
    {
      accessor: "status",
      render: ({ status }) => {
        return (
          <Badge size="lg" color={status === "Deployed" ? "green" : "yellow"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessor: "actions",
      render: ({ uuid, status, txHash }) => {
        const hasTransaction = Boolean(txHash);
        const url = txHash
          ? getNearBlockTxnUrl(txHash)
          : `${window.location.origin}/action/deployment/${uuid}`;

        const handleShare = (url: string) => {
          return () => {
            showShareModal({
              url,
              title: "Share the deployment request:",
            });
          };
        };

        return (
          <CopyCell value={url}>
            <Group>
              <Tooltip position="bottom" label="Open" withArrow>
                <ActionIcon
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  radius="xl"
                  variant="light"
                  color="blue"
                >
                  <ExternalLink size={16} />
                </ActionIcon>
              </Tooltip>
              {!hasTransaction && (
                <Tooltip position="bottom" label="Share" withArrow>
                  <ActionIcon
                    radius="xl"
                    variant="light"
                    color="blue"
                    onClick={handleShare(url)}
                  >
                    <Share size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </CopyCell>
        );
      },
    },
  ];

  return (
    <DataTable
      minHeight={164}
      idAccessor="_id"
      columns={columns}
      noRecordsText="No deploy requests"
      records={data?.results}
      fetching={isLoading}
      {...paginationProps}
    />
  );
};
