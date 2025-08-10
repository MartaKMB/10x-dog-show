import { vi, beforeAll, afterAll } from "vitest";

// Sprawdź czy jesteśmy w środowisku testowym
const isTestEnvironment = process.env.NODE_ENV === "test" || process.env.VITEST;

// Jeśli nie jesteśmy w środowisku testowym, nie ładuj mocków
if (!isTestEnvironment) {
  // eslint-disable-next-line no-console
  console.log("Skipping test setup - not in test environment");
  // W środowisku deweloperskim nie ładuj mocków
} else {
  // Tylko w środowisku testowym ładuj mocki

  // Wykrywanie środowiska testowego
  const isNodeEnvironment = typeof window === "undefined";
  const isJsdomEnvironment = !isNodeEnvironment;

  // Import jest-dom tylko dla środowiska jsdom
  if (isJsdomEnvironment) {
    // @ts-expect-error - Dynamic import w warunkowym bloku może powodować błędy TypeScript
    import("@testing-library/jest-dom");
  }

  // Mock dla fetch - podstawowy mock dla obu środowisk
  global.fetch = vi.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(""),
      headers: new Map(),
      statusText: "OK",
    } as unknown as Response),
  );

  // Mock dla console.error aby nie zaśmiecać output testów
  const originalError = console.error;
  beforeAll(() => {
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Warning: ReactDOM.render is no longer supported")
      ) {
        return;
      }
      originalError.call(console, ...args);
    };
  });

  afterAll(() => {
    console.error = originalError;
  });

  // Mocki specyficzne dla środowiska jsdom (React komponenty)
  if (isJsdomEnvironment) {
    // Mock dla window.matchMedia
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock dla ResizeObserver
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock dla IntersectionObserver
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));

    // Mock dla window.location
    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost:3000",
        origin: "http://localhost:3000",
        pathname: "/",
        search: "",
        hash: "",
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
      },
      writable: true,
    });

    // Mock dla window.history
    Object.defineProperty(window, "history", {
      value: {
        pushState: vi.fn(),
        replaceState: vi.fn(),
        go: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
      },
      writable: true,
    });

    // Mock dla window.scrollTo
    window.scrollTo = vi.fn();

    // Mock dla window.alert
    window.alert = vi.fn();

    // Mock dla window.confirm
    window.confirm = vi.fn();

    // Mock dla window.prompt
    window.prompt = vi.fn();

    // Mock dla localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    // Mock dla sessionStorage
    const sessionStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "sessionStorage", {
      value: sessionStorageMock,
    });

    // Mock dla URL.createObjectURL
    URL.createObjectURL = vi.fn(() => "mocked-url");

    // Mock dla URL.revokeObjectURL
    URL.revokeObjectURL = vi.fn();

    // Mock dla navigator.clipboard - usunięty, bo @testing-library/user-event ma własny

    // Mock dla navigator.geolocation
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
      writable: true,
    });

    // Mock dla navigator.mediaDevices
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: vi.fn(),
        enumerateDevices: vi.fn(),
      },
      writable: true,
    });

    // Mock dla window.requestAnimationFrame
    window.requestAnimationFrame = vi.fn((callback) => {
      setTimeout(callback, 0);
      return 1;
    });

    // Mock dla window.cancelAnimationFrame
    window.cancelAnimationFrame = vi.fn();

    // Mock dla window.requestIdleCallback
    window.requestIdleCallback = vi.fn((callback) => {
      setTimeout(callback, 0);
      return 1;
    });

    // Mock dla window.cancelIdleCallback
    window.cancelIdleCallback = vi.fn();

    // Mock dla Performance API
    Object.defineProperty(window, "performance", {
      value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
        clearResourceTimings: vi.fn(),
        setResourceTimingBufferSize: vi.fn(),
        getResourceTimingBufferSize: vi.fn(),
        toJSON: vi.fn(),
      },
      writable: true,
    });
  }

  // Mocki wspólne dla obu środowisk
  // Mock dla WebSocket
  Object.defineProperty(global, "WebSocket", {
    value: vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1,
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
      url: "ws://localhost",
      protocol: "",
      extensions: "",
      bufferedAmount: 0,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
      binaryType: "blob",
    })),
    writable: true,
  });

  // Mock dla AbortController
  Object.defineProperty(global, "AbortController", {
    value: vi.fn().mockImplementation(() => ({
      signal: {
        aborted: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      abort: vi.fn(),
    })),
    writable: true,
  });

  // Mock dla AbortSignal
  Object.defineProperty(global, "AbortSignal", {
    value: vi.fn().mockImplementation(() => ({
      aborted: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
    writable: true,
  });

  // Mock dla TextEncoder/TextDecoder
  Object.defineProperty(global, "TextEncoder", {
    value: vi.fn().mockImplementation(() => ({
      encode: vi.fn((text) => new Uint8Array(Buffer.from(text, "utf8"))),
      encodeInto: vi.fn(),
    })),
    writable: true,
  });

  Object.defineProperty(global, "TextDecoder", {
    value: vi.fn().mockImplementation(() => ({
      decode: vi.fn((buffer) => Buffer.from(buffer).toString("utf8")),
      encoding: "utf-8",
      fatal: false,
      ignoreBOM: false,
    })),
    writable: true,
  });

  // Mock dla crypto.subtle
  Object.defineProperty(global, "crypto", {
    value: {
      subtle: {
        generateKey: vi.fn(),
        importKey: vi.fn(),
        exportKey: vi.fn(),
        sign: vi.fn(),
        verify: vi.fn(),
        encrypt: vi.fn(),
        decrypt: vi.fn(),
        digest: vi.fn(),
        deriveBits: vi.fn(),
        deriveKey: vi.fn(),
        wrapKey: vi.fn(),
        unwrapKey: vi.fn(),
      },
      getRandomValues: vi.fn((array) => {
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      }),
      randomUUID: vi.fn(() => "mocked-uuid"),
    },
    writable: true,
  });

  // Mock dla structuredClone
  Object.defineProperty(global, "structuredClone", {
    value: vi.fn((obj) => JSON.parse(JSON.stringify(obj))),
    writable: true,
  });

  // Mock dla queueMicrotask
  Object.defineProperty(global, "queueMicrotask", {
    value: vi.fn((callback) => {
      Promise.resolve().then(callback);
    }),
    writable: true,
  });

  // Mock dla setImmediate
  Object.defineProperty(global, "setImmediate", {
    value: vi.fn((callback) => {
      setTimeout(callback, 0);
    }),
    writable: true,
  });

  // Mock dla clearImmediate
  Object.defineProperty(global, "clearImmediate", {
    value: vi.fn(),
    writable: true,
  });

  // Mock dla process.nextTick
  Object.defineProperty(global.process, "nextTick", {
    value: vi.fn((callback) => {
      setTimeout(callback, 0);
    }),
    writable: true,
  });

  // Mock dla Buffer
  Object.defineProperty(global, "Buffer", {
    value: Buffer,
    writable: true,
  });

  // Mock dla process.env
  process.env.NODE_ENV = "test";

  // Uwaga: W środowisku Node.js Response, Request i Headers mogą nie być dostępne
  // ale testy serwisów powinny działać bez nich
}
