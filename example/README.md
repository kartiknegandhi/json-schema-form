# Dynamic form component example application

This project contains React components which create HERE Design System compatible forms dynamically based on a user-supplied JSON Schema (draft-7) and an optional UI schema.

NOTE: The version of `@here/json-schema-form` used in this example is one version below the latest released version. To use the latest version locally, please update `@here/json-schema-form` to the latest released version.

## Components

`App.ts` is the playground app which can be used to test the forms and develop JSON schemas.
A live demo is hosted in [https://perf.ad.here.com/jarikarj/hdsform-tabbed](https://perf.ad.here.com/jarikarj/hdsform-tabbed).

## JSON Schema Form library

The main library's documentation can be found at the [root](../README.md) of the repository.

## Available Scripts

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

In the project directory, you can run:

### `npm install --legacy-peer-deps`

Runs npm install in legacy mode. Latest node versions implement strict peer dependency checks. This will most probably cause errors without the --legacy-peer-deps flag.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
