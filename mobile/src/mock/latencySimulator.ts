const MIN_DELAY_MS = 400;
const MAX_DELAY_MS = 1200;

/**
 * simulateLatency — resolves with the given data after a simulated network delay.
 * If no delay is provided, a random value between 400ms and 1200ms is used.
 */
export function simulateLatency<T>(data: T, delay?: number): Promise<T> {
  const ms =
    delay ?? Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
  return new Promise<T>((resolve) => setTimeout(() => resolve(data), ms));
}

/**
 * simulateFailure — randomly rejects with a probability (0–1).
 * Useful for testing error states.
 */
export function simulateFailure(probability: number = 0.3): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const ms = Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1)) + MIN_DELAY_MS;
    setTimeout(() => {
      if (Math.random() < probability) {
        reject(new Error('Simulated network failure.'));
      } else {
        resolve();
      }
    }, ms);
  });
}
