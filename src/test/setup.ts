// Test setup file for mocking browser APIs

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock performance.now
if (!global.performance) {
  global.performance = {
    now: () => Date.now(),
  } as Performance;
}

// Mock navigator properties
Object.defineProperty(navigator, 'hardwareConcurrency', {
  writable: true,
  value: 4,
});

// Mock canvas context for WebGL detection
HTMLCanvasElement.prototype.getContext = function(contextId: string) {
  if (contextId === 'webgl' || contextId === 'experimental-webgl') {
    return {
      // Mock WebGL context
      getParameter: () => 'Mock WebGL',
      getSupportedExtensions: () => [],
    };
  }
  return null;
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

export {};