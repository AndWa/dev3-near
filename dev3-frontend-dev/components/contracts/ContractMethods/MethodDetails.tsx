import React from "react";
import validator from "@rjsf/validator-ajv8";
import { IChangeEvent } from "@rjsf/core";
import { ExternalLink, Refresh } from "tabler-icons-react";
import { Code, Title, Skeleton, Button, Group } from "@mantine/core";

import { Form } from "../../form";
import { CopyActionButton } from "../../core/CopyActionButton";

interface IMethodDetailsProps {
  type: "view" | "change";
  schema: any;
  data: unknown;
  error: unknown;
  isLoading: boolean;
  onReset(): void;
  onSubmit: any;
}

export const MethodDetails: React.FC<IMethodDetailsProps> = ({
  type,
  schema,
  data,
  error,
  isLoading,
  onReset,
  onSubmit,
}) => {
  const transactionUrl = (data as any)?.uuid
    ? `${window.location.origin}/action/transaction/${(data as any).uuid}`
    : null;

  const handleReset = () => {
    onReset();
  };

  const handleSubmit = (event: IChangeEvent) => {
    onSubmit(event);
  };

  const hideForm = data !== undefined && type === "change";

  return (
    <>
      {!hideForm && (
        <Form
          schema={schema}
          validator={validator}
          onSubmit={handleSubmit}
          disabled={isLoading}
          uiSchema={{
            "ui:submitButtonOptions": {
              norender: type === "change" && data !== undefined,
              submitText: type === "view" ? "View" : "Change",
              props: {
                disabled: isLoading,
              },
            },
          }}
        />
      )}

      {type === "change" && data !== undefined && (
        <>
          <Skeleton visible={isLoading}>
            <Group w="100%" noWrap>
              <Button
                variant="default"
                leftIcon={<Refresh size={14} />}
                onClick={handleReset}
              >
                Reset
              </Button>

              {transactionUrl && (
                <>
                  <Button
                    variant="light"
                    leftIcon={<ExternalLink size={14} />}
                    component="a"
                    href={transactionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open transaction request
                  </Button>
                  <CopyActionButton value={transactionUrl} />
                </>
              )}
            </Group>
          </Skeleton>
        </>
      )}
      {type === "view" && data !== undefined && (
        <Skeleton visible={isLoading}>
          <Title order={5}>Result: </Title>
          <Code block>{JSON.stringify(data, null, 2)}</Code>
        </Skeleton>
      )}
      {error && (
        <>
          <Title order={5}>Error: </Title>
          <Code block color="red">
            {JSON.stringify(error, null, 2)}
          </Code>
        </>
      )}
    </>
  );
};
