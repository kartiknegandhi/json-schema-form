# Dynamic HDS Form Component

This project contains React components which create HERE Design System compatible forms dynamically based on a user-supplied JSON Schema (draft-7) and an optional UI schema.

A live example of the json schema form is available [here](https://olp.pages.gitlab.in.here.com/project-real/json-schema-form/)

## Components

The example app is present inside the `example` directory. Refer [example's README](example/README.md) for more details.

The `HDSTabbedForm.tsx` is the main re-usable form component which supports tabs and inline layouts.
The `HDSForm.tsx` implements the basic form, one of which the HDSTabbedForm instantiates in each tab.

The form components are built using the [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form) and the [HERE Design System](https://design.pages.gitlab.in.here.com/here-design-system/portal/hds-temporary-home-page/) widgets/styles.

The `schema-customizer.ts` implements customizations built on top of common forms. It modifies the JSON schema according to the ui:schema options. It uses generic JSON schema processor implemented in `schema-utils.ts`.

The `custom-widgets.tsx` contains platform specific widgets which can be bound to the JSON schema properties using ui:schema.

The `property-utils.ts` implements Java property file reader/writer which utilizes JSON Schema to properly parse properties which contain dots.

## UI Schema

The forms support a proprietary UI schema object which supports a subset of `react-jsonschema-form` options and adds a few new ones.

The playground application supports storing and editing the UI Schema inside the JSON Schema using a prorietary top-level property called `ui:schema`. However, the form components require the UI schema as a separate input property.

For nested schema object properties, the UI schema options are stored in the same hierarchy as used in the JSON Schema properties.

The following UI schema options are supported assuming the customizer and custom-widgets are used together with HDSTabbedForm:

- `"ui:create"` : `"hidden"` or `"disabled"`
  -- the property is hidden or disabled in create mode
- `"ui:update"` : `"hidden"` or `"disabled"`
  -- the property is hidden or disabled in update mode
- `"ui:view"` : `"hidden"` or `"disabled"`
  -- the property is hidden or disabled in view mode
- `"ui:order"`: [ list-of-property-ids ]
  -- re-arranges properties on screen
- `"ui:layout"`: `"tab"`
  -- the properties of the top-level object or array are shown in a separate tab
- `"ui:layout"`: `"inline"`
  -- the properties of the object are shown in one line (wraps if wont fit)
- `"ui:placeholder"`: `"...some text..."`
  -- shown as a placeholder in the text input
- `"ui:widget"`: `"textarea"`
  -- show a multi-line textarea for a string (also implied from contentMediaType=text/\* or maxLength>100)
- `"ui:widget"`: `"hrnSelect"`
  -- useful whenever HRNs are needed. If the app provides the form with the list of HRNs in the project and their names, the widget will show a selector drop-down with those HRNs which match the pattern defined in the target JSON schema property (the demo app has a list of hard-coded HRNs of various kinds).

The [UI Schema example](https://perf.ad.here.com/jarikarj/hdsform-tabbed/?example=UI+Schema) in the playground demonstrates these options.

Additional widgets could be added, as long as they are generic platform functionality. In practice this means they must work with common agreed sub-schemas. For example, a bounding box selector would need an agreed common data schema for a bounding box.

The source code should be auto-formatted using Prettier with default settings.

## Available Scripts

This project is customized to be built with the rollup build tool.

In the project directory, you can run:

### `npm install --legacy-peer-deps`

Runs npm install in legacy mode. Latest node versions implement strict peer dependency checks. This will most probably cause errors without the --legacy-peer-deps flag.

### `npm run build`

It creates a production ready build of the base library code in the lib folder
Builds the library for production to the `lib` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and have all the resources exported in the root index.js file.
The library is ready to be deployed to the artifactory!

See the rollup API at (https://rollupjs.org/guide/en/#introduction) for more information.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

To learn React, check out the [React documentation](https://reactjs.org/).

## Prerequisites for local development

1. Nodejs v16
2. IDE of your choice

## Steps for local development

1. Make sure to have all the dependencies installed by running `npm install` in both the root as well as the example folder.
2. Build the library using the command `npm run build`
3. Change into the lib folder using `cd lib`
4. run `npm link ../example/node_modules/react --legacy-peer-deps` - This step is to remove the mismatch react versions error.
5. run `npm link`
6. switch to example folder using the command `cd ../example`
7. run `npm link @here/json-schema-form`
8. run `npm start` to test your local changes on the example.
