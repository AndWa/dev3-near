import { Badge } from "@mantine/core";
import React from "react";

type Status = "Pending" | "Success" | "Failure";

interface ITransactionStatusProps {
  status: Status;
}

const colors: Record<Status, string> = {
  Pending: "yellow",
  Success: "green",
  Failure: "red",
};

export const TransactionStatus: React.FC<ITransactionStatusProps> = ({
  status,
}) => {
  return (
    <Badge size="lg" color={colors[status]}>
      {status}
    </Badge>
  );
};
