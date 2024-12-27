import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfigurationEdit } from "../ConfigurationEdit";
import { useConfiguration } from "../../contexts/ConfigurationContext";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { act } from "react-dom/test-utils";

// Mock the useConfiguration hook
jest.mock("../../contexts/ConfigurationContext", () => ({
  useConfiguration: jest.fn(),
}));

// Mock the useParams hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()),
}));

// Mock the anime import
jest.mock("animejs", () => {
  const animeMock = jest.fn(() => ({
    finished: Promise.resolve(),
  }));

  animeMock.timeline = jest.fn(() => ({
    add: jest.fn().mockReturnThis(),
    play: jest.fn().mockReturnThis(),
    finished: Promise.resolve(),
  }));

  animeMock.random = jest.fn((min, max) => min);
  animeMock.stagger = jest.fn(() => 0);

  return {
    __esModule: true,
    default: animeMock,
  };
});

// Mock SettingsStyleEditor component
jest.mock("../SettingsStyleEditor", () => ({
  SettingsStyleEditor: jest.fn(({ config, onSave }) => (
    <div data-testid="settings-editor">
      <div data-testid="config-name">{config?.name}</div>
      <div data-testid="config-description">{config?.description}</div>
      <button onClick={onSave} data-testid="save-button">
        Save Changes
      </button>
    </div>
  )),
}));

// Test wrapper component that provides router context
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <Routes>
      <Route path="*" element={children} />
    </Routes>
  </BrowserRouter>
);

describe("ConfigurationEdit", () => {
  const mockConfiguration = {
    id: 1,
    name: "Test Config",
    description: "Test Description",
    value: { key: "value" },
  };

  const mockSetConfigurations = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    useConfiguration.mockImplementation(() => ({
      configurations: [mockConfiguration],
      setConfigurations: mockSetConfigurations,
      refreshConfigurations: jest.fn(),
    }));

    useParams.mockImplementation(() => ({ id: "1" }));
    require("react-router-dom").useNavigate.mockImplementation(
      () => mockNavigate
    );

    // Mock fetch for configuration data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockConfiguration),
      })
    );
  });

  it("renders configuration details", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ConfigurationEdit />
        </TestWrapper>
      );
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("config-name")).toHaveTextContent("Test Config");
    expect(screen.getByTestId("config-description")).toHaveTextContent(
      "Test Description"
    );
  });

  it("handles save action", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ConfigurationEdit />
        </TestWrapper>
      );
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const saveButton = screen.getByTestId("save-button");
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/configuration/1`,
        expect.any(Object)
      );
    });
  });

  it("handles navigation back", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ConfigurationEdit />
        </TestWrapper>
      );
    });

    // Wait for loading state to finish
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    const backButton = screen.getByRole("button", {
      name: /back to configurations/i,
    });

    await act(async () => {
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalled();
  });
});
