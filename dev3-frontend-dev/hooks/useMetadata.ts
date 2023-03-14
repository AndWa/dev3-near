import { useDebouncedValue } from "@mantine/hooks";
import { useEffect, useState } from "react";

import { useWalletSelector } from "../context/WalletSelectorContext";

export function useMetadata(enabled: boolean, contractId?: string) {
  const [metadata, setMetadata] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  const { viewMethod } = useWalletSelector();

  const [debouncedContractId] = useDebouncedValue(contractId, 300);

  useEffect(() => {
    if (!(debouncedContractId && enabled)) {
      return;
    }

    let finalized = false;

    const fetchMetadata = async () => {
      setIsLoading(true);

      try {
        const ftMetadata = await viewMethod(
          debouncedContractId,
          "ft_metadata",
          null
        );

        if (!finalized) {
          setMetadata(ftMetadata);
        }
      } catch {
        if (!finalized) {
          setMetadata(null);
        }
      } finally {
        if (!finalized) {
          setIsLoading(false);
        }
      }
    };

    fetchMetadata();

    return () => {
      finalized = true;
    };
  }, [setMetadata, setIsLoading, debouncedContractId, enabled]);

  return { debouncedContractId, isLoading, metadata };
}
