import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

export function requestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const headerValue = request.header("x-request-id");
  const requestId = headerValue && headerValue.length <= 128 ? headerValue : randomUUID();

  request.requestId = requestId;
  response.setHeader("x-request-id", requestId);

  next();
}
