export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }

  static badRequest(code: string, message: string): AppError {
    return new AppError(400, code, message);
  }

  static unauthorized(message = "Authentication required"): AppError {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "You do not have permission for this action"): AppError {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(resource: string): AppError {
    return new AppError(404, "NOT_FOUND", `${resource} was not found`);
  }

  static conflict(code: string, message: string): AppError {
    return new AppError(409, code, message);
  }
}
