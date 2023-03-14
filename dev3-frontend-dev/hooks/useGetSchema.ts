import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useWalletSelector } from "../context/WalletSelectorContext";
import { getSchemaFromCodeView } from "../utils/raen";

export function useGetSchema(contractId: string) {
  const { getViewCode } = useWalletSelector();

  return useQuery({
    queryKey: ["schema", contractId],
    queryFn: async () => {
      const code = await getViewCode(contractId);

      if (!code) {
        throw new Error(`Contract code for ${contractId} not found`);
      }

      return await getSchemaFromCodeView(code);
    },
  });
}
