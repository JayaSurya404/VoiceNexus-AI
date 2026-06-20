import type { ErrorRequestHandler } from "express";

import { env } from "../../config/env.js";
import { AppError } from "../../shared/app-error.js";

function isMongoDuplicateError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      requestId: request.requestId,
    });
    return;
  }

  if (isMongoDuplicateError(error)) {
    response.status(409).json({
      error: {
        code: "DUPLICATE_RESOURCE",
        message: "A resource with the same unique value already exists",
      },
      requestId: request.requestId,
    });
    return;
  }

  const message =
    env.NODE_ENV === "production" ? "An unexpected error occurred" : (error as Error).message;

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
    requestId: request.requestId,
  });
};
