import { ActionIcon, CopyButton, Tooltip } from "@mantine/core";
import React from "react";
import { Check, Copy } from "tabler-icons-react";

interface ICopyActionButtonProps {
  value: string;
}

export const CopyActionButton: React.FC<ICopyActionButtonProps> = ({
  value,
}) => {
  const handleClick = (copy: () => void) => {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      copy();
    };
  };

  return (
    <CopyButton value={value} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Copied" : "Copy"} withArrow position="bottom">
          <ActionIcon
            radius="xl"
            variant="light"
            color={copied ? "teal" : "primary"}
            onClick={handleClick(copy)}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
};
