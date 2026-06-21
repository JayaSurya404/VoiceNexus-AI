export class AiBrainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = "AiBrainError";
  }

  static notFound(resource: string): AiBrainError {
    return new AiBrainError("NOT_FOUND", `${resource} was not found`, 404);
  }

  static unauthorized(): AiBrainError {
    return new AiBrainError("UNAUTHORIZED", "Authentication is required", 401);
  }

  static forbidden(): AiBrainError {
    return new AiBrainError("FORBIDDEN", "You do not have access to this organization", 403);
  }

  static validation(message: string): AiBrainError {
    return new AiBrainError("VALIDATION_ERROR", message, 400);
  }
}
