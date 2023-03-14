import { Skeleton } from "@mantine/core";
import React from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

import { useReadme } from "../../../hooks/useReadme";

interface IContractInfoProps {
  url: string;
}

export const ContractInfo: React.FC<IContractInfoProps> = ({ url }) => {
  const { data, isLoading } = useReadme(url);

  return (
    <>
      <Skeleton visible={isLoading}>
        {data && <ReactMarkdown>{data}</ReactMarkdown>}
      </Skeleton>
    </>
  );
};
