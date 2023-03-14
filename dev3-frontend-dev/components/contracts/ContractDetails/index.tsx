import { Badge, Group, Paper, Skeleton, Table, Text } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";

import { useWalletSelector } from "../../../context/WalletSelectorContext";
import { useDeployedContractControllerFindOne } from "../../../services/api/dev3Components";
import { getContractIdFromAlias } from "../../../utils/near";
import { AddressCell } from "../../table/AddressCell";
import { CopyCell } from "../../table/CopyCell";
import { ContractMethods } from "../ContractMethods";

export const ContractDetails = () => {
  const { getViewCode } = useWalletSelector();
  const schemaRef = useRef<string>();
  const router = useRouter();

  const { data, isLoading } = useDeployedContractControllerFindOne({
    pathParams: {
      uuid: router.query.uuid as string,
    },
  });

  return (
    <>
      <Skeleton visible={isLoading}>
        <Table striped withBorder>
          <tbody>
            <tr>
              <Text component="td" fw={700}>
                Alias:
              </Text>
              <td>
                <CopyCell value={data?.alias || "-"}></CopyCell>
              </td>
            </tr>

            <tr>
              <Text component="td" fw={700}>
                Name:
              </Text>
              <td>{data?.contract_template?.name}</td>
            </tr>

            <tr>
              <Text component="td" fw={700}>
                Description:
              </Text>
              <td>{data?.contract_template?.description}</td>
            </tr>

            <tr>
              <Text component="td" fw={700}>
                Tags:
              </Text>
              <td>
                <Group spacing={4}>
                  {data?.contract_template?.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </Group>
              </td>
            </tr>

            <tr>
              <Text component="td" fw={700}>
                Created At:
              </Text>
              <td>
                {data?.createdAt &&
                  new Intl.DateTimeFormat("en-GB", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(new Date(data?.createdAt))}
              </td>
            </tr>

            <tr>
              <Text component="td" fw={700}>
                Address:
              </Text>
              <td>{data?.alias && <AddressCell alias={data?.alias} />}</td>
            </tr>
          </tbody>
        </Table>
      </Skeleton>

      {data && (
        <ContractMethods contractId={getContractIdFromAlias(data.alias)} />
      )}
    </>
  );
};
