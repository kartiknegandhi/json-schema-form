import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App";

test("renders default App and finds two tabs", () => {
  render(<App />);
  const generalTab = screen.getByText("Demo");
  expect(generalTab).toBeInTheDocument();

  const loggingTab = screen.getByText("Logging");
  expect(loggingTab).toBeInTheDocument();
});

test("renders default App, chooses UI Schema, and finds tabs", async () => {
  render(<App example="UI Schema" />);
  const generalTab = screen.getByText("General");
  expect(generalTab).toBeInTheDocument();

  const advancedTab = screen.getByText("Advanced");
  expect(advancedTab).toBeInTheDocument();

  const loggingTab = screen.getByText("Logging");
  expect(loggingTab).toBeInTheDocument();
});
