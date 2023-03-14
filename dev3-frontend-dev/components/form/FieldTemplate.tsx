import React from "react";
import {
  FieldTemplateProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from "@rjsf/utils";
import { Box } from "@mantine/core";

export default function FieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: FieldTemplateProps<T, S, F>) {
  const { id, children, errors, help, hidden } = props;

  const { classNames = "" } = props;
  return (
    <Box
      id={id}
      className={classNames}
      mb="md"
      style={{ display: hidden ? "none" : undefined }}
    >
      {children}
      {errors}
      {help}
    </Box>
  );
}
