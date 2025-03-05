import React from "react";
import { JSONSchema7 } from "json-schema";
import { fireEvent, queryByAttribute, render } from "@testing-library/react";
import HDSTabbedForm from "./../components/HDSTabbedForm";
import schema from "./tabbedForm.json";

const testSchema: JSONSchema7 = schema as JSONSchema7;
const getById = queryByAttribute.bind(null, "id");

test("renders default HDSTabbedForm", () => {
  const onChangeMock = jest.fn();
  const dom = render(
    <HDSTabbedForm
      formData={{
        "tiler.size": 4194304,
        "tiler.statistics": true,
        "tiler.single": "Beta",
        "tiler.multi": ["Group BX"],
      }}
      formErrors={{
        _root_: [
          {
            name: "required",
            property: "['tiler.outPrefix']",
            message: "is a required property",
            params: {
              missingProperty: "tiler.outPrefix",
            },
            stack: "['tiler.outPrefix'] is a required property",
            schemaPath: "#/required",
          },
        ],
      }}
      onChange={onChangeMock}
      schema={testSchema}
    />
  );
  expect(onChangeMock).toBeCalledTimes(1);
  expect(onChangeMock).toHaveBeenCalledWith({
    data: {
      "tiler.multi": ["Group BX"],
      "tiler.single": "Beta",
      "tiler.size": 4194304,
      "tiler.statistics": true,
    },
    errors: {
      _root_: [
        {
          name: "required",
          property: "['tiler.outPrefix']",
          message: "is a required property",
          params: {
            missingProperty: "tiler.outPrefix",
          },
          stack: "['tiler.outPrefix'] is a required property",
          schemaPath: "#/required",
        },
      ],
    },
  });
});

test("should be able to update field in HDSTabbedForm", () => {
  const onChangeMock = jest.fn();
  const dom = render(
    <HDSTabbedForm
      formData={{
        "tiler.size": 4194304,
        "tiler.statistics": true,
        "tiler.single": "Beta",
        "tiler.multi": ["Group BX"],
      }}
      formErrors={{
        _root_: [
          {
            name: "required",
            property: "['tiler.outPrefix']",
            message: "is a required property",
            params: {
              missingProperty: "tiler.outPrefix",
            },
            stack: "['tiler.outPrefix'] is a required property",
            schemaPath: "#/required",
          },
        ],
      }}
      onChange={onChangeMock}
      schema={testSchema}
    />
  );

  const outPrefixInput = getById(dom.container, "_root__tiler.outPrefix");
  expect(outPrefixInput).toBeInTheDocument();
  if (outPrefixInput) {
    fireEvent.change(outPrefixInput, { target: { value: "outputLayer" } });
    expect((outPrefixInput as HTMLInputElement).value).toBe("outputLayer");
  }
  expect(onChangeMock).toBeCalledTimes(1);
});
