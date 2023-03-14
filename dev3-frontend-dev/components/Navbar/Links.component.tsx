import { Box, NavLink } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import {
  ArrowsLeftRight,
  Book,
  Settings,
  ThreeDCubeSphere,
} from "tabler-icons-react";

const getTopSectionData = () => [
  {
    icon: <ThreeDCubeSphere size={24} />,
    label: "Contracts",
    href: `/contracts`,
  },
  {
    icon: <ArrowsLeftRight size={24} />,
    label: "Payment Requests",
    href: `/payments`,
  },
  {
    icon: <Book size={24} />,
    label: "Address Book",
    href: "/address-book",
  },
];

const getBottomSectionData = () => [
  {
    icon: <Settings size={24} />,
    label: "Settings",
    href: `/settings`,
  },
];

export interface MainLinkProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  as?: string;
  disabled: boolean;
}

export function AppLink({ icon, label, href, disabled, as }: MainLinkProps) {
  const router = useRouter();

  return (
    <Box mb={8}>
      <Link href={href} as={as} passHref>
        <NavLink
          disabled={disabled}
          label={label}
          sx={(theme) => ({
            // padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
          })}
          active={router.pathname.startsWith(href)}
          icon={icon}
        />
      </Link>
    </Box>
  );
}

export interface LinksProps {
  disabled: boolean;
}

export function AppLinks({ disabled }: LinksProps) {
  const links = getTopSectionData().map((link) => (
    <AppLink {...link} key={link.label} disabled={disabled} />
  ));
  return <div>{links}</div>;
}

export function AppLinksBottom({ disabled }: LinksProps) {
  const links = getBottomSectionData().map((link) => (
    <AppLink {...link} disabled={disabled} key={link.label} />
  ));
  return <div>{links}</div>;
}
