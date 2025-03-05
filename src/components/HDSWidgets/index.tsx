import React, { useState } from "react";

import Select from "react-select";
import {
  HDSInput,
  HDSTextarea,
  HDSSelectStyles,
  HDSSelectThemes,
  HDSSelectSingleOption,
  HDSSelectDropdownIndicator,
  HDSSelectClearIndicator,
  HDSSelectMultiOption,
  HDSSelectChips,
} from "@here/hds-react-components";
import ErrorWrapper from "../ErrorWrapper";
import { WidgetProps } from "@rjsf/core";

// Hack to work around missing HDS styles for disabled react-select
//  https://main.gitlab.in.here.com/design/here-design-system/web/hds/-/issues/778
export const HDSCustomSelectStylesNormal = {
  ...HDSSelectStyles,
  control: (styles: any, state: any) => ({
    ...HDSSelectStyles.control(styles, state),
    background: state.isDisabled
      ? "var(--hds-background-object)"
      : "var(--hds-background--primary)",
    "border-color": "",
  }),
};
export const HDSCustomSelectStylesError = {
  ...HDSSelectStyles,
  control: (styles: any, state: any) => ({
    ...HDSSelectStyles.control(styles, state),
    background: state.isDisabled
      ? "var(--hds-background-object)"
      : "var(--hds-background--primary)",
    borderColor: "var(--hds-negative) !important",
  }),
};

const HDSSelectWidget = ({
  id,
  options,
  required,
  readonly,
  value,
  multiple,
  rawErrors,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps) => {
  const { enumOptions, enumDisabled } = options;
  console.assert(!enumDisabled, "Disabling select options not supported");

  const _onBlur = (e: any) => onBlur(id, e.target.value);
  const _onFocus = (e: any) => onFocus(id, e.target.value);

  type MyOptionType = { label: string | undefined; value: string | undefined };

  const MenuList = (enumOptions as { value: any; label: any }[]).map(
    (option) => ({
      value: option.value,
      label: option.label,
    })
  );

  // Hacks via style since HDS Select does not support disabled state nor error reporting.
  // https://main.gitlab.in.here.com/design/here-design-system/web/hds/-/issues/778
  // https://main.gitlab.in.here.com/design/here-design-system/web/hds/-/issues/563
  const customStyle =
    rawErrors && rawErrors.length > 0
      ? HDSCustomSelectStylesError
      : HDSCustomSelectStylesNormal;

  if (multiple) {
    let selected = undefined;
    const values = value as string[];
    selected = MenuList.filter((v) => values.indexOf(v.value) >= 0);

    const _onChange = (selected?: any | null) => {
      if (selected) {
        const v = (selected as MyOptionType[]).map((item) => item.value);
        // XXX This callback sometimes breaks validation of the whole form if named enums are used
        // https://github.com/rjsf-team/react-jsonschema-form/issues/2565
        onChange(v);
      }
    };

    return (
      <Select
        options={MenuList}
        defaultValue={selected}
        styles={customStyle}
        theme={HDSSelectThemes}
        isMulti
        isDisabled={readonly}
        isClearable={!required && !readonly}
        hideSelectedOptions={false}
        closeMenuOnSelect={false}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        components={{
          Option: HDSSelectMultiOption,
          MultiValue: HDSSelectChips,
          DropdownIndicator: HDSSelectDropdownIndicator,
          ClearIndicator: HDSSelectClearIndicator,
        }}
      />
    );
  } else {
    const defVal = MenuList.find((e) => e.value === value);
    const _onChange = (selected?: MyOptionType | MyOptionType[] | null) => {
      if (selected) {
        const v = (selected as MyOptionType).value;
        onChange(v);
      } else onChange(undefined);
    };

    return (
      <Select
        options={MenuList}
        defaultValue={defVal}
        styles={customStyle}
        theme={HDSSelectThemes}
        isDisabled={readonly}
        isClearable={!required && !readonly}
        onChange={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        components={{
          Option: HDSSelectSingleOption,
          DropdownIndicator: HDSSelectDropdownIndicator,
          ClearIndicator: HDSSelectClearIndicator,
        }}
      />
    );
  }
};

const HDSTextWidget = ({
  id,
  placeholder,
  required,
  readonly,
  disabled,
  value,
  onChange,
  onBlur,
  onFocus,
  options,
  schema,
  rawErrors,
}: WidgetProps) => {
  const _onBlur = (value: any) => onBlur(id, value);
  const _onFocus = (value: any) => onFocus(id, value);
  const [formValue, setFormValue] = useState(value);

  // TODO: Instead of taking the first example, could provide auto-complete with them?
  if (!placeholder && schema.examples && Array.isArray(schema.examples))
    placeholder = "" + schema.examples[0];

  // XXX HDSInput has wrong typings!
  const _onInputChange = (e: any) => {
    // console.log("HDSInput _onInputChange", e);
    // maintaining local state because state received from props loses cursor position
    setFormValue(e.target.value || options?.emptyValue || undefined);
    onChange(e.target.value || options?.emptyValue || undefined);
  };

  return (
    <ErrorWrapper errors={rawErrors!}>
      <HDSInput
        id={id}
        placeholder={placeholder}
        // label={label || schema.title}
        // autoFocus={autofocus}
        required={required}
        disabled={disabled}
        readonly={readonly}
        type="text"
        value={formValue}
        onInput={_onInputChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        error={rawErrors && rawErrors.length > 0}
        title=""
      />
    </ErrorWrapper>
  );
};

const HDSTextareaWidget = ({
  id,
  placeholder,
  readonly,
  disabled,
  value,
  onChange,
  onBlur,
  onFocus,
  options,
  schema,
  rawErrors,
}: WidgetProps) => {
  const _onBlur = (value: any) => onBlur(id, value);
  const _onFocus = (value: any) => onFocus(id, value);
  const [formValue, setFormValue] = useState(value);

  // TODO: Instead of taking the first example, could provide auto-complete with them?
  if (!placeholder && schema.examples && Array.isArray(schema.examples))
    placeholder = "" + schema.examples[0];

  const schemaRows = options["rows"] ? +options["rows"] : 0;
  const _onAreaChange = (e: any) => {
    // console.log("HDSTextarea _onAreaChange", e);
    // maintaining local state because state received from props loses cursor position
    setFormValue(e.target.value || undefined);
    onChange(e.target.value || undefined);
  };
  return (
    <ErrorWrapper errors={rawErrors!}>
      <HDSTextarea
        resize="vertical"
        placeholder={placeholder}
        rows={
          schemaRows
            ? schemaRows
            : schema.maxLength
            ? Math.min(schema.maxLength / 80, 8)
            : 8
        }
        disabled={disabled}
        readonly={readonly}
        maxlength={schema.maxLength}
        error={rawErrors && rawErrors.length > 0}
        onInput={_onAreaChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        value={formValue}
        title=""
      />
    </ErrorWrapper>
  );
};

const HDSWidgets = {
  TextWidget: HDSTextWidget,
  TextareaWidget: HDSTextareaWidget,
  SelectWidget: HDSSelectWidget,
};

export default HDSWidgets;
