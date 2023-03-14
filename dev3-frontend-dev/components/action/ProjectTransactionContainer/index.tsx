import {
  Avatar,
  Container,
  createStyles,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import React, { PropsWithChildren } from "react";
import { getLogoPlaceholder } from "../../../utils/logo";

const ICON_SIZE = 80;

const useStyles = createStyles((theme) => ({
  card: {
    position: "relative",
    overflow: "visible",
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xl * 1.5 + ICON_SIZE / 3,
  },

  icon: {
    position: "absolute",
    top: -ICON_SIZE / 3,
    left: `calc(50% - ${ICON_SIZE / 2}px)`,
  },

  title: {
    lineHeight: 1,
  },
}));

interface IActionContainerProps extends PropsWithChildren {
  logoUrl?: string;
  projectName?: string;
  description?: string;
}

export const ProjectTransactionContainer: React.FC<IActionContainerProps> = ({
  projectName,
  logoUrl,
  description,
  children,
}) => {
  const { classes } = useStyles();

  return (
    <Container size="xs">
      <Paper radius="md" withBorder className={classes.card} mt={ICON_SIZE / 3}>
        <Avatar
          src={logoUrl}
          className={classes.icon}
          size={ICON_SIZE}
          radius={ICON_SIZE}
          color="blue"
        >
          {projectName ? getLogoPlaceholder(projectName) : ""}
        </Avatar>

        <Title order={3} align="center" className={classes.title}>
          {projectName}
        </Title>
        <Text color="dimmed" align="center" size="sm">
          {description}
        </Text>

        {children}
      </Paper>
    </Container>
  );
};
