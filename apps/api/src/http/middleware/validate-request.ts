import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

import { AppError } from "../../shared/app-error.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(request.body);

    if (!parsed.success) {
      next(
        new AppError(
          400,
          "VALIDATION_ERROR",
          "Request body is invalid",
          parsed.error.flatten().fieldErrors as Record<string, string[]>,
        ),
      );
      return;
    }

    request.body = parsed.data;
    request.validatedBody = parsed.data;
    next();
  };
}
