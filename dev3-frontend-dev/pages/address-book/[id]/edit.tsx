import { Flex, Loader } from "@mantine/core";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import {
  AccountForm,
  IAddressFormValues,
} from "../../../components/address-book/AddressForm";
import { PageContainer } from "../../../components/layout/PageContainer";
import {
  fetchAddressControllerUpdate,
  useAddressControllerFindOne,
} from "../../../services/api/dev3Components";
import { notifications } from "../../../utils/notifications";

export const EditAddress = () => {
  const router = useRouter();
  const id = useMemo(() => {
    return String(router.query.id);
  }, [router.query.id]);
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useAddressControllerFindOne({
    pathParams: {
      id,
    },
  });

  const handleSubmit = async ({ email, phone }: IAddressFormValues) => {
    setIsEditing(true);

    try {
      notifications.create({
        title: "Editing the address",
        message: "Please wait...",
      });

      await fetchAddressControllerUpdate({
        pathParams: { id },
        body: {
          email: (email || null) as any,
          phone: (phone || null) as any,
        },
      });

      notifications.success({
        title: "Address edited!",
        message: "The address was successfully edited.",
      });

      router.push(`/address-book`);
    } catch (error) {
      notifications.error({
        title: "Error while editing address",
        message:
          "There was an error editing the address. Please try again later.",
      });
      console.error(error);
    } finally {
      setIsEditing(false);
    }
  };
  return (
    <PageContainer title="Edit address information">
      <>
        {isLoading && (
          <Flex mih={412} align="center" justify="center">
            <Loader size="lg" />
          </Flex>
        )}
        {data && (
          <AccountForm
            isEdit
            disabled={isEditing}
            handleSubmit={handleSubmit}
            initialValues={data}
          />
        )}
      </>
    </PageContainer>
  );
};

export default EditAddress;
