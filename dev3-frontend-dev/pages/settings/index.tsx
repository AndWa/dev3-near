import { Skeleton } from "@mantine/core";
import { NextPage } from "next";

import { PageContainer } from "../../components/layout/PageContainer";
import { ApiKeySettings } from "../../components/settings/ApiKeySettings";
import { SettingsForm } from "../../components/settings/SettingsForm";
import { useSelectedProject } from "../../context/SelectedProjectContext";
import { useProjectControllerFindById } from "../../services/api/dev3Components";

const Settings: NextPage = () => {
  const { projectId } = useSelectedProject();
  const { data, isLoading } = useProjectControllerFindById(
    {
      pathParams: {
        id: projectId as string,
      },
    },
    {
      enabled: Boolean(projectId),
    }
  );

  return (
    <>
      <PageContainer title="Settings">
        <Skeleton visible={isLoading} mih={400}>
          {data && <SettingsForm project={data} />}
        </Skeleton>
      </PageContainer>
      <PageContainer title="API key management" containerProps={{ mt: "md" }}>
        <ApiKeySettings />
      </PageContainer>
    </>
  );
};

export default Settings;
