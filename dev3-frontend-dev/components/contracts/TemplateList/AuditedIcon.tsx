import { ThemeIcon, Tooltip } from "@mantine/core";
import React from "react";
import { AlertCircle, CircleCheck } from "tabler-icons-react";

interface IAuditedIconProps {
  isAudited: boolean;
}

export const AuditedIcon: React.FC<IAuditedIconProps> = ({ isAudited }) => {
  return (
    <Tooltip label={isAudited ? "Audited contact" : "Contract is not audited!"}>
      <ThemeIcon
        color={isAudited ? "green" : "yellow"}
        size="lg"
        variant="light"
        radius="xl"
      >
        {isAudited ? <CircleCheck size={20} /> : <AlertCircle size={20} />}
      </ThemeIcon>
    </Tooltip>
  );
};
