/**
 * Convert object to array
 * @param object - js object
 * @returns array
 */
export function objectToArray(object: any): any[] {
  const array = Object.entries(object).map(
    ([key, value]) => ({ key, value })
  );
  return array;
}