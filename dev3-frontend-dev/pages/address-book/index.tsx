import { ActionIcon, Button, Group, Text, Tooltip } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { NextLink } from "@mantine/next";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { useState } from "react";
import { Edit, Plus, Trash, X } from "tabler-icons-react";

import { PageContainer } from "../../components/layout/PageContainer";
import { CopyCell } from "../../components/table/CopyCell";
import { usePaginationProps } from "../../hooks/usePaginationProps";
import {
  fetchAddressControllerRemove,
  useAddressControllerFindAll,
} from "../../services/api/dev3Components";
import { Address } from "../../services/api/dev3Schemas";
import { notifications } from "../../utils/notifications";

const PAGE_LIMIT = 20;

const AddressBook = () => {
  const [page, setPage] = useState(1);

  const { isFetching, refetch, data } = useAddressControllerFindAll(
    {
      queryParams: {
        offset: (page - 1) * PAGE_LIMIT,
        limit: PAGE_LIMIT,
      },
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  const paginationProps = usePaginationProps({
    page,
    onPageChange: setPage,
    limit: PAGE_LIMIT,
    total: data?.total,
  });

  const handleDelete = (address: Address) =>
    openConfirmModal({
      title: `Delete address '${address.alias}'?`,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete address &apos;
          {address.alias}&apos;? This action is destructive and you can&apos;t
          take it back.
        </Text>
      ),
      labels: {
        confirm: `Delete address '${address.alias}'`,
        cancel: "No don't delete it",
      },
      confirmProps: { color: "red" },
      onCancel: () => {},
      onConfirm: async () => {
        try {
          notifications.create({
            title: "Removing address",
          });

          await fetchAddressControllerRemove({
            pathParams: {
              id: (address as any)._id,
            },
          });

          notifications.success({
            title: "Address removed!",
          });

          refetch();
        } catch (error) {
          notifications.error({
            title: "Error while deleting the address",
            message:
              "There was an error deleting the address. Please try again later.",
          });

          console.error(error);
        }
      },
    });

  const columns: Array<DataTableColumn<Address>> = [
    {
      accessor: "alias",
      render: ({ alias }) => {
        return <Text fw={700}>{alias}</Text>;
      },
    },
    {
      accessor: "wallet",
      render: ({ wallet }) => {
        return <CopyCell value={wallet} />;
      },
    },
    {
      accessor: "phone",
      render: ({ phone }) => {
        return <CopyCell value={phone} />;
      },
    },
    {
      accessor: "email",
      render: ({ email }) => {
        return <CopyCell value={email} />;
      },
    },
    {
      accessor: "actions",
      render: (address) => {
        return (
          <Group spacing={4} noWrap>
            <Tooltip label="Edit" position="bottom" withArrow>
              <ActionIcon
                component={NextLink}
                href="/address-book/[id]/edit"
                as={`/address-book/${(address as any)._id}/edit`}
                color="blue"
                radius="xl"
                variant="light"
              >
                <Edit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete" position="bottom" withArrow>
              <ActionIcon
                color="red"
                radius="xl"
                variant="light"
                onClick={() => handleDelete(address)}
              >
                <Trash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        );
      },
    },
  ];

  return (
    <PageContainer title="Address Book" containerProps={{ fluid: true }}>
      <Button
        sx={{ alignSelf: "self-end" }}
        component={NextLink}
        href="/address-book/create"
        as={`/address-book/create`}
        variant="light"
        leftIcon={<Plus />}
      >
        Add new address
      </Button>

      <DataTable
        highlightOnHover
        idAccessor="alias"
        minHeight={164}
        noRecordsText="No addresses"
        columns={columns}
        records={data?.results}
        fetching={isFetching}
        {...paginationProps}
      ></DataTable>
    </PageContainer>
  );
};

export default AddressBook;
