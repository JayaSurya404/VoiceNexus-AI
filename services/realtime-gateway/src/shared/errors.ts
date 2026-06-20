export class RealtimeError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "RealtimeError";
  }

  static unauthorized(message = "Authentication is required") {
    return new RealtimeError("UNAUTHORIZED", message, 401);
  }

  static forbidden(message = "Access denied") {
    return new RealtimeError("FORBIDDEN", message, 403);
  }

  static badRequest(code: string, message: string) {
    return new RealtimeError(code, message, 400);
  }
}
