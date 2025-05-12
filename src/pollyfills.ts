// Polyfill for Node.js global objects in the browser
(window as any).process = {
  env: {}
};