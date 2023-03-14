import { ActionIcon, Badge, Button, Group, Text, Tooltip } from "@mantine/core";
import { NextLink } from "@mantine/next";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { useState } from "react";
import { ExternalLink, Plus, Share } from "tabler-icons-react";

import { PageContainer } from "../../components/layout/PageContainer";
import showShareModal from "../../components/ShareModal";
import { CopyCell } from "../../components/table/CopyCell";
import { TransactionStatus } from "../../components/transactions/Status";
import { useSelectedProject } from "../../context/SelectedProjectContext";
import { usePaginationProps } from "../../hooks/usePaginationProps";
import { useTransactionRequestControllerFindAll } from "../../services/api/dev3Components";
import { TransactionRequest } from "../../services/api/dev3Schemas";
import { getInfoFromArgs } from "../../utils/near";

const PAGE_LIMIT = 10;

const Payments = () => {
  const [page, setPage] = useState(1);
  const { projectId } = useSelectedProject();

  const { isLoading, data } = useTransactionRequestControllerFindAll({
    queryParams: {
      type: "Payment",
      offset: (page - 1) * PAGE_LIMIT,
      limit: PAGE_LIMIT,
      project_id: projectId as string,
    },
  });

  const paginationProps = usePaginationProps({
    page,
    onPageChange: setPage,
    limit: PAGE_LIMIT,
    total: data?.total,
  });

  const columns: Array<DataTableColumn<TransactionRequest>> = [
    {
      accessor: "createdAt",
      render: ({ createdAt }) => {
        const formatedDate = new Intl.DateTimeFormat("en-GB", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date(createdAt));

        return <Text>{formatedDate}</Text>;
      },
    },
    {
      accessor: "token",
      render: ({ is_near_token, meta }) => {
        let parsedMeta = JSON.parse(meta || "null");

        if (typeof parsedMeta === "string") {
          parsedMeta = JSON.parse(parsedMeta);
        }

        return (
          <Badge>
            {is_near_token ? "NEAR" : parsedMeta?.name ?? "Unknown"}
          </Badge>
        );
      },
    },
    {
      accessor: "amount",
      render: ({ args, meta }) => {
        try {
          const parsedArgs = JSON.parse(args);
          const parsedMeta = meta ? JSON.parse(meta) : null;
          const { amount } = getInfoFromArgs(parsedArgs, parsedMeta);

          return <Text>{amount}</Text>;
        } catch {
          return <Text>{`Couldn't parse amount`}</Text>;
        }
      },
    },
    {
      accessor: "receiver",
      render: ({ args }) => {
        try {
          const parsedArgs = JSON.parse(args);
          const { receiver_id } = getInfoFromArgs(parsedArgs);

          return <Text>{receiver_id}</Text>;
        } catch {
          return <Text>{`Couldn't parse receiver`}</Text>;
        }
      },
    },
    {
      accessor: "status",
      render: ({ status }) => <TransactionStatus status={status} />,
    },
    {
      accessor: "actions",
      render: ({ uuid }) => {
        const url = `${window.location.origin}/action/payment/${uuid}`;

        const handleShare = (url: string) => {
          return () => {
            showShareModal({
              url,
              title: "Share the payment request:",
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
            </Group>
          </CopyCell>
        );
      },
    },
  ];

  return (
    <PageContainer title="Payment Requests" containerProps={{ fluid: true }}>
      <Button
        sx={{ alignSelf: "self-end" }}
        component={NextLink}
        href="/payments/create"
        variant="light"
        leftIcon={<Plus />}
      >
        Create payment request
      </Button>

      <DataTable
        minHeight={164}
        idAccessor="_id"
        columns={columns}
        noRecordsText="No payment requests"
        records={data?.results}
        fetching={isLoading}
        {...paginationProps}
      />
    </PageContainer>
  );
};

export default Payments;
