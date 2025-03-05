import { JSONSchema7 } from "json-schema";
import { processSchema, ProcessResult } from "./../utils";
import { Indexable } from "../components/HDSTabbedForm";

import schema from "./sample-schema-test.json";

const indexableSchema = schema as Indexable;
const testSchema: JSONSchema7 = schema as JSONSchema7;
const testSchemaPrefix = testSchema.definitions?.Prefix as JSONSchema7;
const uiSchema = indexableSchema["ui:schema"];

it("processSchema simple schema", () => {
  const result = processSchema(testSchemaPrefix, (path: any, prop: any, type: any) => {
    if (type === "object") return prop;
    if (path.indexOf("id") >= 0) return prop;
    return undefined; // This will drop the "hrn" property
  });
  expect(result).toBeTruthy;
  expect(result?.properties).toBeTruthy;
  expect(result?.properties?.["id"]).toStrictEqual({
    type: "string",
    title: "Resource ID",
  });
  expect(result?.properties?.["hrn"]).toBeFalsy;
});

it("processSchema patch complex schema", () => {
  const result = processSchema(testSchema, (path: any, prop: any, type: any) => {
    if (path.indexOf("id") >= 0) {
      // This is in #/definitions/Prefix to be found via tiler.embed/p6/items/$ref
      prop.title = "patched title";
      return prop;
    }
    return prop;
  });

  expect(result).toBeTruthy;
  expect(result?.definitions).toBeTruthy;
  const prefix = result?.definitions?.["Prefix"] as JSONSchema7;
  expect(prefix.properties?.["id"]).toStrictEqual({
    type: "string",
    title: "patched title",
  });
});
