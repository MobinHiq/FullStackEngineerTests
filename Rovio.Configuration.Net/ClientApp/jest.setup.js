// Mock CSS modules
module.exports = {
  __esModule: true,
  default: {},
};

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress CSS parsing errors
const originalError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.("Could not parse CSS stylesheet")) return;
  if (args[0]?.detail?.type === "css parsing") return;
  originalError(...args);
};

// Increase timeout for async operations
jest.setTimeout(10000);

// Create mock toast functions
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
};

// Export mockToast for use in tests
global.mockToast = mockToast;

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: mockToast,
  toast: mockToast,
}));

// Mock anime.js with all required methods
const timeline = {
  add: jest.fn().mockReturnThis(),
  play: jest.fn(),
};

// Export timeline for use in tests
global.mockTimeline = timeline;

global.anime = {
  timeline: jest.fn().mockReturnValue(timeline),
  stagger: jest.fn((value) => value),
  random: jest.fn((min, max) => min),
};

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Mock fetch with proper API responses
global.fetch = jest.fn((url) => {
  if (url === "/api/configuration") {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
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
        ]),
    });
  }

  return Promise.resolve({
    ok: false,
    status: 404,
    json: () => Promise.resolve({ error: "Not found" }),
  });
});

// Mock default game settings
global.DEFAULT_GAME_SETTINGS = {
  game: {
    title: "Asteroid Adventure",
    version: "1.0.0",
  },
};

// Mock Material-UI theme provider
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  ThemeProvider: ({ children }) => children,
  CssBaseline: () => null,
}));

// Suppress React Router warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === "string" &&
    (args[0].includes("React Router") ||
      args[0].includes("Invalid prop `component` supplied to `Route`"))
  ) {
    return;
  }
  originalWarn(...args);
};
