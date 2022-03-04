export type FailedJSONResult = { isValid: false; error: any };
export type ValidJSONResult = { isValid: true; value: any };

export type JSONResult = FailedJSONResult | ValidJSONResult;

/**
 * Parses a JSON string, and returns a `JSONResult`, representing whether the
 * parsing passed or failed.
 *
 * Usage:
 *
 * ```
 * const result = parseJSON(str);
 *
 * if (result.isValid) {
 *   // Do stuff with result.value
 * }
 * ```
 * @param value The JSON string to parse
 * @returns A JSONResult, representing whether parsing passed or failed
 */
export function parseJSON(value: string): JSONResult {
  try {
    return {
      isValid: true,
      value: JSON.parse(value),
    };
  } catch (e) {
    return { isValid: false, error: e };
  }
}
