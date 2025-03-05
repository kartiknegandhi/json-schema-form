import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { get as JSONPointerGet } from "jsonpointer";

export type SchemaProps = { [key: string]: JSONSchema7Definition };
export type SchemaProcessor = (
  path: string[],
  prop: JSONSchema7,
  type: string
) => ProcessResult;
export type ProcessResult = JSONSchema7 | undefined;

// Process all local schema properties recursively using given processor function.
// The processor may return the prop as is, modified, or undefined to delete the prop.
// Currently the schema is modified in place, user must deep clone it if original is needed.
// The processor may get called more than once for a property in "definitions" (once for each $ref).
export function processSchema(
  schema: JSONSchema7,
  processor: SchemaProcessor
): ProcessResult {
  return processSchemaProp([], schema, processor);

  function processSchemaProp(
    path: string[],
    schemaProp: ProcessResult,
    processor: SchemaProcessor
  ): ProcessResult {
    function processItems(items: JSONSchema7Definition[]) {
      for (let key in Object.keys(items)) {
        const item = items[key];
        if (typeof item !== "boolean") {
          const result = processSchemaProp([...path, key], item, processor);
          if (result) items[key] = result;
          else delete items[key];
        }
      }
    }

    if (!schemaProp) return undefined;

    if (schemaProp.$ref) {
      schemaProp = processor(path, schemaProp, "$ref");
      if (schemaProp) {
        if (schemaProp.$ref) {
          // processor could have removed the $ref
          const parts = schemaProp.$ref.split("#");
          if (parts.length !== 2 || parts[0] !== "")
            throw Error("Unsupported $ref in " + schemaProp);
          const prop = JSONPointerGet(schema, parts[1]);
          processSchemaProp(path, prop, processor);
        }
      } else return undefined; // processor removed the whole prop!
    }
    if (schemaProp.allOf) processItems(schemaProp.allOf);
    if (schemaProp.anyOf) processItems(schemaProp.anyOf);
    if (schemaProp.oneOf) processItems(schemaProp.oneOf);

    if (schemaProp.properties) {
      schemaProp = processor(path, schemaProp, "object");
      if (schemaProp && schemaProp.properties) {
        for (const propKey of Object.keys(schemaProp.properties)) {
          const prop = schemaProp.properties[propKey] as JSONSchema7;

          const result = processSchemaProp([...path, propKey], prop, processor);
          if (result) schemaProp.properties[propKey] = result;
          else delete schemaProp.properties[propKey];
        }
        if (schemaProp.dependencies) {
          for (const propKey of Object.keys(schemaProp.dependencies)) {
            const prop = schemaProp.dependencies[propKey] as JSONSchema7;
            if (typeof prop === "object") {
              // process only schema depedencies
              const result = processSchemaProp(
                [...path, propKey],
                prop,
                processor
              );
              if (result) schemaProp.dependencies[propKey] = result;
              else delete schemaProp.dependencies[propKey];
            }
          }
        }
      }
    } else if (schemaProp.type) {
      if (schemaProp.type === "array") {
        schemaProp = processor(path, schemaProp, "array");
        if (schemaProp) {
          if (schemaProp.items && schemaProp.items !== true) {
            if (schemaProp.items instanceof Array)
              processItems(schemaProp.items);
            else
              processSchemaProp(
                [...path, "items"],
                schemaProp.items,
                processor
              );
          }
        }
      } else if (schemaProp.type && !Array.isArray(schemaProp.type)) {
        schemaProp = processor(path, schemaProp, schemaProp.type);
      } else throw Error("Unsupported type in " + schemaProp);
    }
    return schemaProp;
  }
}

// Read remote schema and inline all $refs, if there is a anchor, make that root schema
export async function readRemoteSchema(ref: string): Promise<JSONSchema7> {
  const parts = ref.split("#");
  const rootSchema = await fetchSchema(parts[0]);
  const inlinedSchema = await inlineAllRefs(rootSchema);
  console.log("Inlined full schema", inlinedSchema);

  if (parts.length > 1 && parts[0]) {
    const anchor = parts[1].trim();
    if (anchor) {
      let anchorSchema = JSONPointerGet(inlinedSchema, anchor);
      if (!anchorSchema)
        throw new Error(`Could not find ${anchor} in ${parts[0]}`);

      // All definitions are now on top-level, must drop from this level to prevent loops
      const { definitions, ...anchorCopy } = anchorSchema;
      console.log("Anchored schema without definitions", anchorCopy);
      if (inlinedSchema.definitions)
        anchorCopy.definitions = inlinedSchema.definitions;
      return anchorCopy;
    } else return inlinedSchema;
  } else if (inlinedSchema && inlinedSchema.properties) return inlinedSchema;
  else
    throw new Error(
      "Schema URL must have an anchor when no properties in top-level schema!"
    );
}

// Recursively fetch all external $refs in the source schema and add them to the definitions of this schema.
export async function inlineAllRefs(
  sourceSchema: JSONSchema7
): Promise<JSONSchema7> {
  let newDefs = {};

  if (sourceSchema.definitions) {
    newDefs = { ...sourceSchema.definitions };
    newDefs = await inlineRefs(sourceSchema.definitions, newDefs, "");
  }
  if (sourceSchema.properties) {
    newDefs = await inlineRefs(sourceSchema.properties, newDefs, "");
  }
  sourceSchema.definitions = newDefs;
  return sourceSchema;
}

async function inlineRefs(
  properties: SchemaProps,
  targetDefs: SchemaProps,
  defScope: string
): Promise<SchemaProps> {
  for (const propKey of Object.keys(properties)) {
    const schemaProp = properties[propKey] as JSONSchema7;
    targetDefs = await inlineSchemaProp(schemaProp, targetDefs, defScope);
  }
  return targetDefs;
}

async function inlineSchemaProp(
  schemaProp: JSONSchema7,
  targetDefs: SchemaProps,
  defScope: string
): Promise<SchemaProps> {
  async function inlineItems(items: JSONSchema7Definition[]) {
    for (let item of items)
      if (typeof item !== "boolean") {
        targetDefs = await inlineSchemaProp(item, targetDefs, defScope);
      }
    return targetDefs;
  }

  if (schemaProp.type) {
    if (schemaProp.type === "object" && schemaProp.properties)
      targetDefs = await inlineRefs(
        schemaProp.properties,
        targetDefs,
        defScope
      );
    else if (
      schemaProp.type === "array" &&
      schemaProp.items &&
      schemaProp.items !== true
    ) {
      if (schemaProp.items instanceof Array)
        targetDefs = await inlineItems(schemaProp.items);
      else
        targetDefs = await inlineSchemaProp(
          schemaProp.items,
          targetDefs,
          defScope
        );
    }
  }
  if (schemaProp.allOf) targetDefs = await inlineItems(schemaProp.allOf);
  if (schemaProp.anyOf) targetDefs = await inlineItems(schemaProp.anyOf);
  if (schemaProp.oneOf) targetDefs = await inlineItems(schemaProp.oneOf);

  if (schemaProp.$ref) {
    const parts = schemaProp.$ref.split("#");
    if (parts.length > 1 && parts[0].startsWith("http")) {
      // It is a remote schema, fetch and cache it
      const url = parts[0];
      const defName = defNameForRefHost(url);
      if (!targetDefs[defName]) {
        console.log("Fetching and inlining schema defs", defName, defScope);
        const schema = await fetchSchema(url);
        targetDefs[defName] = schema; // must save schema now to break infinite loops when inlining
        if (schema && schema.definitions) {
          // Inline and patch the schema definitions recursively!
          targetDefs = await inlineRefs(
            schema.definitions,
            targetDefs,
            defName
          );
          if (schema.properties)
            targetDefs = await inlineRefs(
              schema.properties,
              targetDefs,
              defName
            );
        }
      }
      // patch the $ref to point to the local def
      schemaProp.$ref = definitionForRefParts(defName, parts[1]);
      //           console.log("Patched remote ref", schemaProp.$ref);
    } else if (parts.length > 1 && defScope) {
      // Even local refs in Inlined schema must be prefixed with scope
      schemaProp.$ref = "#/definitions/" + defScope + parts[1];
    }
  }
  return targetDefs;
}

async function fetchSchema(url: string): Promise<JSONSchema7> {
  // HACK to read schemas from local folder
  const hacked = url.replace(
    /https?:\/\/locationobjects\.schemas\.here\.com\/*[0-9.]*/,
    process.env.PUBLIC_URL + "/mom/2.51.1/"
  );
  console.log("Fetching from local URL", hacked);
  const response = await window.fetch(hacked);
  const data = await response.json();
  if (response.ok) {
    if (data && data.$schema === "https://json-schema.org/draft-07/schema#")
      data.$schema = "http://json-schema.org/draft-07/schema#"; // HACK to fix broken MOM schema ID!
    return data;
  } else {
    console.error("Fetch failed", response, data);
    return Promise.reject(
      new Error(`failed to fetch ${url} from ${hacked}: ${response.status}`)
    );
  }
}

function defNameForRefHost(refHost: string) {
  return refHost.replace(/[^a-zA-Z0-9_]+/g, "_");
}
function definitionForRefParts(host: string, anchor: string) {
  if (!anchor.startsWith("/")) anchor = "/" + anchor;
  return "#/definitions/" + defNameForRefHost(host) + anchor;
}
