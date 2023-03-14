import {
  Avatar,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Skeleton,
  TextInput,
  Alert,
  Stack,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { parseNearAmount } from "near-api-js/lib/utils/format";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { AlertCircle } from "tabler-icons-react";

import { PageContainer } from "../../components/layout/PageContainer";
import { AddressSpotlight } from "../../components/payments/AddressSpotlight";
import { useSelectedProject } from "../../context/SelectedProjectContext";
import { useWalletSelector } from "../../context/WalletSelectorContext";
import { fetchTransactionRequestControllerCreate } from "../../services/api/dev3Components";
import {
  FungibleTokenError,
  nearWalletRegex,
  DEV3_CONTRACT_ID,
  parseFtAmount,
  ReceiverError,
  THIRTY_TGAS,
  validateFungibleMetadata,
} from "../../utils/near";
import { useMetadata } from "../../hooks/useMetadata";
import { notifications } from "../../utils/notifications";

interface IPaymentFormValues {
  amount: number;
  receiver: string;
  contractId: string;
  isFungibleToken: boolean;
}

const CreatePayment = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { projectId } = useSelectedProject();
  const { viewMethod } = useWalletSelector();

  const form = useForm<IPaymentFormValues>({
    validateInputOnChange: true,
    initialValues: {
      amount: 0,
      receiver: "",
      contractId: "",
      isFungibleToken: false,
    },

    validate: {
      receiver: (value) =>
        nearWalletRegex.test(value) ? null : "Invalid reciver address",
      contractId: (value, values) =>
        !values.isFungibleToken
          ? null
          : nearWalletRegex.test(value)
          ? null
          : "Invalid fungible token address",
      amount: (value) => (value > 0 ? null : "Amount must be greater than 0"),
    },
  });

  const { metadata, isLoading: metadataLoading } = useMetadata(
    form.values.isFungibleToken,
    form.values.contractId
  );

  const validateReceiver = useCallback(
    async (contractId: string, receiver: string) => {
      return await viewMethod(contractId, "storage_balance_of", {
        account_id: receiver,
      });
    },
    [viewMethod]
  );

  const handleSubmit = async ({
    amount,
    isFungibleToken,
    contractId,
    receiver,
  }: IPaymentFormValues) => {
    try {
      setLoading(true);

      notifications.create({
        title: "Creating a new payment request",
        message: "Please wait...",
      });

      let args;
      let method = isFungibleToken ? "ft_transfer" : "transfer_funds";
      let deposit = "1";

      if (
        isFungibleToken &&
        contractId &&
        (await validateReceiver(contractId, receiver)) === null
      ) {
        throw new ReceiverError();
      }

      if (!isFungibleToken) {
        const parsedAmount = parseNearAmount(amount.toString());
        deposit = parsedAmount as string;

        args = {
          request: {
            receiver_account_id: receiver,
            amount: parsedAmount,
          },
        };
      } else {
        validateFungibleMetadata(metadata);

        const decimals = metadata?.["decimals"] ?? 0;

        const parsedAmount = parseFtAmount(amount, decimals);

        args = {
          amount: parsedAmount,
          receiver_id: receiver,
        };
      }

      await fetchTransactionRequestControllerCreate({
        body: {
          project_id: projectId as string,
          method,
          is_near_token: !isFungibleToken,
          type: "Payment",
          args,
          contractId: isFungibleToken ? contractId : DEV3_CONTRACT_ID,
          meta: metadata,
          deposit,
          gas: THIRTY_TGAS,
        },
      });

      notifications.success({
        title: "Payment request created!",
        message: "Your payment request has been created. You can now share it.",
      });

      router.push(`/payments`);
    } catch (error) {
      let title = "Error creating payment request";
      let message =
        "There was an error creating your payment request. Please try again later.";

      if (error instanceof ReceiverError) {
        title = "Recipient is not registered to receive fungible tokens";
        message =
          "Please ask the recipient to register to receive fungible tokens";
      }

      if (error instanceof FungibleTokenError) {
        title = "Contract is not a fungible token";
        message = error.message;
      }

      notifications.error({
        title,
        message,
      });

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiverSelect = (wallet: string) => {
    form.setFieldValue("receiver", wallet);
  };

  const handleContractIdSelect = (wallet: string) => {
    form.setFieldValue("contractId", wallet);
  };

  const metadataIsValid = Boolean(metadata) && metadata.spec === "ft-1.0.0";

  const disabled =
    loading ||
    metadataLoading ||
    (form.values.isFungibleToken && !metadataIsValid);

  return (
    <PageContainer title="Create payment request">
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
        <TextInput
          withAsterisk
          label="Receiver account id"
          description="The account to which the funds will be sent"
          placeholder="Enter receiver account id"
          rightSection={<AddressSpotlight onSelect={handleReceiverSelect} />}
          {...form.getInputProps("receiver")}
        />

        <Checkbox
          mt="md"
          label="Do you wish to receive fungible token instead of NEAR?"
          {...form.getInputProps("isFungibleToken", { type: "checkbox" })}
        />

        {form.values.isFungibleToken && (
          <Stack align="flex-start">
            <TextInput
              w="100%"
              mt="sm"
              label="Fungible token contract"
              placeholder="Enter fungible token contract id"
              rightSection={
                <AddressSpotlight onSelect={handleContractIdSelect} />
              }
              {...form.getInputProps("contractId")}
            />

            <Skeleton visible={metadataLoading}>
              {form.values.contractId &&
                form.isValid("contractId") &&
                !metadataIsValid && (
                  <Alert icon={<AlertCircle size={16} />} color="red">
                    {"Can't verify contract is a fungible token."}
                  </Alert>
                )}
            </Skeleton>

            {metadata && (
              <Badge
                color="yellow"
                size="xl"
                radius="xl"
                pl={0}
                leftSection={
                  <Avatar
                    alt={metadata.name}
                    size={32}
                    mr={6}
                    radius="xl"
                    color="yellow"
                    src={metadata.icon}
                    variant="filled"
                  >
                    {metadata.name?.[0] ?? "?"}
                  </Avatar>
                }
              >
                {metadata.symbol}
              </Badge>
            )}
          </Stack>
        )}

        <NumberInput
          mt="sm"
          label="Amount"
          placeholder="Enter amount"
          min={0}
          max={9999}
          step={0.1}
          precision={6}
          removeTrailingZeros
          {...form.getInputProps("amount")}
        />

        <Group position="right" mt="md">
          <Button type="submit" variant="light" disabled={disabled}>
            Create payment request
          </Button>
        </Group>
      </form>
    </PageContainer>
  );
};

export default CreatePayment;
