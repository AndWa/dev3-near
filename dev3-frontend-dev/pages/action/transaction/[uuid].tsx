import {
  Alert,
  Button,
  Card,
  Center,
  Code,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Code as CodeIcon } from "tabler-icons-react";

import { useUserContext } from "../../../context/UserContext";
import { useWalletSelector } from "../../../context/WalletSelectorContext";
import {
  useTransactionRequestControllerFindByUuid,
  useTransactionRequestControllerUpdate,
} from "../../../services/api/dev3Components";
import { notifications } from "../../../utils/notifications";
import { ProjectTransactionContainer } from "../../../components/action/ProjectTransactionContainer";

const TransactionRequestDetail = () => {
  const { callMethod, selector } = useWalletSelector();
  const router = useRouter();
  const { errorCode, errorMessage, transactionHashes, uuid } = router.query;

  const userContext = useUserContext();

  const [loading, setLoading] = useState<boolean>(false);

  const {
    isLoading: transactionRequestIsLoading,
    data: transactionRequestData,
  } = useTransactionRequestControllerFindByUuid({
    pathParams: {
      uuid: uuid as string,
    },
  });

  const parsedArgs = useMemo(() => {
    if (!transactionRequestData?.args) {
      return null;
    }

    let args = transactionRequestData.args;

    if (typeof args === "string") {
      args = JSON.parse(args);
    }

    if (args.request) {
      return {
        request: {
          ...args.request,
          id: transactionRequestData.uuid,
        },
      };
    }

    return args;
  }, [transactionRequestData?.args, transactionRequestData?.uuid]);

  const updateTransactionRequest = useTransactionRequestControllerUpdate();

  useEffect(() => {
    if (!(transactionHashes && updateTransactionRequest.isIdle)) {
      return;
    }

    const state = selector.store.getState();
    const accountId = state.accounts?.[0]?.accountId;

    updateTransactionRequest.mutate({
      body: {
        caller_address: accountId,
        txHash: transactionHashes as string,
      },
      pathParams: {
        uuid: uuid as string,
      },
    });
  }, [transactionHashes, updateTransactionRequest, uuid, selector.store]);

  const handleButtonClick = async () => {
    if (userContext.user === null) {
      return;
    }

    if (!transactionRequestData) {
      return;
    }

    setLoading(true);

    notifications.create({
      title: "Preparing transaction",
      message: "Please wait...",
    });

    try {
      const { contractId, method, deposit, gas } = transactionRequestData;

      await callMethod(contractId as string, method, parsedArgs, deposit, gas);
    } catch (error) {
      notifications.error({
        title: "Error while preparing transaction",
        message:
          "There was an error while preparing the transaction. Please try again.",
      });

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (transactionRequestIsLoading) {
    return (
      <Container>
        <Center>
          <Loader />
        </Center>
      </Container>
    );
  }

  if (transactionHashes) {
    return (
      <Container size="xs">
        <Alert icon={<Check size={16} />} title="Success">
          Transaction has been successfully signed.
        </Alert>
      </Container>
    );
  }

  return (
    <ProjectTransactionContainer
      projectName={transactionRequestData?.project.name}
      logoUrl={transactionRequestData?.project.logo_url}
      description="is requesting a transaction"
    >
      <Card mt="md" shadow="none" p="lg" radius="md" withBorder>
        <Stack>
          <Group>
            <ThemeIcon size="xl" variant="default">
              <CodeIcon />
            </ThemeIcon>

            <Stack spacing={0}>
              <Title order={5}>Method</Title>
              <Text>{transactionRequestData?.method}</Text>
            </Stack>
          </Group>

          <Title order={5}>With arguments:</Title>
          <Code block>{JSON.stringify(parsedArgs, null, 2)}</Code>

          {transactionRequestData?.gas !== undefined && (
            <Stack spacing={0}>
              <Title order={5}>Gas</Title>
              <Text c="dimmed">{transactionRequestData?.gas}</Text>
            </Stack>
          )}

          {transactionRequestData?.deposit !== undefined && (
            <Stack spacing={0}>
              <Title order={5}>Deposit</Title>
              <Text c="dimmed">{transactionRequestData?.deposit}</Text>
            </Stack>
          )}
        </Stack>
      </Card>

      <Stack mt="xl">
        <Button
          disabled={userContext.user === null || loading}
          fullWidth
          variant="light"
          onClick={handleButtonClick}
        >
          {userContext.user === null
            ? "You need to connect a wallet"
            : "Execute transaction"}
        </Button>

        {errorCode && errorCode === "userRejected" && (
          <Alert
            mb={40}
            icon={<AlertCircle size={16} />}
            title="Transaction rejected by user"
            color="red"
          >
            You rejected the transaction.
          </Alert>
        )}

        {errorCode && errorCode !== "userRejected" && errorMessage && (
          <Alert
            mb={40}
            icon={<AlertCircle size={16} />}
            title="Something went wrong"
            color="red"
          >
            Please try again.
          </Alert>
        )}
      </Stack>
    </ProjectTransactionContainer>
  );
};

export default TransactionRequestDetail;
