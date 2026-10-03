export function safeNext(value: string | null | undefined, fallback = "/app") {
  return value && /^\/(?!\/)/.test(value) && !/[\\\r\n]/.test(value)
    ? value
    : fallback;
}
