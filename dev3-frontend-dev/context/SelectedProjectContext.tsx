import { useLocalStorage } from "@mantine/hooks";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useContext, useMemo } from "react";

import { Project } from "../services/api/dev3Schemas";
import { useWalletSelector } from "./WalletSelectorContext";

interface UseSelectedProject {
  projectId?: string;
  setProjectId: (projectId: string) => void;
}

const ProjectContext = React.createContext<UseSelectedProject | null>(null);

function deserializeJSON(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export const SelectedProjectProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { selector } = useWalletSelector();
  const accountId = selector.store.getState().accounts?.[0]?.accountId;
  const [projectId, setProjectId] = useLocalStorage({
    key: `projectId:${accountId}`,
    getInitialValueInEffect: true,
    deserialize: (value: string) => {
      return value ? deserializeJSON(value) : null;
    },
  });
  const router = useRouter();

  const value = useMemo(() => {
    return new Proxy(
      {
        projectId,
        setProjectId,
      },
      {
        get(target, prop, receiver) {
          if (prop === "projectId" && projectId === null) {
            router.push("/");
          }
          return Reflect.get(target, prop, receiver);
        },
      }
    );
  }, [projectId, setProjectId]);

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

export function useSelectedProject() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error(
      "useSelectedProject must be used within a SelectedProjectProvider"
    );
  }

  return context;
}
