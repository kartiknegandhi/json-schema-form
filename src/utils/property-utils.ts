import Properties from "@js.properties/properties";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { Indexable } from "../components/HDSTabbedForm";
import { get as JSONPointerGet } from "jsonpointer";

type SchemaProps = { [key: string]: JSONSchema7Definition };

// Parse Java Properties to an Object with the structure and types defined by the JSON Schema
export function parsePropertiesBySchema(
  javaProps: string,
  schema: JSONSchema7
): Indexable {
  return extractObjectBySchema(Properties.parse(javaProps), schema, "");
}

export function extractObjectBySchema(
  properties: Indexable,
  fullSchema: JSONSchema7,
  prefix: string = "",
  object: Indexable = {}
): Indexable {
  if (Object.keys(properties).length === 0) return {}; // NOTE: can add defaults afterwards using ajv
  extractBySchema(fullSchema, prefix, object);
  return object;

  function extractBySchema(
    schema: JSONSchema7,
    prefix: string,
    object: Indexable
  ): Indexable | undefined {
    if (schema.properties)
      extractBySchemaProps(schema.properties, prefix, object);
    if (schema.oneOf) extractBySchemaItems(schema.oneOf, prefix, object);
    if (schema.allOf) extractBySchemaItems(schema.allOf, prefix, object);
    if (schema.anyOf) extractBySchemaItems(schema.anyOf, prefix, object);
    if (schema.dependencies) {
      for (let depKey of Object.keys(schema.dependencies)) {
        const dep = schema.dependencies[depKey];
        if (typeof dep !== "boolean" && !Array.isArray(dep))
          extractBySchema(dep, prefix, object);
      }
    }
    return object && Object.keys(object).length > 0 ? object : undefined;
  }

  function extractBySchemaItems(
    items: JSONSchema7Definition[],
    prefix: string,
    object: Indexable
  ): void {
    for (let item of items)
      if (typeof item !== "boolean") {
        if (item.properties)
          extractBySchemaProps(item.properties, prefix, object);
      }
  }

  function extractBySchemaProps(
    schemaProperties: SchemaProps,
    prefix: string,
    object: Indexable
  ): Indexable | undefined {
    for (const schemaKey of Object.keys(schemaProperties)) {
      const schemaProp = schemaProperties[schemaKey] as JSONSchema7;
      const o = extractBySchemaProp(schemaKey, schemaProp, prefix);
      if (o !== undefined) object[schemaKey] = o;
    }
    return object && Object.keys(object).length > 0 ? object : undefined;
  }

  function extractBySchemaProp(
    schemaKey: string,
    schemaProp: JSONSchema7,
    prefix: string
  ): any {
    const propKey = prefix + schemaKey;
    let object = undefined;
    switch (schemaProp.type) {
      case "number":
      case "integer":
        if (properties[propKey]) object = +properties[propKey];
        break;
      case "string":
        if (properties[propKey]) object = properties[propKey];
        break;
      case "boolean":
        if (properties[propKey]) object = properties[propKey] === "true";
        break;
      case "object":
        object = extractBySchema(schemaProp, propKey + ".", {});
        break;
      case "array":
        if (schemaProp.items && schemaProp.items !== true)
          if (schemaProp.items instanceof Array)
            console.error("Unsupported array with multiple types");
          else {
            object = [];
            let index = 0; // XXX assumes zero-based indexing in Java properties
            while (true) {
              const o = extractBySchemaProp(
                "",
                schemaProp.items,
                propKey + "." + index
              );
              if (o === undefined) break;
              object.push(o);
              index++;
            }
            if (object.length === 0) object = undefined;
          }
        break;
      default:
        if (schemaProp.$ref) {
          const parts = schemaProp.$ref.split("#");
          if (parts.length > 1 && parts[0] === "") {
            let refSchema = JSONPointerGet(fullSchema, parts[1]) as JSONSchema7;
            if (refSchema)
              object = extractBySchema(refSchema, propKey + ".", {});
            else console.error("Cannot resolve $ref", schemaProp.$ref);
          } else console.error("Unsupported $ref", schemaProp.$ref);
        } else if (schemaProp.enum) {
          // Plain enum without type may be used in dependencies, nothing to do here
        } else
          console.error(
            "Unsupported schema property type",
            schemaKey,
            schemaProp
          );
    }
    return object;
  }
}

// Serialize Object to Java Properties
export function objectToProperties(
  properties: Indexable,
  namespace: string | undefined = undefined
): string {
  let output = "";
  for (const key in properties) {
    const element = properties[key];
    if (typeof element === "object") {
      const ns = namespace ? namespace + "." + key : key;
      output += objectToProperties(element, ns);
    } else if (element !== undefined) {
      if (namespace) {
        output += escapeKey(namespace);
        if (key) {
          output += ".";
        }
      }
      output += escapeKey(key) + "=";
      if (typeof element === "string") {
        output += escapeValue(element);
      } else {
        output += "" + element;
      }
      output += "\n";
    }
  }
  return output;
}

function escapeKey(key: string): string {
  return key.replace(/[\s\S]/g, (match) => {
    switch (match) {
      case "=":
        return "\\=";
      case ":":
        return "\\:";
      case " ":
        return "\\ ";
      default:
        return escapeValue(match);
    }
  });
}

function escapeValue(value: string): string {
  return value.replace(/[\s\S]/g, (match) => {
    switch (match) {
      case "\\":
        return "\\\\";
      case "\f":
        return "\\f";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\t":
        return "\\t";
      default:
        return match;
    }
  });
}
