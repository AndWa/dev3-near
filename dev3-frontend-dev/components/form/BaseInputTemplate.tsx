import * as React from "react";
import {
  ariaDescribedByIds,
  examplesId,
  FormContextType,
  getInputProps,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from "@rjsf/utils";
import { Input } from "@mantine/core";

import { AddressSpotlight } from "../payments/AddressSpotlight";
import { camelCaseToTitleCase } from "../../utils/text";

const ADDRESS_PATERN =
  "^(([a-z\\d]+[-_])*[a-z\\d]+\\.)*([a-z\\d]+[-_])*[a-z\\d]+$";

export default function BaseInputTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any
>(props: WidgetProps<T, S, F>) {
  const {
    id,
    type,
    value,
    label,
    schema,
    uiSchema,
    onChange,
    onBlur,
    onFocus,
    options,
    required,
    readonly,
    rawErrors,
    autofocus,
    placeholder,
    disabled,
    registry,
  } = props;
  const inputProps = getInputProps<T, S, F>(schema, type, options);
  const { schemaUtils } = registry;

  const _onChange = ({
    target: { value },
  }: React.ChangeEvent<HTMLInputElement>) =>
    onChange(value === "" ? options.emptyValue : value);
  const _onBlur = ({ target: { value } }: React.FocusEvent<HTMLInputElement>) =>
    onBlur(id, value);
  const _onFocus = ({
    target: { value },
  }: React.FocusEvent<HTMLInputElement>) => onFocus(id, value);

  const displayLabel =
    schemaUtils.getDisplayLabel(schema, uiSchema) &&
    (!!label || !!schema.title);

  const handleAddressSelect = (value: string) => {
    onChange(value);
  };

  const formattedLabel = React.useMemo(() => {
    const text = label || schema.title;
    return camelCaseToTitleCase(text);
  }, [label, schema.title]);

  return (
    <Input.Wrapper
      mb={1}
      label={displayLabel ? formattedLabel : undefined}
      description={schema.description}
    >
      <Input
        id={id}
        name={id}
        value={value || value === 0 ? value : ""}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        autoFocus={autofocus}
        placeholder={placeholder}
        pattern={schema.pattern}
        {...inputProps}
        list={schema.examples ? examplesId<T>(id) : undefined}
        aria-describedby={ariaDescribedByIds<T>(id, !!schema.examples)}
        disabled={disabled || readonly}
        required={required}
        readOnly={readonly}
        invalid={rawErrors && rawErrors.length > 0}
        rightSection={
          schema.pattern === ADDRESS_PATERN ? (
            <AddressSpotlight onSelect={handleAddressSelect} />
          ) : null
        }
      />
      {schema.examples ? (
        <datalist id={examplesId<T>(id)}>
          {(schema.examples as string[])
            .concat(schema.default ? ([schema.default] as string[]) : [])
            .map((example: any) => {
              return <option key={example} value={example} />;
            })}
        </datalist>
      ) : null}
    </Input.Wrapper>
  );
}
