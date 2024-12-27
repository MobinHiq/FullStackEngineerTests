import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ConfigurationProvider } from "./contexts/ConfigurationContext";

// Mock all required components
jest.mock("./components/Dashboard", () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard">Dashboard</div>,
}));

jest.mock("./components/ConfigurationList", () => ({
  ConfigurationList: () => <div>Configuration List</div>,
}));

jest.mock("./components/ConfigurationCreate", () => ({
  ConfigurationCreate: () => <div>Create Configuration</div>,
}));

jest.mock("./components/ConfigurationEdit", () => ({
  ConfigurationEdit: () => <div>Edit Configuration</div>,
}));

// Mock Material-UI theme provider
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  ThemeProvider: ({ children }) => children,
  CssBaseline: () => null,
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  Toaster: () => null,
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ConfigurationProvider>{children}</ConfigurationProvider>
  </BrowserRouter>
);

describe("App Component", () => {
  test("renders app", async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Look for Dashboard since it's the default route
    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
  });
});
