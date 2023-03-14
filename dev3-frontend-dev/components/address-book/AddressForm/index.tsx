import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";
import { isValidPhoneNumber } from "react-phone-number-input";

import { nearWalletRegex } from "../../../utils/near";

export interface IAddressFormValues {
  alias: string;
  wallet: string;
  email: string;
  phone: string;
}

interface IAddressFormProps {
  disabled: boolean;
  isEdit?: boolean;
  handleSubmit: (values: IAddressFormValues) => Promise<void>;
  initialValues?: IAddressFormValues;
}

export const AccountForm: React.FC<IAddressFormProps> = ({
  disabled,
  isEdit,
  handleSubmit,
  initialValues,
}) => {
  const form = useForm<IAddressFormValues>({
    validateInputOnChange: true,
    initialValues: initialValues || {
      alias: "",
      wallet: "",
      email: "",
      phone: "",
    },

    validate: {
      wallet: (value) =>
        nearWalletRegex.test(value) ? null : "Invalid wallet address",
      alias: (value) => (value.length > 0 ? null : "Alias is required"),
      phone: (value) =>
        !value
          ? null
          : isValidPhoneNumber(value)
          ? null
          : "Invalid phone number",
      email: (value) =>
        !value
          ? null
          : /^\S+@\S+$/.test(value)
          ? null
          : "Invalid email address",
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <TextInput
        withAsterisk={!isEdit}
        disabled={isEdit}
        label="Alias"
        description={
          !isEdit &&
          "Enter the alias for the account. Alias is a human readable description, through which you will be able to get the address."
        }
        placeholder="Enter alias for account"
        {...form.getInputProps("alias")}
      />

      <TextInput
        mt="sm"
        withAsterisk={!isEdit}
        disabled={isEdit}
        label="Wallet address"
        description={
          !isEdit &&
          "Paste the wallet address you want to add to your address book"
        }
        placeholder="Enter wallet address"
        {...form.getInputProps("wallet")}
      />

      <TextInput
        mt="sm"
        label="Email address (optional)"
        description="If you wish, you can add the email of the user."
        placeholder="Enter email address"
        type="email"
        {...form.getInputProps("email")}
      />

      <TextInput
        mt="sm"
        type="tel"
        label="Phone (optional)"
        description="If you wish, you can add the phone number of the user."
        placeholder="Enter phone number"
        {...form.getInputProps("phone")}
      />

      <Group position="right" mt="md">
        <Button type="submit" variant="light" disabled={disabled}>
          {isEdit ? "Edit address" : "Add address"}
        </Button>
      </Group>
    </form>
  );
};
