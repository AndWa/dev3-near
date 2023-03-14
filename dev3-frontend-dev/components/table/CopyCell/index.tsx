import { Group, Text } from "@mantine/core";
import React from "react";

import { CopyActionButton } from "../../core/CopyActionButton";

interface ICopyCellProps extends React.PropsWithChildren {
  value: string;
}

export const CopyCell: React.FC<ICopyCellProps> = ({ value, children }) => {
  if (!value) {
    return <Text>-</Text>;
  }

  return (
    <Group>
      {children || value}
      <CopyActionButton value={value} />
    </Group>
  );
};
