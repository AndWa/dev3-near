import { Button, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import React, { useMemo } from "react";

import { useSelectedProject } from "../../../context/SelectedProjectContext";
import {
  fetchApiKeyControllerCreate,
  fetchApiKeyControllerRegenerate,
  fetchApiKeyControllerRemove,
  fetchApiKeyControllerRevoke,
  useApiKeyControllerFindOne,
} from "../../../services/api/dev3Components";
import { ApiKey } from "../../../services/api/dev3Schemas";
import { formatExpired, getDefaultExpires } from "../../../utils/api-key";
import { notifications } from "../../../utils/notifications";
import { CopyActionButton } from "../../core/CopyActionButton";

interface IApiKeyDTO extends ApiKey {
  id: string;
  is_revoked: boolean;
}

async function generate(projectId: string, refetch: () => Promise<unknown>) {
  notifications.create({
    title: "Generating the API key",
    message: "Please wait...",
  });

  try {
    await fetchApiKeyControllerCreate({
      body: {
        expires: getDefaultExpires(),
        project_id: projectId as string,
      },
    });

    notifications.success({
      title: "API key generated",
      message: "The API key was successfully generated",
    });

    await refetch();
  } catch {
    notifications.error({
      title: "Error while generating the API key",
      message:
        "There was an error generating the API key. Please try again later.",
    });
  }
}

async function regenerate(apiKey: string, refetch: () => Promise<unknown>) {
  notifications.create({
    title: "Regenerating the API key",
    message: "Please wait...",
  });

  try {
    await fetchApiKeyControllerRegenerate({
      body: {
        expires: getDefaultExpires(),
      },
      pathParams: {
        apiKey: encodeURIComponent(apiKey),
      },
    });

    notifications.success({
      title: "API key regenerated",
      message: "The API key was successfully regenerated",
    });

    await refetch();
  } catch {
    notifications.error({
      title: "Error while regenerating the API key",
      message:
        "There was an error regenerating the API key. Please try again later.",
    });
  }
}

async function remove(id: string, refetch: () => Promise<unknown>) {
  notifications.create({
    title: "Removing the API key",
    message: "Please wait...",
  });

  try {
    await fetchApiKeyControllerRemove({
      pathParams: {
        id,
      },
    });

    notifications.success({
      title: "API key removed",
      message: "The API key was successfully removed",
    });

    await refetch();
  } catch {
    notifications.error({
      title: "Error while removing the API key",
      message:
        "There was an error removing the API key. Please try again later.",
    });
  }
}

async function revoke(apiKey: string, refetch: () => Promise<unknown>) {
  notifications.create({
    title: `Revoke the API key`,
    message: "Please wait...",
  });

  try {
    await fetchApiKeyControllerRevoke({
      pathParams: {
        apiKey: encodeURIComponent(apiKey),
      },
      body: {
        is_revoked: true,
      },
    });

    notifications.success({
      title: `API key revoked`,
      message: `The API key was successfully revoked`,
    });

    await refetch();
  } catch {
    notifications.error({
      title: `Error while revoking the API key`,
      message: "There was an error. Please try again later.",
    });
  }
}

export const ApiKeySettings = () => {
  const { projectId } = useSelectedProject();

  const { data, refetch, error, isLoading } =
    useApiKeyControllerFindOne<IApiKeyDTO>(
      {
        pathParams: { projectId: projectId as string },
      },
      { enabled: Boolean(projectId), retry: false, keepPreviousData: false }
    );

  const apiKeyDto = useMemo(() => {
    if (error) {
      return;
    }

    return data;
  }, [data, error]);

  const handleGenerate = async () => {
    if (apiKeyDto?.api_key) {
      openConfirmModal({
        title: "Regenerate the API key?",
        children: (
          <Text size="sm">
            Regenerating the API key will make a current one invalid.
          </Text>
        ),
        labels: {
          cancel: "Cancel",
          confirm: "Regenerate",
        },
        onConfirm: async () => {
          await regenerate(apiKeyDto.api_key, refetch);
        },
      });
    } else {
      await generate(projectId as string, refetch);
    }
  };

  const handleRevokeOrApprove = () => {
    openConfirmModal({
      title: `Revoke the API key?`,
      children: (
        <Text size="sm">Revoking the API key will make it invalid.</Text>
      ),
      labels: {
        cancel: "Cancel",
        confirm: "Revoke",
      },
      confirmProps: {
        color: "red",
        variant: "light",
      },
      onConfirm: async () => {
        await revoke(apiKeyDto?.api_key as string, refetch);
      },
    });
  };

  return (
    <Stack align="flex-start">
      {apiKeyDto?.api_key && (
        <>
          <Stack spacing="xs">
            <Title order={4}>API key</Title>
            <Group>
              <Text sx={{ wordBreak: "break-all" }}>{apiKeyDto?.api_key}</Text>
              <CopyActionButton value={apiKeyDto?.api_key} />
            </Group>

            <Title order={4}>Expires at:</Title>
            <Text>{formatExpired(apiKeyDto?.expires)}</Text>
          </Stack>
        </>
      )}

      <Skeleton visible={isLoading}>
        {!apiKeyDto && <Text>The is no active API key.</Text>}
      </Skeleton>

      <Group w="100%" position="right">
        <Button onClick={handleGenerate}>
          {apiKeyDto?.api_key ? "Regenerate" : "Generate"}
        </Button>
        {apiKeyDto && (
          <>
            <Button
              onClick={handleRevokeOrApprove}
              variant="light"
              color={apiKeyDto?.is_revoked ? "blue" : "red"}
            >
              {apiKeyDto?.is_revoked ? "Approve" : "Revoke"}
            </Button>
          </>
        )}
      </Group>
    </Stack>
  );
};
