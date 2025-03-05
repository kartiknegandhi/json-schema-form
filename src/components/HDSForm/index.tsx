import React, { useCallback, useEffect, useState } from "react";

import { JSONSchema7, JSONSchema7TypeName } from "json-schema";
import "./index.scss";

import {
  HDSButton,
  HDSIcon,
  HDSRadioGroup,
  HDSRadio,
  HDSTooltip,
  HDSInput,
  HDSLabel,
} from "@here/hds-react-components";

import HDSWidgets from "../HDSWidgets";
import ErrorWrapper from "../ErrorWrapper";
import Form, {
  ArrayFieldTemplateProps,
  FieldProps,
  FieldTemplateProps,
  IChangeEvent,
  ObjectFieldTemplateProps,
  Registry,
  UiSchema,
  utils,
} from "@rjsf/core";

// The UISchema option which specifies the layout of an object
export const UI_LAYOUT = "ui:layout";
export const UI_LAYOUT_TAB = "tab";
export const UI_LAYOUT_INLINE = "inline";

import "./index.scss";

const CustomLabel: React.FC<{
  label: string;
  description?: string;
  required?: boolean;
  schema: JSONSchema7;
  registry: Registry;
}> = ({ label, description, schema, required, registry }) => {
  const [labelClassName, setLabelClassName] = useState("");
  const optional = schema?.type === "array" || required ? "" : "Optional";

  useEffect(() => {
    let className = "";
    if (schema?.type === "array" && "$ref" in (schema?.items as any)) {
      const referenceSchema = utils.resolveSchema(
        schema.items as any,
        registry["rootSchema"]
      );
      className =
        referenceSchema?.type === "object"
          ? "hds-strong--small gray-700"
          : "hds-body--small";
    } else if (
      schema?.type === "array" &&
      !("enum" in (schema?.items as any))
    ) {
      // multi-selects have enum in schema.items
      // $ref indicates that the schema of this item is derived from another object in the overall schema
      // ignoring both these items
      className = "hds-strong gray-700";
    } else if (schema?.type === "object") {
      className = "hds-strong--small gray-700";
    } else {
      className = "hds-body--small";
    }
    setLabelClassName(className);
  }, [schema, registry]);

  return (
    <HDSLabel
      primaryLabel={
        <div className="labelContainer">
          <label className={labelClassName}>{label}</label>
          {description && (
            <div className="info-icon">
              <HDSTooltip
                position="right"
                interactive={false}
                content={description}
              >
                <HDSIcon
                  name="information"
                  category="core-ui"
                  size="16px"
                  onNotFound={(e: any) => console.log("icon not found > ", e)}
                ></HDSIcon>
              </HDSTooltip>
            </div>
          )}
        </div>
      }
      secondaryLabel={<span className="hds-caption">{optional}</span>}
      variant={"default"}
      type={"default"}
    />
  );
};

function HDSFieldTemplate(props: FieldTemplateProps) {
  // console.log("HDSFieldTemplate", props);
  const {
    classNames,
    help,
    children,
    label,
    schema,
    required,
    uiSchema,
    registry,
  } = props;

  if (
    uiSchema &&
    uiSchema[UI_LAYOUT] &&
    uiSchema[UI_LAYOUT] === UI_LAYOUT_TAB
  ) {
    // No title tab objects, could also do other specials here
    return (
      <div className={"tab " + classNames}>
        {children}
        {help}
      </div>
    );
  } else {
    return (
      <div className={classNames}>
        {label && (
          <CustomLabel
            label={label}
            description={schema.description}
            schema={schema}
            registry={registry}
            required={required}
          ></CustomLabel>
        )}
        {children}
        {help}
      </div>
    );
  }
}

function HDSObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  // XXX Should handle additionalProperties if they are needed?
  // console.log("HDSObjectFieldTemplate", props);
  // HDS bug: Select widgets have minimum width of 320px, only 2 may fit on one row

  const className =
    props.uiSchema &&
    props.uiSchema[UI_LAYOUT] &&
    props.uiSchema[UI_LAYOUT] === UI_LAYOUT_INLINE
      ? "inline-object"
      : "object";
  return (
    <div className={className}>
      {props.properties.map((prop) => (
        <div className="prop" key={prop.content.key}>
          {prop.content}
        </div>
      ))}
    </div>
  );
}

function HDSArrayFieldTemplate(props: ArrayFieldTemplateProps) {
  const canRemove =
    props.items && props.schema.minItems
      ? props.items.length > props.schema.minItems
      : true;

  return (
    <div className={props.className}>
      {!props.readonly && props.canAdd && (
        <div className="row array-add-button">
          <p className="array-item-add text-right">
            <HDSButton
              variant="primary"
              size="small"
              type="button"
              icon="plus"
              iconCategory="core-ui"
              onClick={props.onAddClick}
            >
              Add new
            </HDSButton>
          </p>
        </div>
      )}
      {props.items &&
        props.items.map((element) => (
          <div key={element.key} className={element.className}>
            <div className="array-item">{element.children}</div>
            <div className="array-item-buttons">
              {!props.readonly && element.hasMoveDown && (
                <HDSButton
                  className="HDSForm_IconButton"
                  variant="secondary"
                  size="small"
                  icon="arrow-down"
                  iconCategory="core-ui"
                  iconOnly={true}
                  type="button"
                  onClick={element.onReorderClick(
                    element.index,
                    element.index + 1
                  )}
                ></HDSButton>
              )}
              {!props.readonly && element.hasMoveUp && (
                <HDSButton
                  className="HDSForm_IconButton"
                  variant="secondary"
                  size="small"
                  icon="arrow-up"
                  iconCategory="core-ui"
                  iconOnly={true}
                  type="button"
                  onClick={element.onReorderClick(
                    element.index,
                    element.index - 1
                  )}
                ></HDSButton>
              )}
              {!props.readonly && element.hasRemove && canRemove && (
                <HDSButton
                  size="small"
                  onClick={element.onDropIndexClick(element.index)}
                  variant="secondary"
                  icon="delete"
                  iconOnly={true}
                  type="button"
                ></HDSButton>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}

const HDSBooleanField = function (props: FieldProps) {
  const _onChange = ({
    detail: { value },
  }: {
    detail: { value: string; index: number };
  }) => props.onChange(value === "true");

  const v = props.formData ?? props.value ?? props.schema.default ?? false;
  return (
    <HDSRadioGroup onChange={_onChange} disabled={props.readonly}>
      <HDSRadio value="true" checked={v}>
        Yes
      </HDSRadio>
      <HDSRadio value="false" checked={!v}>
        No
      </HDSRadio>
    </HDSRadioGroup>
  );
};

const HDSNumberField = function ({
  required,
  readonly,
  disabled,
  formData,
  rawErrors,
  value,
  schema,
  id = "",
  name,
  placeholder,
  onChange,
  onBlur,
  onFocus,
  ...rest
}: FieldProps) {
  const _onBlur = useCallback(
    (value: any) => {
      onBlur(id || name, value);
    },
    [id, name, onBlur]
  );

  const _onFocus = useCallback(
    (value: any) => onFocus(id || name, value),
    [id, name, onFocus]
  );
  const [formValue, setFormValue] = useState(
    formData === null || formData === undefined || formData === ""
      ? ""
      : formData
  );

  // if event.detail is not a number, immediately assign as undefined
  // else if schema type is number, assign undefined if empty or else convert to number
  const _onChange = useCallback(
    (e: any) => {
      let eventValue;
      if (isNaN(e.target.value)) {
        eventValue = undefined;
      } else if (schema?.type === "number") {
        eventValue = e.target.value === "" ? undefined : +e.target.value;
      } else {
        eventValue = e.target.value;
      }
      // maintaining local state because state received from props loses cursor position
      setFormValue(eventValue);

      onChange(eventValue);
    },
    [onChange, schema?.type]
  );

  const _onKeyDown = useCallback(
    (e: any) => {
      if (!e.ctrlKey && !e.metaKey) {
        const allowedCharsForNumber = "-0123456789.";
        const allowedCharsForInteger = "-0123456789";
        const contains = (stringValue: string, charValue: string) => {
          return stringValue.indexOf(charValue) > -1;
        };
        const invalidKey =
          (e.key.length === 1 &&
            !contains(
              schema?.type === "number"
                ? allowedCharsForNumber
                : allowedCharsForInteger,
              e.key
            )) ||
          (e.key === "." && contains(e.target.value, "."));
        invalidKey && e.preventDefault();
      }
    },
    [schema?.type]
  );

  return (
    <ErrorWrapper errors={rawErrors as any}>
      <HDSInput
        id={id || name}
        placeholder={placeholder}
        type={schema.type === "integer" ? "number" : "text"}
        value={formValue}
        required={required}
        readonly={readonly}
        disabled={disabled}
        onInput={_onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        onKeyDownCapture={_onKeyDown}
        error={rawErrors && rawErrors.length > 0}
        title=""
      />
    </ErrorWrapper>
  );
};

const customFields = {
  BooleanField: HDSBooleanField,
  NumberField: HDSNumberField,
};

export interface Indexable {
  [key: string]: any;
}

export interface HDSFormProps {
  schema: JSONSchema7;
  formData: Indexable;
  onChange: (formData: any, errors: any[], schema: JSONSchema7) => void;
  idPrefix?: string;
  uiSchema?: UiSchema;
  customWidgets?: Indexable;
}

const HDSForm: React.FC<HDSFormProps> = ({
  schema,
  formData,
  onChange,
  idPrefix,
  uiSchema,
  customWidgets,
}) => {
  const myOnChange = useCallback(
    (e: IChangeEvent<any>) => {
      onChange(e.formData, e.errors, e.schema);
    },
    [onChange]
  );

  const widgets = { ...HDSWidgets };
  if (customWidgets) Object.assign(widgets, customWidgets);

  return (
    <Form
      idPrefix={idPrefix}
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      widgets={widgets}
      fields={customFields}
      FieldTemplate={HDSFieldTemplate}
      ObjectFieldTemplate={HDSObjectFieldTemplate}
      ArrayFieldTemplate={HDSArrayFieldTemplate}
      showErrorList={false}
      onChange={myOnChange}
      liveValidate
      children
    />
  );
};

export default HDSForm;
