import {
  HDSTab,
  HDSTabBar,
  HDSTabPanel,
  HDSTabPanelContainer,
} from "@here/hds-react-components";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import React, { useEffect, useState } from "react";

import HDSForm, {
  HDSFormProps,
  Indexable,
  UI_LAYOUT,
  UI_LAYOUT_TAB,
} from "../HDSForm";
import { UiSchema } from "@rjsf/core";

export type { Indexable } from "../HDSForm";
export const KEY_ROOT = "_root_";

interface SubSchema {
  key: string;
  label: string;
  schema: JSONSchema7;
}

const splitSchema: (schema: JSONSchema7, uiSchema?: UiSchema) => SubSchema[] = (
  schema,
  uiSchema
) => {
  const res: SubSchema[] = [];
  const { properties } = schema;
  const generalProperties: { [key: string]: JSONSchema7Definition } = {};
  if (properties) {
    res.push({
      key: KEY_ROOT,
      label: schema.title ? schema.title : "General",
      schema: {
        $schema: schema.$schema
          ? schema.$schema
          : "http://json-schema.org/draft-07/schema#",
        type: schema.type ? schema.type : "object",
        properties: generalProperties,
        definitions: schema.definitions,
        readOnly: schema.readOnly,
        required: schema.required,
      },
    });

    Object.keys(properties).forEach((propKey) => {
      const prop = properties[propKey];
      const schemaProp = prop as JSONSchema7;
      let type: string = schemaProp.type as string;
      if (type === undefined && schemaProp.$ref) type = "ref";
      const tabLayout =
        uiSchema &&
        uiSchema[propKey] &&
        uiSchema[propKey][UI_LAYOUT] === UI_LAYOUT_TAB;
      if (
        tabLayout &&
        (type === "ref" || type === "object" || type === "array")
      ) {
        const subSchema: JSONSchema7 = { ...schemaProp };
        // Inherit common things from root schema
        subSchema.$schema = schema.$schema
          ? schema.$schema
          : "http://json-schema.org/draft-07/schema#";
        subSchema.definitions = schema.definitions;
        subSchema.readOnly = schema.readOnly;

        const title = schemaProp.title ? schemaProp.title : propKey;
        res.push({ key: propKey, label: title, schema: subSchema });
      } else {
        generalProperties[propKey] = prop;
      }
    });
  }
  return res;
};

export interface HDSTabbedFormProps extends HDSFormProps {
  formData: Indexable;
  formErrors: Indexable;
  extraTabLabels?: string[];
  extraTabPanels?: React.ReactNode[];
  onChange: (result: HDSTabbedFormResult) => void;
}

export interface HDSTabbedFormResult {
  data: Indexable;
  errors: Indexable; // List of errors for each tab, empty if no errors
}

// Display each top-level object with "ui:layout":"tab" on a separate tab
const HDSTabbedForm: React.FC<HDSTabbedFormProps> = ({
  formData,
  formErrors,
  schema,
  onChange,
  uiSchema,
  extraTabLabels,
  extraTabPanels,
  customWidgets,
}: HDSTabbedFormProps): JSX.Element | null => {
  const [formResult, setFormResult] = useState<HDSTabbedFormResult>({
    data: formData,
    errors: formErrors,
  });

  const subSchemas = splitSchema(schema, uiSchema);

  const myOnChange = (
    formData: any,
    errors: any[],
    schema: JSONSchema7,
    key: string
  ) => {
    setFormResult((prevResult) => {
      // React needs a copy of the objects to notice changes at upper level
      let result = {
        data: { ...prevResult.data },
        errors: { ...prevResult.errors },
      };

      // Merge the errors from one Tab to the complete errors
      if (errors && errors.length > 0) result.errors[key] = errors;
      else delete result.errors[key];

      // Merge the data from one Tab to the complete data
      if (key === KEY_ROOT) {
        Object.assign(result.data, formData);
      } else {
        if (result.data[key] && schema.type === "object") {
          Object.assign(result.data[key], formData);
        } else {
          result.data[key] = formData;
        }
      }
      return result;
    });
  };

  // Note: useEffect is called twice on state update even in prd build.
  // It could be prevented by a useRef trick, not sure it is a good idea...
  useEffect(() => {
    onChange(formResult);
  }, [onChange, formResult]);

  const tabBar = (
    <HDSTabBar id="hdstabbedform-bar" selectFirstTab>
      {subSchemas.map(({ key, label }) => (
        <HDSTab key={key} tabPanelId={"hdstabbedform-panel-" + key}>
          {label}
        </HDSTab>
      ))}
      {extraTabLabels &&
        extraTabLabels.map((label) => (
          <HDSTab key={label} tabPanelId={"hdstabbedform-panel-" + label}>
            {label}
          </HDSTab>
        ))}
    </HDSTabBar>
  );

  const buildUiSchema = (key: string, uiSchema?: UiSchema) => {
    if (uiSchema && key !== KEY_ROOT) uiSchema = uiSchema[key];
    return { "ui:rootFieldId": key, [UI_LAYOUT]: UI_LAYOUT_TAB, ...uiSchema };
  };

  // in case schema provided doesn't include more than subSchema or extraTabLabels props is undefined/empty list
  // return HDSForm instead of the tabbed version
  return (subSchemas && subSchemas.length > 1) ||
    (extraTabLabels && extraTabLabels.length > 0) ? (
    <div>
      {tabBar}
      <HDSTabPanelContainer tabBarId="hdstabbedform-bar">
        {subSchemas.map(({ key, schema }) => (
          <HDSTabPanel key={key} id={"hdstabbedform-panel-" + key}>
            <HDSForm
              key={key}
              schema={schema}
              formData={
                key === KEY_ROOT ? formData : formData[key] ? formData[key] : {}
              }
              onChange={(formData, errors, schema) => {
                myOnChange(formData, errors, schema, key);
              }}
              uiSchema={buildUiSchema(key, uiSchema)}
              customWidgets={customWidgets}
            />
          </HDSTabPanel>
        ))}

        {extraTabLabels &&
          extraTabPanels &&
          extraTabLabels.map((label, i) => (
            <HDSTabPanel key={label} id={"hdstabbedform-panel-" + label}>
              {extraTabPanels[i] ? extraTabPanels[i] : "Panel missing"}
            </HDSTabPanel>
          ))}
      </HDSTabPanelContainer>
    </div>
  ) : (
    <>
      {subSchemas.map(({ key, schema }) => (
        <HDSForm
          key={key}
          schema={schema}
          formData={key === KEY_ROOT ? formData : formData ? formData : {}}
          onChange={(formData, errors, schema) => {
            myOnChange(formData, errors, schema, key);
          }}
          uiSchema={buildUiSchema(key, uiSchema)}
          customWidgets={customWidgets}
        />
      ))}
    </>
  );
};

export default HDSTabbedForm;
