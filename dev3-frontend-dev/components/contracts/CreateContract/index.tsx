import {
  Badge,
  Checkbox,
  Group,
  Paper,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { CodeResult } from "near-api-js/lib/providers/provider";
import { useRouter } from "next/router";
import React, { useCallback, useState } from "react";
import { InfoCircle, Rocket, Search } from "tabler-icons-react";

import { useSelectedProject } from "../../../context/SelectedProjectContext";
import { useWalletSelector } from "../../../context/WalletSelectorContext";
import { usePaginationProps } from "../../../hooks/usePaginationProps";
import {
  fetchDeployedContractControllerCreate,
  useContractControllerFindAll,
} from "../../../services/api/dev3Components";
import { notifications } from "../../../utils/notifications";
import { ContractForm, IContractFormValues } from "../ContractForm";
import { ContractInfo } from "../ContractInfo";
import { AuditedIcon } from "../TemplateList/AuditedIcon";

export interface IContractTemplate {
  _id: string;
  name: string;
  is_audited: boolean;
  tags: Array<string>;
  creator_name: string;
  description: string;
  github_url: string;
  info_markdown_url: string;
}

const PAGE_LIMIT = 20;

function getTemplateFolderName(githubUrl: string) {
  return new URL(githubUrl).pathname.split("/").slice(-2)[0];
}
export const CreateContract: React.FC = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [auditedOnly, setAuditedOnly] = useState(false);
  const { projectId } = useSelectedProject();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const { provider } = useWalletSelector();

  const [debouncedQuery] = useDebouncedValue(query, 300);

  const { data, isLoading } = useContractControllerFindAll({
    queryParams: {
      ...(auditedOnly && { isAudited: true }),
      ...(debouncedQuery && { name: debouncedQuery }),
      limit: PAGE_LIMIT,
    },
  });

  const paginationProps = usePaginationProps({
    page,
    onPageChange: setPage,
    limit: PAGE_LIMIT,
    total: data?.total,
  });

  const getAvailableContracts = useCallback(async () => {
    if (!provider) {
      return;
    }

    const result = await provider.query<CodeResult>({
      request_type: "call_function",
      account_id: "dev3_contracts.testnet",
      method_name: "get_contracts",
      args_base64: "",
      finality: "optimistic",
    });

    return JSON.parse(Buffer.from(result.result).toString()) as Array<string>;
  }, [provider]);

  const handleQueryChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
    setPage(1);
    setQuery(event.currentTarget.value);
  };

  const handleAuditedOnlyChange = (
    event: React.SyntheticEvent<HTMLInputElement>
  ) => {
    setPage(1);
    setAuditedOnly(event.currentTarget.checked);
  };

  const handleSubmit = (templateId: string) => {
    return async (values: IContractFormValues) => {
      if (!(projectId && templateId && data)) {
        return;
      }

      setIsCreating(true);

      try {
        notifications.create({
          title: "Creating contract deployment request",
        });

        const template: IContractTemplate = data.results.find(
          (t) => t._id === templateId
        );
        const folderName = getTemplateFolderName(template.github_url);
        const availableContracts = await getAvailableContracts();
        const contractId = availableContracts?.find((name) =>
          name.startsWith(folderName)
        );

        if (!contractId) {
          throw new Error("Could not determing contract template");
        }

        await fetchDeployedContractControllerCreate({
          body: {
            alias: values.alias,
            project_id: projectId,
            contract_template_id: templateId,
            args: {
              contract_id: contractId,
              name: values.alias,
            },
          },
        });

        notifications.success({
          title: "Created contract deployment request",
        });

        router.push(`/contracts?tab=deploy`);
      } catch {
        notifications.error({
          title: `Failed to create contract deployment request`,
        });
      } finally {
        setIsCreating(false);
      }
    };
  };

  const columns: Array<DataTableColumn<IContractTemplate>> = [
    {
      accessor: "name",
      render: ({ name, is_audited, creator_name }) => {
        return (
          <Group noWrap>
            <AuditedIcon isAudited={is_audited} />

            <Stack spacing={0}>
              <Text fz="xs" tt="uppercase">
                {creator_name}
              </Text>
              <Title order={4}>{name}</Title>
            </Stack>
          </Group>
        );
      },
    },
    {
      accessor: "description",
      title: "",
      render: ({ description, tags }) => {
        return (
          <Stack>
            <Text>{description}</Text>
            <Group spacing="xs">
              {tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </Group>
          </Stack>
        );
      },
    },
  ];

  return (
    <>
      <Group>
        <TextInput
          sx={{ flex: 1 }}
          placeholder="Search templates..."
          icon={<Search size={16} />}
          value={query}
          onChange={handleQueryChange}
          disabled={isCreating}
        />
        <Checkbox
          label="Audited only"
          checked={auditedOnly}
          onChange={handleAuditedOnlyChange}
          disabled={isCreating}
        />
      </Group>

      <DataTable
        highlightOnHover
        minHeight={200}
        sx={{ thead: { display: "none" } }}
        columns={columns}
        records={data?.results}
        fetching={isLoading}
        idAccessor="_id"
        emptyState="No templates found"
        {...paginationProps}
        rowExpansion={{
          content: ({ record }) => {
            return (
              <Paper p="lg">
                <Tabs defaultValue="create">
                  <Tabs.List>
                    <Tabs.Tab value="create" icon={<Rocket size={14} />}>
                      Create
                    </Tabs.Tab>
                    <Tabs.Tab value="info" icon={<InfoCircle size={14} />}>
                      Contract Info
                    </Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="create" pt="xs">
                    <ContractForm
                      disabled={isCreating}
                      handleSubmit={handleSubmit(
                        (record as IContractTemplate)._id
                      )}
                    />
                  </Tabs.Panel>

                  <Tabs.Panel value="info" pt="xs">
                    <ContractInfo
                      url={(record as IContractTemplate).info_markdown_url}
                    />
                  </Tabs.Panel>
                </Tabs>
              </Paper>
            );
          },
        }}
      />
    </>
  );
};
