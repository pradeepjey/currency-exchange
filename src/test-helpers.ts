export function jasmineExpect<T = any>(value: T): jasmine.Matchers<T> {
  return (globalThis as any).expect(value);
}