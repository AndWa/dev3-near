import {
  Alert,
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { Query, useMutation, useQuery } from "@tanstack/react-query";
import { BN } from "bn.js";
import {
  formatNearAmount,
  parseNearAmount,
} from "near-api-js/lib/utils/format";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ThreeDCubeSphere } from "tabler-icons-react";

import { ProjectTransactionContainer } from "../../../components/action/ProjectTransactionContainer";
import { useUserContext } from "../../../context/UserContext";
import { useWalletSelector } from "../../../context/WalletSelectorContext";
import {
  useDeployedContractControllerFindByUuidPublic,
  useDeployedContractControllerUpdate,
} from "../../../services/api/dev3Components";
import { THIRTY_TGAS } from "../../../utils/near";
import { notifications } from "../../../utils/notifications";

const DEV3_CONTRACT = "dev3_contracts.testnet";

const Deployment = () => {
  const router = useRouter();
  const { errorCode, errorMessage, transactionHashes, uuid } = router.query;
  const userContext = useUserContext();
  const { viewMethod, callMethod, selector } = useWalletSelector();

  const [isDeploying] = useState<boolean>(false);

  const { data, isLoading } = useDeployedContractControllerFindByUuidPublic({
    pathParams: {
      uuid: router.query.uuid as string,
    },
  });

  const contractId = useMemo(() => {
    return data?.args["contract_id"] as string;
  }, [data?.args]);

  const { data: deploymentPrice, isLoading: isLoadingDeploymentPrice } =
    useQuery({
      queryKey: ["get_contract_deployment_price", contractId],
      queryFn: () => {
        return viewMethod(DEV3_CONTRACT, "get_contract_deployment_price", {
          contract_id: contractId,
        });
      },
      enabled: !isLoading && Boolean(contractId),
    });

  const deposit = useMemo(() => {
    if (!deploymentPrice) {
      return;
    }

    const fixed = parseNearAmount("0.1");
    return new BN(fixed as string).add(new BN(deploymentPrice)).toString();
  }, [deploymentPrice]);

  const updateDeployedContract = useDeployedContractControllerUpdate();

  useEffect(() => {
    if (!(transactionHashes && updateDeployedContract.isIdle)) {
      return;
    }

    const state = selector.store.getState();
    const accountId = state.accounts?.[0]?.accountId;

    updateDeployedContract.mutate({
      body: {
        deployer_address: accountId,
        txHash: transactionHashes as string,
      },
      pathParams: {
        uuid: uuid as string,
      },
    });
  }, [transactionHashes, updateDeployedContract, uuid, selector.store]);

  const handleDeployButtonClick = async () => {
    notifications.create({
      title: "Deploying the contract",
    });

    try {
      await callMethod(
        DEV3_CONTRACT,
        "create_factory_subaccount_and_deploy",
        data?.args,
        deposit,
        THIRTY_TGAS
      );
    } catch {
      notifications.error({
        title: "Failed to deploy!",
      });
    }
  };

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
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
      logoUrl={data?.project_logo_url}
      projectName={data?.project_name}
      description="is requesting you to deploy"
    >
      <Stack mt="md">
        <Card withBorder>
          <Group noWrap>
            <ThemeIcon size="xl" variant="light">
              <ThreeDCubeSphere />
            </ThemeIcon>
            <Box>
              <Title order={4}>{data?.contract_template_name}</Title>
              <Text>{data?.contract_template_description}</Text>
            </Box>
          </Group>
        </Card>

        <Skeleton visible={isLoadingDeploymentPrice}>
          {deposit && (
            <Text c="dimmed">Deposit price: {formatNearAmount(deposit)} Ⓝ</Text>
          )}
        </Skeleton>

        <Button
          disabled={userContext.user === null || isDeploying}
          fullWidth
          variant="light"
          onClick={handleDeployButtonClick}
        >
          {userContext.user === null
            ? "You need to connect a wallet"
            : "Deploy"}
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

export default Deployment;
