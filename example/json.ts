export type FailedJSONResult = { isValid: false; error: any };
export type ValidJSONResult = { isValid: true; value: any };

export type JSONResult = FailedJSONResult | ValidJSONResult;

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
