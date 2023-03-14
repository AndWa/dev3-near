import { NextPage } from "next";

import { CreateContract } from "../../components/contracts/CreateContract";
import { PageContainer } from "../../components/layout/PageContainer";

const CreateContractPage: NextPage = () => {
  return (
    <PageContainer
      title="Create contract deployment request"
      containerProps={{ size: "xl" }}
    >
      <CreateContract />
    </PageContainer>
  );
};

export default CreateContractPage;
