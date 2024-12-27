import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { ConfigurationList } from "../ConfigurationList";
import { ConfigurationProvider } from "../../contexts/ConfigurationContext";
import { BrowserRouter } from "react-router-dom";

// Mock Material-UI components with proper style handling
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Box: ({ children, sx, ...props }) => (
    <div data-testid="mui-box" style={sx} {...props}>
      {children}
    </div>
  ),
  Container: ({ children, maxWidth, ...props }) => (
    <div data-testid="mui-container" {...props}>
      {children}
    </div>
  ),
  Typography: ({ children, variant, ...props }) => (
    <span data-testid="mui-typography" {...props}>
      {children}
    </span>
  ),
  Card: ({ children, ...props }) => (
    <div data-testid="mui-card" {...props}>
      {children}
    </div>
  ),
  Grid: ({ children, ...props }) => (
    <div data-testid="mui-grid" {...props}>
      {children}
    </div>
  ),
}));

// Update jest.setup.js to suppress specific warnings
const originalError = console.error;
console.error = (...args) => {
  if (
    args[0]?.includes?.("Could not parse CSS stylesheet") ||
    args[0]?.includes?.("Warning: React does not recognize the") ||
    args[0]?.includes?.("Warning: An update to ConfigurationProvider") ||
    args[0]?.detail?.type === "css parsing"
  ) {
    return;
  }
  originalError(...args);
};

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const mockConfigurations = [
  {
    id: 1,
    name: "Test Config 1",
    jsonConfig: {
      game: {
        title: "Asteroid Adventure",
        version: "1.0.0",
      },
    },
    lastModified: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Test Config 2",
    jsonConfig: {
      game: {
        title: "Space Explorer",
        version: "2.0.0",
      },
    },
    lastModified: new Date().toISOString(),
  },
];

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <ConfigurationProvider>{children}</ConfigurationProvider>
  </BrowserRouter>
);

describe("ConfigurationList", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset toast mock
    global.mockToast.success.mockReset();
    global.mockToast.error.mockReset();

    // Setup default fetch mock for configurations
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockConfigurations),
      })
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders loading state initially", async () => {
    // Mock the fetch call to delay response
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () => Promise.resolve([]),
              }),
            100
          )
        )
    );

    render(
      <BrowserRouter>
        <ConfigurationProvider>
          <ConfigurationList />
        </ConfigurationProvider>
      </BrowserRouter>
    );

    // Wait for and verify loading state
    await waitFor(
      () => {
        expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it("renders configurations after loading", async () => {
    render(
      <TestWrapper>
        <ConfigurationList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test Config 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Config 2/i)).toBeInTheDocument();
    });
  });

  it("handles search functionality", async () => {
    render(
      <TestWrapper>
        <ConfigurationList />
      </TestWrapper>
    );

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByText(/Test Config 1/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search configurations/i);
    fireEvent.change(searchInput, { target: { value: "Config 1" } });

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText(/Test Config 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/Test Config 2/i)).not.toBeInTheDocument();
    });
  });

  it("displays empty state when no configurations exist", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      })
    );

    render(
      <TestWrapper>
        <ConfigurationList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/no configurations yet/i)).toBeInTheDocument();
    });
  });
});
