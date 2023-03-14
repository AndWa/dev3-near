import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check } from "tabler-icons-react";

import { useUserContext } from "../../../context/UserContext";
import { useWalletSelector } from "../../../context/WalletSelectorContext";
import {
  useTransactionRequestControllerFindByUuid,
  useTransactionRequestControllerUpdate,
} from "../../../services/api/dev3Components";
import { getInfoFromArgs, DEV3_CONTRACT_ID } from "../../../utils/near";
import { notifications } from "../../../utils/notifications";
import { ProjectTransactionContainer } from "../../../components/action/ProjectTransactionContainer";

const PaymentRequestDetail = () => {
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

  const parsedInfo = useMemo(() => {
    if (!(parsedArgs && transactionRequestData)) {
      return;
    }

    return getInfoFromArgs(parsedArgs, transactionRequestData.meta);
  }, [parsedArgs, transactionRequestData]);

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
      const { contractId, method, deposit, gas, is_near_token } =
        transactionRequestData;

      await callMethod(
        (is_near_token ? DEV3_CONTRACT_ID : contractId) as string,
        method,
        parsedArgs,
        deposit,
        gas
      );
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
      description="is requesting payment"
    >
      <Card mt="md" shadow="none" p="lg" radius="md" withBorder>
        <Stack align="center" spacing="sm">
          {transactionRequestData?.meta?.icon && (
            <Avatar src={transactionRequestData.meta.icon} size={40} />
          )}
          {transactionRequestData?.meta?.name && (
            <Text size="xl" weight={500}>
              {transactionRequestData.meta.name}
            </Text>
          )}

          <Text size="xl" weight={500}>
            {parsedInfo?.amount}
          </Text>
          <Badge size="xl">
            {transactionRequestData?.is_near_token
              ? "NEAR"
              : transactionRequestData?.meta?.symbol}
          </Badge>

          <Text color="dimmed">on Testnet</Text>
        </Stack>
      </Card>

      <Stack mt="xl" align="center" spacing="xs">
        <Text size="xl">Receipient</Text>
        <Badge size="lg">{parsedInfo?.receiver_id}</Badge>
      </Stack>

      <Stack mt="xl">
        <Button
          disabled={userContext.user === null || loading}
          fullWidth
          variant="light"
          onClick={handleButtonClick}
        >
          {userContext.user === null ? "You need to connect a wallet" : "Pay"}
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

export default PaymentRequestDetail;
