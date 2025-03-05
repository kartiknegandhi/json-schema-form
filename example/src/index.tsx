import React from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const exampleParam = new URLSearchParams(window.location.search).get("example");
const example = exampleParam ? exampleParam : undefined;

ReactDOM.render(
  <React.StrictMode>
    <div id="root">
      <div data-theme="hds-web-product-light-theme">
        <App example={example} />
      </div>
    </div>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
