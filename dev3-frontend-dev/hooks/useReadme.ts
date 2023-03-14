import { useQuery } from "@tanstack/react-query";
import fetch from "isomorphic-fetch";

export const useReadme = (url: string) => {
  return useQuery({
    queryKey: ["readme", url],
    queryFn: () => {
      return fetch(url).then((res) => res.text());
    },
  });
};
