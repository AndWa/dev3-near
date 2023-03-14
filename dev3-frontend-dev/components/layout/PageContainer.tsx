import {
  Container,
  ContainerProps,
  MediaQuery,
  Paper,
  PaperProps,
  Stack,
  Title,
} from "@mantine/core";
import React, { PropsWithChildren } from "react";

const ResponsivePaper: React.FC<PaperProps> = (props) => {
  return (
    <>
      <MediaQuery largerThan="sm" styles={{ display: "none" }}>
        <Paper p="xs" {...props} />
      </MediaQuery>

      <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
        <Paper p="xl" {...props} />
      </MediaQuery>
    </>
  );
};

interface IPageContainerProps extends PropsWithChildren {
  title?: string;
  containerProps?: ContainerProps;
}

export const PageContainer: React.FC<IPageContainerProps> = ({
  title,
  children,
  containerProps,
}) => {
  return (
    <Container p="0" {...containerProps}>
      <ResponsivePaper withBorder shadow="sm">
        <Stack>
          {title && <Title order={2}>{title}</Title>}

          {children}
        </Stack>
      </ResponsivePaper>
    </Container>
  );
};
