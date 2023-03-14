import { useRouter } from "next/router";
import { useState } from "react";
import "react-phone-number-input/style.css";

import {
  AccountForm,
  IAddressFormValues,
} from "../../components/address-book/AddressForm";
import { PageContainer } from "../../components/layout/PageContainer";
import { fetchAddressControllerCreate } from "../../services/api/dev3Components";
import { notifications } from "../../utils/notifications";

const CreateAddress = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async ({
    alias,
    wallet,
    email,
    phone,
  }: IAddressFormValues) => {
    try {
      setLoading(true);

      notifications.create({
        title: "Adding a new address",
        message: "Please wait...",
      });

      await fetchAddressControllerCreate({
        body: {
          alias,
          wallet,
          email: email === "" ? undefined : email,
          phone: phone === "" ? undefined : phone,
        },
      });

      notifications.success({
        title: "New address created!",
        message: "New address has been created. You can now use it.",
      });

      router.push(`/address-book`);
    } catch (error) {
      notifications.error({
        title: "Error while adding address",
        message:
          "There was an error adding new address. Please try again later.",
      });

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Add new address">
      <AccountForm disabled={loading} handleSubmit={handleSubmit} />
    </PageContainer>
  );
};

export default CreateAddress;
