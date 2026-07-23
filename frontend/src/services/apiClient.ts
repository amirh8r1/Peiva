/**
 * API Client abstraction layer.
 *
 * PHASE 1 (current): Returns mock data with simulated delay.
 * PHASE 2 (future):  Swap to real HTTP calls by changing the implementation.
 *
 * The public interface stays the same — components never know
 * whether they're talking to mock or real APIs.
 */

// Simulated network delay (ms) — set to 0 for instant responses during dev
const MOCK_DELAY_MS = 400;

function delay(ms: number = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic GET request.
 * Currently resolved from a provided mockData function.
 */
export async function get<T>(
  _url: string,
  mockData: () => T,
): Promise<T> {
  await delay();
  // In phase 2, replace with:
  // const response = await axios.get<T>(_url);
  // return response.data;
  return mockData();
}

/**
 * Generic POST request.
 */
export async function post<T, D>(
  _url: string,
  _data: D,
  mockResult: () => T,
): Promise<T> {
  await delay(600);
  return mockResult();
}

/**
 * Generic PUT request.
 */
export async function put<T, D>(
  _url: string,
  _data: D,
  mockResult: () => T,
): Promise<T> {
  await delay(600);
  return mockResult();
}

/**
 * Generic DELETE request.
 */
export async function del<T>(
  _url: string,
  mockResult: () => T,
): Promise<T> {
  await delay(400);
  return mockResult();
}
