import React, { useCallback, useEffect, useState } from "react";

import "./App.scss";

import { JSONSchema7 } from "json-schema";

import { HDSTabbedFormResult, Indexable } from "@here/json-schema-form";
import { EditMode } from "@here/json-schema-form";

import { UiSchema } from "@rjsf/core";

import schema from "./sample-schema.json";
import schemaSelect from "./sample-schema-select.json";
import schemaObjects from "./sample-schema-objects.json";
import schemaUiSchema from "./sample-schema-uischema.json";
import schemaCond from "./sample-schema-cond.json";
import schemaPlaces from "./sample-schema-places.json";
import inValidSchemaSample from "./sample-wfe-invalid-amzn.json";
import jsonSchemaArraySunil from "./jsonSchemaArraySunil.json";
import inValidFormDataSample from "./sample-wfe-invalid-amzn-formData.json";
import { v4 as uuidv4 } from "uuid";
import {
  HDSTabbedForm,
  objectToProperties,
  parsePropertiesBySchema,
} from "@here/json-schema-form";
import { customizeSchemas } from "@here/json-schema-form";
import { createCustomWidgets } from "@here/json-schema-form";

const ExampleSchemas = [
  { name: " ", schema: {} },
  { name: "Basic demo", schema: schema }, // Note: App.test.txt requires that this name is not "Demo"
  { name: "Selects", schema: schemaSelect },
  { name: "Objects & Arrays", schema: schemaObjects },
  { name: "Conditional", schema: schemaCond },
  { name: "UI Schema", schema: schemaUiSchema },
  { name: "Places customization", schema: schemaPlaces },
  { name: "Invalid schema", schema: inValidSchemaSample },
  { name: "Array", schema: jsonSchemaArraySunil },
];

function jsonToText(schema: Object): string {
  return JSON.stringify(schema, undefined, 2);
}

const ExampleSelector: React.FC<{
  onChange: (exampleText: string) => void;
}> = (props) => {
  const [selected, setSelected] = useState<number>(8);

  const handleChange = (evt: any) => {
    setSelected(evt.target.value);
    const schemaText = jsonToText(ExampleSchemas[+evt.target.value].schema);
    props.onChange(schemaText);
  };

  return (
    <div>
      <label>Load example: </label>
      <select value={selected} onChange={handleChange}>
        {ExampleSchemas.map((item, i) => (
          <option key={i} value={i}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
};

const TextEditor: React.FC<{
  text: string;
  onChange: (text: string) => void;
}> = (props) => {
  const _onAreaChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange(ev.target.value);
  };

  return <textarea rows={30} onChange={_onAreaChange} value={props.text} />;
};

const ModeSelect: React.FC<{
  mode: EditMode;
  onChange: (mode: EditMode) => void;
}> = (props) => {
  function onChangeValue(event: React.ChangeEvent<HTMLInputElement>) {
    props.onChange(event.target.value as EditMode);
  }

  function getInput(label: string, value: EditMode) {
    return (
      <span>
        <input
          type="radio"
          value={value}
          name="mode"
          defaultChecked={value === props.mode}
        ></input>
        {label}
      </span>
    );
  }
  return (
    <div onChange={onChangeValue} className="ModeSelect">
      Form edit mode:
      {getInput("Create", EditMode.Create)}
      {getInput("Update", EditMode.Update)}
      {getInput("View", EditMode.View)}
    </div>
  );
};

const App: React.FC<{
  example?: String;
}> = (props) => {
  const EmptyResult = {
    data: {},
    errors: {},
  };
  const [key, setKey] = useState<string>("key");
  const [editMode, setEditMode] = useState<EditMode>(EditMode.Create);

  let exampleName = props.example ? props.example : ExampleSchemas[1].name;
  const item = ExampleSchemas.find((item) => item.name === exampleName);
  const [schemaText, setSchemaText] = useState<string>(
    item ? jsonToText(item.schema) : "{}"
  );
  const [schema, setSchema] = useState<JSONSchema7>(item ? item.schema : {});
  const [schemaError, setSchemaError] = useState<string>("");
  const [formResult, setFormResult] =
    useState<HDSTabbedFormResult>(EmptyResult);

  const onDataChange = (result: HDSTabbedFormResult) => {
    // console.log("onDataChange: ", result);
    setFormResult(result);
  };

  const onModeChange = (mode: EditMode) => {
    resetSchema(schema);
    setEditMode(mode);
  };

  const onExampleChange = (schemaText: string) => {
    onSchemaTextChange(schemaText);
  };

  const onSchemaTextChange = (text: string) => {
    try {
      setSchemaText(text);
      const parsed = JSON.parse(text);
      setFormResult(EmptyResult);
      resetSchema(parsed);
    } catch (e) {
      const msg = (e as Error).message;
      setSchemaError(msg);
    }
  };

  // Re-using the forms across different schemas messes up the validation.
  // Generating a unique key forces re-create of the forms when schema changes.
  const resetSchema = useCallback((schema: JSONSchema7) => {
    setKey(uuidv4().slice(0, 8));
    setSchema(schema);
    setSchemaError("");
  }, []);

  // NOTE: only a few UI schema options are currently supported with the HDS widgets:
  //   ui:order, ui:placeholder, ui:layout, ui:options.rows
  const indexableSchema = schema as Indexable;
  const uiSchema = indexableSchema["ui:schema"]
    ? (indexableSchema["ui:schema"] as UiSchema)
    : {};
  // console.log("ui:schema", uiSchema);

  const { schema: finalSchema, uiSchema: finalUiSchema } = customizeSchemas({
    schema: schema,
    uiSchema: uiSchema,
    editMode: editMode,
  });

  // In reality these should be read from platform APIs
  const sampleProjectHrns = [
    { hrn: "hrn:here:data::olp-here:rib-2", label: "HERE Map Content" },
    { hrn: "hrn:here:pipeline::olp-here:geojson", label: "Test Pipeline" },
    { hrn: "hrn:here:schema::olp-here:sdii-v3", label: "SDII Schema" },
    { hrn: "hrn:here:data::olp-here:geojson", label: "GeoJSON Samples" },
  ];
  const customWidgets = createCustomWidgets({ hrnList: sampleProjectHrns });

  const toShow =
    Object.keys(formResult.errors).length > 0
      ? formResult.errors
      : formResult.data;
  const javaProps = objectToProperties(formResult.data);
  console.log("JSF:formResult", { formResult, inValidFormDataSample });

  return (
    <div className="App">
      <div className="Editor">
        <button
          onClick={() => {
            setFormResult(inValidFormDataSample);
          }}
        >
          Load form data
        </button>
        <ModeSelect mode={editMode} onChange={onModeChange} />
        <div className="ExampleSelect">
          <ExampleSelector onChange={onExampleChange}></ExampleSelector>
        </div>
        Schema editor:
        <span className="EditorError"> {schemaError} </span>
        <TextEditor text={schemaText} onChange={onSchemaTextChange} />
        <div className="Data">
          {toShow === formResult.data ? (
            "Data as JSON object: "
          ) : (
            <span className="EditorError">Form validation errors:</span>
          )}
          <textarea
            rows={16}
            value={jsonToText(toShow)}
            onChange={(event) => {
              setFormResult({
                data: JSON.parse(event.target.value),
                errors: [],
              });
              resetSchema(schema);
            }}
          />
        </div>
        <div className="Properties">
          Data as Java properties:
          <textarea rows={16} value={javaProps} readOnly />
        </div>
        <div className="Properties">
          Java properties back to JSON:
          <textarea
            rows={16}
            value={jsonToText(parsePropertiesBySchema(javaProps, schema))}
            readOnly
          />
        </div>
      </div>
      <div className="Form">
        <HDSTabbedForm
          key={key}
          schema={finalSchema}
          formData={formResult.data}
          formErrors={formResult.errors}
          onChange={onDataChange}
          uiSchema={finalUiSchema}
          customWidgets={customWidgets}
          extraTabLabels={["Logging"]}
          extraTabPanels={[
            <div key="logging" className="Logging">
              <p>Logging configuration to be added here</p>
            </div>,
          ]}
        />
      </div>
    </div>
  );
};

export default App;
