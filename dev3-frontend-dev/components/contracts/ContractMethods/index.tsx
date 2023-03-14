import { DataTable, DataTableColumn } from "mantine-datatable";
import React, { useCallback, useState } from "react";
import { IChangeEvent } from "@rjsf/core";
import { Edit, Eye } from "tabler-icons-react";
import {
  Badge,
  Group,
  Paper,
  Text,
  ThemeIcon,
  Title,
  Stack,
} from "@mantine/core";

import { getMethodsFromSchema } from "../../../utils/raen";
import { CopyCell } from "../../table/CopyCell";
import { useWalletSelector } from "../../../context/WalletSelectorContext";
import { fetchTransactionRequestControllerCreate } from "../../../services/api/dev3Components";
import { useSelectedProject } from "../../../context/SelectedProjectContext";
import { THIRTY_TGAS } from "../../../utils/near";
import { MethodDetails } from "./MethodDetails";
import { useGetSchema } from "../../../hooks/useGetSchema";
import { camelCaseToTitleCase } from "../../../utils/text";

interface IContractMethodsProps {
  contractId: string;
}

interface IResult {
  error?: any;
  data?: any;
  isLoading: boolean;
}

function getInitialResults(methods: Array<string>): Record<string, IResult> {
  return methods.reduce((results, method) => {
    results[method] = { isLoading: false };
    return results;
  }, {} as Record<string, IResult>);
}

export const ContractMethods: React.FC<IContractMethodsProps> = ({
  contractId,
}) => {
  const { data: schema, isLoading } = useGetSchema(contractId);

  const methods = schema && getMethodsFromSchema(JSON.parse(schema));

  const { projectId } = useSelectedProject();
  const { viewMethod } = useWalletSelector();

  const [results, setResults] = useState<Record<string, any>>();

  const setResult = useCallback(
    (method: string, value: any) => {
      setResults((previousResults) => ({
        ...previousResults,
        [method]: value,
      }));
    },
    [setResults]
  );

  React.useEffect(() => {
    if (methods && !results) {
      setResults(getInitialResults(methods.map(({ method }) => method)));
    }
  }, [methods, results, setResults]);

  const columns: Array<DataTableColumn<any>> = [
    {
      accessor: "key",
      render: ({ key, method }) => {
        return (
          <CopyCell value={method}>
            <Group>
              <Title order={5}>{camelCaseToTitleCase(key)}</Title>
              <Text c="dimmed">({method})</Text>
            </Group>
          </CopyCell>
        );
      },
    },
    {
      accessor: "type",
      render: ({ type }) => {
        const color = type === "view" ? "blue" : "red";

        return (
          <Group position="right">
            <Badge
              pr="md"
              color={color}
              leftSection={
                <ThemeIcon color={color} variant="light">
                  {type === "view" ? <Eye size={14} /> : <Edit size={14} />}
                </ThemeIcon>
              }
            >
              {type}
            </Badge>
          </Group>
        );
      },
    },
  ];

  const handleSubmit = (method: string, type: "view" | "change") => {
    return async (data: IChangeEvent) => {
      let result;

      setResult(method, {
        isLoading: true,
      });

      try {
        if (type === "view") {
          result = await viewMethod(contractId, method, data.formData.args);
        }

        if (type === "change") {
          const { args, options } = data.formData;

          result = await fetchTransactionRequestControllerCreate({
            body: {
              contractId,
              type: "Transaction",
              method,
              args: args || {},
              gas: options.gas || THIRTY_TGAS,
              deposit: options.attachedDeposit || "0",
              project_id: projectId as string,
              is_near_token: false,
            },
          });
        }

        setResult(method, {
          data: result,
          isLoading: false,
        });
      } catch (error) {
        setResult(method, {
          error,
          isLoading: false,
        });
      }
    };
  };

  return (
    <Stack>
      <Title order={4}>Methods</Title>
      <DataTable
        highlightOnHover
        striped
        withBorder
        sx={{ thead: { display: "none" } }}
        records={methods || []}
        fetching={isLoading}
        columns={columns}
        idAccessor="key"
        rowExpansion={{
          allowMultiple: false,
          content: ({ record }) => {
            const { type, method, schema } = record;
            const { data, error, isLoading } = results?.[record.method];

            const handleReset = () => {
              setResult(method, { isLoading: false });
            };

            return (
              <Paper p="md">
                <Stack>
                  <MethodDetails
                    type={type}
                    schema={schema}
                    data={data}
                    error={error}
                    isLoading={isLoading}
                    onReset={handleReset}
                    onSubmit={handleSubmit(method, type)}
                  />
                </Stack>
              </Paper>
            );
          },
        }}
      />
    </Stack>
  );
};
