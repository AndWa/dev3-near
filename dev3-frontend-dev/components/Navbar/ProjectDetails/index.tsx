import { Button, Group, Skeleton, Stack, Text, Tooltip } from "@mantine/core";
import React, { useMemo, useState } from "react";

import { useSelectedProject } from "../../../context/SelectedProjectContext";
import {
  fetchApiKeyControllerCreate,
  useApiKeyControllerFindOne,
} from "../../../services/api/dev3Components";
import { getDefaultExpires } from "../../../utils/api-key";
import { notifications } from "../../../utils/notifications";
import { CopyActionButton } from "../../core/CopyActionButton";

export const ProjectDetails: React.FC = () => {
  const { projectId } = useSelectedProject();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data, refetch, isLoading, error } = useApiKeyControllerFindOne<{
    api_key: string;
  }>(
    {
      pathParams: {
        projectId: projectId as string,
      },
    },
    {
      enabled: Boolean(projectId),
      retry: false,
    }
  );

  const apiKey = useMemo(() => {
    if (error) {
      return;
    }

    return data?.api_key;
  }, [data, error]);

  const handleApiKeyGenerate = async () => {
    try {
      setIsGenerating(true);

      notifications.create({
        title: "Generating a new API key",
        message: "Please wait...",
      });

      await fetchApiKeyControllerCreate({
        body: {
          project_id: projectId as string,
          expires: getDefaultExpires(),
        },
      });

      await refetch();

      notifications.success({
        title: "API key generated!",
        message: "Your project API key has been generated.",
      });
    } catch {
      notifications.error({
        color: "red",
        title: "Error generating API key",
        message:
          "There was an error generating the API key. Please try again later.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!projectId) {
    return null;
  }

  return (
    <Stack spacing="xs" fz="sm">
      <Stack spacing={0}>
        <Text tt="uppercase" fw={700}>
          API key:
        </Text>
        {apiKey ? (
          <Group noWrap>
            <Tooltip label={apiKey}>
              <Text sx={{ textOverflow: "ellipsis", overflow: "hidden" }}>
                {apiKey}
              </Text>
            </Tooltip>
            <CopyActionButton value={apiKey} />
          </Group>
        ) : (
          <Skeleton visible={isLoading}>
            <Button
              variant="default"
              size="xs"
              onClick={handleApiKeyGenerate}
              disabled={isGenerating}
              w="100%"
            >
              Generate API key
            </Button>
          </Skeleton>
        )}
      </Stack>
      <Stack spacing={0}>
        <Text tt="uppercase" fw={700}>
          Project Id:
        </Text>
        <Group noWrap>
          <Text sx={{ textOverflow: "ellipsis", overflow: "hidden" }}>
            {projectId}
          </Text>
          <CopyActionButton value={projectId} />
        </Group>
      </Stack>
    </Stack>
  );
};
