import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import {
  ConfigurationProvider,
  useConfiguration,
} from "../ConfigurationContext";

// Test component that uses the context
const TestComponent = () => {
  const { configurations, loading, refreshConfigurations } = useConfiguration();
  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="config-count">{configurations.length}</div>
      <button onClick={refreshConfigurations}>Refresh</button>
    </div>
  );
};

describe("ConfigurationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides initial context values", () => {
    const { getByTestId } = render(
      <ConfigurationProvider>
        <TestComponent />
      </ConfigurationProvider>
    );

    expect(getByTestId("loading")).toHaveTextContent("false");
    expect(getByTestId("config-count")).toHaveTextContent("0");
  });

  it("updates configurations after successful fetch", async () => {
    const mockData = [{ id: 1 }];

    // Setup fetch mock
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData),
        status: 200,
      })
    );

    const { getByTestId, getByRole } = render(
      <ConfigurationProvider>
        <TestComponent />
      </ConfigurationProvider>
    );

    // First verify initial state
    expect(getByTestId("config-count")).toHaveTextContent("0");

    // Trigger the fetch
    await act(async () => {
      getByRole("button").click();
    });

    // Wait for and verify final state
    await waitFor(
      () => {
        expect(getByTestId("config-count")).toHaveTextContent("1");
      },
      { timeout: 1000 }
    );

    // Verify fetch was called with correct URL and headers
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/configuration",
      expect.objectContaining({
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
    );
  });
});
