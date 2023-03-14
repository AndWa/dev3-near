import { NextPage } from "next";

import { ContractDetails } from "../../components/contracts/ContractDetails";
import { PageContainer } from "../../components/layout/PageContainer";

const DeployedContract: NextPage = () => {
  return (
    <PageContainer title="Contract Details">
      <ContractDetails />
    </PageContainer>
  );
};

export default DeployedContract;
