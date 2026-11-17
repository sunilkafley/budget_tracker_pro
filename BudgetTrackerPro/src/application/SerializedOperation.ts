// Shared within this app runtime, including separate repository/use-case instances.
const queues = new Map<string, Promise<unknown>>();
export async function serializedOperation<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const previous = queues.get(key) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);
  queues.set(key, current);
  try { return await current; }
  finally { if (queues.get(key) === current) queues.delete(key); }
}
