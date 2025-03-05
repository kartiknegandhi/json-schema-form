// Customize JSON Schema and UI Schema for Workflow editor use:
// 1) Different create/update/view modes
// 2) Textarea widgets based on content type and size

import { JSONSchema7 } from "json-schema";
import { ProcessResult, processSchema } from "./schema-utils";
import { UiSchema } from "@rjsf/core";

// The UISchema options "ui:create", "ui:update", "ui:view" values
export const UI_HIDDEN = "hidden";
export const UI_DISABLED = "disabled";

export enum EditMode {
  Create = "create",
  Update = "update",
  View = "view",
}

export interface CustomizeSchemasProps {
  schema: JSONSchema7;
  uiSchema: UiSchema;
  editMode: EditMode;
}

// Note that the returned schemas may be modifed copies of the inputs.
export function customizeSchemas(
  props: CustomizeSchemasProps
): CustomizeSchemasProps {
  const { schema, uiSchema, editMode } = props;
  const newProps = { ...props };

  // The processSchema() patches the schemas in place, let's make deep copies.
  // JSON serialization loses some properties, but that's not a problem here.
  newProps.schema = JSON.parse(JSON.stringify(schema));
  newProps.uiSchema = JSON.parse(JSON.stringify(uiSchema));

  if (editMode === EditMode.View) {
    // TODO This gives an easy view mode, but perhaps the design should be different?
    // A different design could be implemented using another set of RJSF fields and widgets.
    newProps.schema.readOnly = props.editMode === EditMode.View;
  }

  let currentObject: ProcessResult = undefined; // used to patch "required" for hidden/disabled
  processSchema(newProps.schema, schemaProcessor);
  // console.info("customizeSchemas", newProps);
  return newProps;

  function schemaProcessor(path: string[], prop: ProcessResult, type: string) {
    if (!prop) return prop;
    if (type === "object") currentObject = prop;

    if (
      (prop.maxLength && prop.maxLength > 100) ||
      (prop.contentMediaType && prop.contentMediaType.startsWith("text/"))
    ) {
      setUiSchemaByPath(newProps.uiSchema, path, "ui:widget", "textarea");
    }

    const ui = findUiSchemaByPath(newProps.uiSchema, path);
    if (!ui) return prop;

    const mode = ui["ui:" + editMode];
    const propertyId = path.length > 0 ? path[path.length - 1] : "";
    if (mode) {
      //      console.log("customizeSchemas", path, editMode, mode);
      switch (mode) {
        case UI_HIDDEN:
          // The RJSF ui:widget=hidden only applies to basic fields, so delete
          // the property from the JSON schema to hide objects and arrays.
          prop = undefined;
          removeFromRequired(currentObject, propertyId);
          break;
        case UI_DISABLED:
          if (prop) prop.readOnly = true;
          removeFromRequired(currentObject, propertyId);
          break;
      }
    }

    return prop;
  }
}

function removeFromRequired(object: ProcessResult, propertyId: string) {
  if (!object) return;
  if (!object.required) return;
  object.required = object.required.filter((id) => id !== propertyId);
}

function findUiSchemaByPath(
  schema: UiSchema,
  path: string[]
): UiSchema | undefined {
  if (path.length === 0) return schema;
  if (!schema[path[0]]) return undefined;
  return findUiSchemaByPath(schema[path[0]], path.slice(1));
}

function setUiSchemaByPath(
  uiSchema: UiSchema,
  path: string[],
  key: string,
  value: any
): UiSchema {
  if (path.length === 0) {
    uiSchema[key] = value;
    return uiSchema;
  }

  if (!uiSchema[path[0]]) {
    uiSchema[path[0]] = {};
  }

  if (path.length === 1) {
    uiSchema[path[0]][key] = value;
    return uiSchema[path[0]];
  }

  return setUiSchemaByPath(uiSchema[path[0]], path.slice(1), key, value);
}
