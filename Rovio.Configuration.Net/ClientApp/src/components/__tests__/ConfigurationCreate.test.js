import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfigurationCreate } from "../ConfigurationCreate";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { act } from "react-dom/test-utils";
import toast from "react-hot-toast";

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  Toaster: () => null,
}));

// Mock anime.js
jest.mock("animejs", () => {
  const animeMock = jest.fn(() => ({
    finished: Promise.resolve(),
  }));

  // Add stagger function to the mock
  animeMock.stagger = jest.fn((value) => value);

  // Add timeline function to the mock
  animeMock.timeline = jest.fn(() => ({
    add: jest.fn().mockReturnThis(),
    play: jest.fn().mockReturnThis(),
    finished: Promise.resolve(),
  }));

  // Add other required anime.js functions
  animeMock.random = jest.fn((min, max) => min);

  return animeMock;
});

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <Routes>
      <Route path="*" element={children} />
    </Routes>
  </BrowserRouter>
);

describe("ConfigurationCreate", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    require("react-router-dom").useNavigate.mockImplementation(
      () => mockNavigate
    );
  });

  it("renders the create configuration form", async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <ConfigurationCreate />
        </TestWrapper>
      );
      // Wait for animations to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(screen.getByLabelText(/configuration name/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create configuration/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    // Use findByDisplayValue with the correct default title
    const titleInput = await screen.findByDisplayValue("Asteroid Adventure");
    expect(titleInput).toBeInTheDocument();
  });

  it("handles form submission successfully", async () => {
    // Setup fetch mock for this test
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1 }),
      })
    );

    render(
      <TestWrapper>
        <ConfigurationCreate />
      </TestWrapper>
    );

    // Fill in the configuration name
    const nameInput = screen.getByLabelText(/configuration name/i);
    fireEvent.change(nameInput, { target: { value: "Test Config" } });

    // Find and update a text input with correct default value
    const titleInput = screen.getByDisplayValue("Asteroid Adventure");
    fireEvent.change(titleInput, { target: { value: "Updated Game" } });

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /create configuration/i,
    });

    await act(async () => {
      fireEvent.click(submitButton);
      // Wait for all promises to resolve
      await Promise.resolve();
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Verify the API call
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/configuration",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.stringContaining("Updated Game"),
      })
    );

    // Verify success notifications and navigation
    expect(toast.success).toHaveBeenCalledWith(
      "Configuration created successfully!"
    );
    expect(mockNavigate).toHaveBeenCalledWith("/configurations");
  });

  it("handles form submission errors", async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("Test error message"))
    );

    render(
      <TestWrapper>
        <ConfigurationCreate />
      </TestWrapper>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Configuration Name/i), {
      target: { value: "Test Config" },
    });

    // Submit the form
    const submitButton = screen.getByRole("button", {
      name: /create configuration/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Unable to connect to the server")
      ).toBeInTheDocument();
    });
  });

  it("handles navigation on cancel", async () => {
    render(
      <TestWrapper>
        <ConfigurationCreate />
      </TestWrapper>
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith("/configurations");
  });
});
