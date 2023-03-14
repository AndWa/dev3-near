import React from "react";
import {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  TitleFieldProps,
} from "@rjsf/utils";
import { Box, Title } from "@mantine/core";

export default function TitleField<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>({ id, title }: TitleFieldProps<T, S, F>) {
  return (
    <Title order={5} mb="sm" tt="capitalize" id={id}>
      {title}
    </Title>
  );
}
