import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import React from "react";

export interface IContractFormValues {
  alias: string;
}

interface IContractFormProps {
  disabled: boolean;
  handleSubmit: (values: IContractFormValues) => Promise<void>;
}

export const ContractForm: React.FC<IContractFormProps> = ({
  disabled,
  handleSubmit,
}) => {
  const form = useForm<IContractFormValues>({
    initialValues: {
      alias: "",
    },
    validateInputOnChange: true,
    validate: {
      alias: (value) =>
        /^\w+$/.test(value)
          ? null
          : "The alias can contain only letters, numbers and dashes",
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
      <TextInput
        withAsterisk
        label="Contract alias"
        description="This is the alias you will use to access the contract through Dev3 SDK and API"
        {...form.getInputProps("alias")}
      />
      <Group position="right" mt="md">
        <Button type="submit" variant="light" disabled={disabled}>
          Create
        </Button>
      </Group>
    </form>
  );
};
