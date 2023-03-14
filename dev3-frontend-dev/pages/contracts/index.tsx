import { Button, Tabs } from "@mantine/core";
import { NextLink } from "@mantine/next";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { Plus, ThreeDCubeSphere, ClockHour4, Rocket } from "tabler-icons-react";

import { DeployedContracts } from "../../components/contracts/DeployedContracts";
import { DeployRequests } from "../../components/contracts/DeployRequests";
import { PendingTransactions } from "../../components/contracts/PendingTransactions";
import { PageContainer } from "../../components/layout/PageContainer";
import { useSelectedProject } from "../../context/SelectedProjectContext";

const Contracts: NextPage = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string | null>(
    () => (router.query.tab as string) ?? "contracts"
  );

  return (
    <PageContainer title="Contracts" containerProps={{ fluid: true }}>
      <Button
        sx={{ alignSelf: "self-end" }}
        component={NextLink}
        href={`/contracts/create`}
        variant="light"
        leftIcon={<Plus />}
      >
        Deploy from template
      </Button>

      <Tabs value={activeTab} onTabChange={setActiveTab}>
        <Tabs.List defaultValue="contracts">
          <Tabs.Tab value="contracts" icon={<ThreeDCubeSphere size={14} />}>
            Contracts
          </Tabs.Tab>
          <Tabs.Tab value="pending" icon={<ClockHour4 size={14} />}>
            Pending Transactions
          </Tabs.Tab>
          <Tabs.Tab value="deploy" icon={<Rocket size={14} />}>
            Deploy Requests
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="contracts">
          <DeployedContracts />
        </Tabs.Panel>
        <Tabs.Panel value="pending">
          <PendingTransactions />
        </Tabs.Panel>
        <Tabs.Panel value="deploy">
          <DeployRequests />
        </Tabs.Panel>
      </Tabs>
    </PageContainer>
  );
};

export default Contracts;
